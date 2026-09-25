import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { get } from '../api/client'
import { RunStatus, type operations } from '../api/generated'
import { useSessions } from './useSessions'

vi.mock('../api/client', () => ({ get: vi.fn() }))
let wrapper: ReturnType<typeof mount>
let state: ReturnType<typeof useSessions>
const screen = defineComponent({ setup() { state = useSessions(); return () => null } })
async function start(url: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/sessions', name: 'sessions', component: screen }] })
  await router.push(url)
  await flushPromises()
  wrapper = mount(defineComponent({ render: () => h(RouterView) }), { global: { plugins: [router] } })
  await flushPromises()
  return router
}
const query = () => vi.mocked(get).mock.calls.at(-1)![1].query! as NonNullable<operations['list_sessions']['parameters']['query']>
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-25T12:00:00Z'))
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  vi.mocked(get).mockResolvedValue({ items: [], next_cursor: 'next' })
})
afterEach(() => { wrapper?.unmount(); vi.useRealTimers(); vi.resetAllMocks() })
it.each(['24h', '7d', '30d'])('rolls %s on polling and reload while pinning cursors to the successful page window', async (period) => {
  const router = await start(`/sessions?activity=inactive&period=${period}`)
  const first = { ...query() }
  await vi.advanceTimersByTimeAsync(5000)
  const second = { ...query() }
  expect(Date.parse(second.last_run_created_to as string) - Date.parse(first.last_run_created_to as string)).toBe(5000)
  await state.page('next')
  await flushPromises()
  expect(router.currentRoute.value.query).not.toHaveProperty('from')
  expect(router.currentRoute.value.query.at).toBe(second.last_run_created_to)
  expect(query()).toMatchObject({ cursor: 'next', last_run_created_from: second.last_run_created_from, last_run_created_to: second.last_run_created_to })
  await vi.advanceTimersByTimeAsync(5000)
  expect(query().last_run_created_to).toBe(second.last_run_created_to)
  const pinnedURL = router.currentRoute.value.fullPath
  wrapper.unmount()
  vi.setSystemTime(new Date('2026-09-26T12:00:00Z'))
  await start(pinnedURL)
  expect(query().last_run_created_to).toBe(second.last_run_created_to)
  await state.page()
  await flushPromises()
  expect(query().last_run_created_to).toBe('2026-09-26T12:00:00.000Z')
  wrapper.unmount()
  await start(`/sessions?activity=inactive&period=${period}`)
  expect(query().last_run_created_to).toBe('2026-09-26T12:00:00.000Z')
})
it('keeps absolute dates only for custom periods and current sessions offer only active statuses', async () => {
  const router = await start('/sessions?activity=inactive&period=custom&from=2026-09-01T00:00:00Z&to=2026-09-02T00:00:00Z')
  const first = { ...query() }
  await vi.advanceTimersByTimeAsync(5000)
  expect(query()).toEqual(first)
  state.filters.period = '24h'
  state.changePeriod()
  await flushPromises()
  expect(router.currentRoute.value.query).not.toHaveProperty('from')
  expect(router.currentRoute.value.query).not.toHaveProperty('to')
  await router.push('/sessions?status=completed')
  await flushPromises()
  expect(state.statuses.value).toEqual([RunStatus.accepted, RunStatus.starting, RunStatus.running, RunStatus.cancelling, RunStatus.finalizing])
  expect(query().status).toBeUndefined()
  expect(query().last_run_created_from).toBeUndefined()
})
it('offers only terminal statuses for past sessions and ignores incompatible URL statuses', async () => {
  const router = await start('/sessions?activity=inactive&status=running')
  expect(state.statuses.value).toEqual([RunStatus.completed, RunStatus.failed, RunStatus.cancelled])
  expect(state.filters.status).toBe('')
  expect(query().status).toBeUndefined()
  for (const status of [RunStatus.completed, RunStatus.failed, RunStatus.cancelled]) {
    await router.push(`/sessions?activity=inactive&status=${status}`)
    await flushPromises()
    expect(state.filters.status).toBe(status)
    expect(query().status).toBe(status)
  }
})
