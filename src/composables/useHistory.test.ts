import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { useHistory } from './useHistory'
import { ApiError, get } from '../api/client'
import { streamEvents } from '../api/stream'
import { MessageEventType, MessageItemType, type HistoryPage } from '../api/generated'
import { history, message, rid, sid, timestamp } from '../test/fixtures'
import { HistorySnapshotExpired } from '../events/history'

vi.mock('../api/client', async (original) => ({ ...(await original<typeof import('../api/client')>()), get: vi.fn() }))
vi.mock('../api/stream', () => ({ streamEvents: vi.fn() }))
const fetchPage = vi.mocked(get)
const streams = vi.mocked(streamEvents)
let wrapper: ReturnType<typeof mount>
let state: ReturnType<typeof useHistory>
const sessionID = ref(sid),
  runID = ref(rid)
function start() {
  wrapper = mount(
    defineComponent({
      setup() {
        state = useHistory(sessionID, runID, vi.fn())
        return () => null
      },
    }),
  )
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.resetAllMocks()
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  sessionID.value = sid
  runID.value = rid
  streams.mockImplementation(async (_sid, _cursor, signal, _receive, connected) => {
    connected()
    await new Promise<void>((_resolve, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
    )
  })
})
afterEach(() => {
  wrapper?.unmount()
  vi.useRealTimers()
})
it('merges a live update ahead of a delayed page and resumes from its exact cursor after visibility changes', async () => {
  let resolvePage!: (value: HistoryPage) => void
  fetchPage
    .mockResolvedValueOnce({ ...history(), items: [], next_cursor: 'second', event_cursor: '9007199254740992' })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve
        }),
    )
  start()
  await flushPromises()
  const pending = state.more()
  streams.mock.calls[0][3]({
    id: '9007199254740994',
    session_id: sid,
    created_at: timestamp,
    type: MessageEventType.message_updated,
    data: message({ text: 'newest' }),
  })
  resolvePage(history())
  await pending
  expect(state.items.value.find((i) => i.type === MessageItemType.message && i.message.text === 'newest')).toBeDefined()
  Object.defineProperty(document, 'hidden', { value: true, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
  expect(streams.mock.calls[0][2].aborted).toBe(true)
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
  await flushPromises()
  expect(streams.mock.calls[1][1]).toBe('9007199254740994')
  expect(fetchPage).toHaveBeenCalledTimes(2)
})
it('aborts the old run stream and page and discards their late callbacks on route changes', async () => {
  let resolvePage!: (value: HistoryPage) => void
  fetchPage
    .mockResolvedValueOnce({ ...history(), next_cursor: 'second' })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve
        }),
    )
    .mockResolvedValueOnce({ items: [], event_cursor: '20', next_cursor: null })
  start()
  await flushPromises()
  const pending = state.more()
  runID.value = 'other-run'
  await flushPromises()
  expect(streams.mock.calls[0][2].aborted).toBe(true)
  expect(fetchPage.mock.calls[1][1].signal.aborted).toBe(true)
  resolvePage(history())
  await pending
  streams.mock.calls[0][3]({
    id: '25',
    session_id: sid,
    created_at: timestamp,
    type: MessageEventType.message_updated,
    data: message(),
  })
  expect(state.items.value).toEqual([])
  wrapper.unmount()
  await flushPromises()
  expect(streams.mock.calls[1][2].aborted).toBe(true)
  expect(vi.getTimerCount()).toBe(0)
})
it('renews an invalid stream cursor and releases an outstanding page request', async () => {
  let rejectStream!: (error: unknown) => void
  fetchPage
    .mockResolvedValueOnce({ ...history(), next_cursor: 'second' })
    .mockImplementationOnce(() => new Promise(() => {}))
    .mockResolvedValueOnce({ ...history(), next_cursor: 'renewed-second', event_cursor: '30' })
    .mockResolvedValueOnce({ ...history(), event_cursor: '30' })
  streams.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        rejectStream = reject
      }),
  )
  start()
  await flushPromises()
  void state.more()
  rejectStream(new ApiError(422))
  await flushPromises()
  expect(fetchPage.mock.calls[1][1].signal.aborted).toBe(true)
  expect(state.loadingMore.value).toBe(false)
  await vi.advanceTimersByTimeAsync(2000)
  expect(streams.mock.calls[1][1]).toBe('30')
  await state.more()
  expect(fetchPage).toHaveBeenCalledTimes(4)
  expect(state.error.value).toBe(null)
})
it('resets reconnect backoff after successful connections without hiding page failures', async () => {
  const failures: ((cause: unknown) => void)[] = []
  fetchPage.mockResolvedValueOnce({ items: [], next_cursor: 'next', event_cursor: '10' })
    .mockRejectedValueOnce(new Error('page failed'))
  streams.mockImplementation(async (_sid, _cursor, _signal, _receive, connected) => {
    connected()
    await new Promise<void>((_resolve, reject) => failures.push(reject))
  })
  start()
  await flushPromises()
  for (let count = 1; count <= 6; count++) {
    failures[count - 1](new Error('disconnected'))
    await flushPromises()
    expect(state.disconnected.value).toBe(true)
    expect(state.error.value).toBeNull()
    await vi.advanceTimersByTimeAsync(1999)
    expect(streams).toHaveBeenCalledTimes(count)
    await vi.advanceTimersByTimeAsync(1)
    expect(streams).toHaveBeenCalledTimes(count + 1)
    expect(state.disconnected.value).toBe(false)
  }
  await state.more()
  failures[6](new Error('disconnected'))
  await flushPromises()
  await vi.advanceTimersByTimeAsync(2000)
  expect(state.error.value).toMatchObject({ message: 'page failed' })
  expect(fetchPage).toHaveBeenCalledTimes(2)
})
it('shows initial snapshot failures as page errors and renews a typed buffer overflow', async () => {
  fetchPage.mockRejectedValueOnce(new Error('snapshot failed')).mockResolvedValue(history())
  streams.mockRejectedValueOnce(new HistorySnapshotExpired())
  start()
  await flushPromises()
  expect(state.error.value).toMatchObject({ message: 'snapshot failed' })
  await vi.advanceTimersByTimeAsync(2000)
  expect(state.error.value).toBeNull()
  await vi.advanceTimersByTimeAsync(4000)
  expect(fetchPage).toHaveBeenCalledTimes(3)
  expect(state.disconnected.value).toBe(false)
})
