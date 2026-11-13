import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { get, ApiError } from '../api/client'
import { ProfileHarness, type Profiles } from '../api/generated'
import { useCatalogs } from './useCatalogs'

vi.mock('../api/client', async (original) => ({ ...await original<typeof import('../api/client')>(), get: vi.fn() }))

let wrapper: ReturnType<typeof mount>
let state: ReturnType<typeof useCatalogs>
const profiles: Profiles = { items: [{ name: 'default', description: 'Research', harness: ProfileHarness.codex, model: null, instructions: '', codex: {} }] }
function setup() {
  wrapper = mount(defineComponent({ setup() { state = useCatalogs(); return () => null } }))
}
afterEach(() => { wrapper?.unmount(); vi.resetAllMocks(); vi.useRealTimers() })

it('loads the profile catalog once for a page, refreshes descriptions and aborts on unmount', async () => {
  vi.mocked(get).mockResolvedValue(profiles)
  setup()
  await flushPromises()
  expect(get).toHaveBeenCalledTimes(1)
  expect(get).toHaveBeenCalledWith('/api/v1/profiles', expect.anything())
  expect(state.profiles.value.get('default')).toBe('Research')
  expect(state.profiles.value.get('removed')).toBeUndefined()
  vi.mocked(get).mockResolvedValue({ items: [] })
  state.refresh()
  await flushPromises()
  expect(state.profiles.value.size).toBe(0)
  const signals = vi.mocked(get).mock.calls.map((call) => call[1].signal)
  wrapper.unmount()
  expect(signals.every((signal) => signal.aborted)).toBe(true)
})

it('reports a failed refresh through the connection indicator and recovers', async () => {
  vi.mocked(get).mockRejectedValue(new ApiError(503))
  setup()
  await flushPromises()
  expect(state.profiles.value.size).toBe(0)
  expect(state.disconnected.value).toBe(true)
  vi.mocked(get).mockResolvedValue(profiles)
  state.refresh()
  await flushPromises()
  expect(state.disconnected.value).toBe(false)
  expect(state.profiles.value.get('default')).toBe('Research')
})
