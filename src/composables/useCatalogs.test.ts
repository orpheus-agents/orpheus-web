import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { get, ApiError } from '../api/client'
import { ProfileHarness, type Profiles, type Templates } from '../api/generated'
import { useCatalogs } from './useCatalogs'

vi.mock('../api/client', async (original) => ({ ...await original<typeof import('../api/client')>(), get: vi.fn() }))

let wrapper: ReturnType<typeof mount>
let state: ReturnType<typeof useCatalogs>
const profiles: Profiles = { items: [{ name: 'default', description: 'Research', harness: ProfileHarness.codex, model: null, instructions: '', codex: {} }] }
const templates: Templates = { items: [{ name: 'codex', description: 'Development tools' }] }
function setup() {
  wrapper = mount(defineComponent({ setup() { state = useCatalogs(); return () => null } }))
}
afterEach(() => { wrapper?.unmount(); vi.resetAllMocks(); vi.useRealTimers() })

it('loads each catalog once for a page, refreshes descriptions and aborts on unmount', async () => {
  vi.mocked(get).mockImplementation(async (path) => path === '/api/v1/profiles' ? profiles : templates)
  setup()
  await flushPromises()
  expect(get).toHaveBeenCalledTimes(2)
  expect(state.profiles.value.get('default')).toBe('Research')
  expect(state.templates.value.get('codex')).toBe('Development tools')
  expect(state.profiles.value.get('removed')).toBeUndefined()
  vi.mocked(get).mockResolvedValue({ items: [] })
  state.refresh()
  await flushPromises()
  expect(state.profiles.value.size).toBe(0)
  const signals = vi.mocked(get).mock.calls.map((call) => call[1].signal)
  wrapper.unmount()
  expect(signals.every((signal) => signal.aborted)).toBe(true)
})

it('keeps successful catalog data on a partial failure and recovers the shared connection indicator', async () => {
  vi.mocked(get).mockImplementation(async (path) => {
    if (path === '/api/v1/templates') throw new ApiError(503)
    return profiles
  })
  setup()
  await flushPromises()
  expect(state.profiles.value.get('default')).toBe('Research')
  expect(state.templates.value.size).toBe(0)
  expect(state.disconnected.value).toBe(true)
  state.refresh()
  await flushPromises()
  vi.mocked(get).mockResolvedValue({ items: [] })
  state.refresh()
  await flushPromises()
  expect(state.disconnected.value).toBe(false)
})
