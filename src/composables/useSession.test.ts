import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { get } from '../api/client'
import { run, session, sid, rid } from '../test/fixtures'
import { useSession } from './useSession'
import type { Run, Session } from '../api/generated'

vi.mock('../api/client', () => ({ get: vi.fn() }))
let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount(); vi.resetAllMocks() })
it('loads a known run in parallel and keeps the session and the shown run when selecting another run', async () => {
  let resolveSession!: (value: Session) => void
  let resolveRun!: (value: Run) => void
  vi.mocked(get).mockImplementation((path) => path.endsWith('/{rid}')
    ? new Promise<Run>((resolve) => { resolveRun = resolve })
    : new Promise<Session>((resolve) => { resolveSession = resolve }))
  const runID = ref<string | undefined>(rid)
  let state!: ReturnType<typeof useSession>
  wrapper = mount(defineComponent({ setup() { state = useSession(ref(sid), runID); return () => null } }))
  expect(get).toHaveBeenCalledTimes(2)
  resolveSession(session()); resolveRun(run())
  await flushPromises()
  const original = state.data.value
  const shownRun = state.run.value
  runID.value = 'another-run'
  expect(state.data.value).toBe(original)
  expect(state.run.value).toBe(shownRun)
  expect(state.runPending.value).toBe(true)
  resolveRun(run({ id: 'another-run' }))
  await flushPromises()
  expect(state.run.value?.id).toBe('another-run')
  expect(vi.mocked(get).mock.calls.filter(([path]) => path === '/api/v1/sessions/{sid}')).toHaveLength(1)
})
it('keeps the latest run loaded when its explicit URL is selected', async () => {
  vi.mocked(get).mockImplementation(async (path) => path.endsWith('/{rid}') ? run() : session())
  const runID = ref<string | undefined>()
  let state!: ReturnType<typeof useSession>
  wrapper = mount(defineComponent({ setup() { state = useSession(ref(sid), runID); return () => null } }))
  await flushPromises()
  expect(get).toHaveBeenCalledTimes(2)
  const original = state.run.value
  runID.value = rid
  await flushPromises()
  expect(state.run.value).toBe(original)
  expect(get).toHaveBeenCalledTimes(2)
})
it('does not hide an initial session failure behind an idle run loader and can retry', async () => {
  vi.mocked(get).mockRejectedValueOnce(new Error('session failed'))
    .mockImplementation(async (path) => path.endsWith('/{rid}') ? run() : session())
  let state!: ReturnType<typeof useSession>
  wrapper = mount(defineComponent({ setup() { state = useSession(ref(sid), ref(undefined)); return () => null } }))
  await flushPromises()
  expect(state.sessionPending.value).toBe(false)
  expect(state.pending.value).toBe(false)
  expect(state.error.value).toMatchObject({ message: 'session failed' })
  expect(get).toHaveBeenCalledTimes(1)
  await state.refresh()
  await flushPromises()
  expect(state.data.value?.id).toBe(sid)
  expect(state.run.value?.id).toBe(rid)
})
