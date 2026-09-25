import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RelativeTime from './RelativeTime.vue'
import { createTestI18n } from '../test/i18n'

const wrappers: ReturnType<typeof mount>[] = []
function render(timestamp: string) {
  const wrapper = mount(RelativeTime, { props: { timestamp }, global: { plugins: [createTestI18n()] } })
  wrappers.push(wrapper)
  return wrapper
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-25T12:00:00Z'))
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.useRealTimers()
})
it('renders new and updated timestamps against render time between shared clock ticks', async () => {
  const existing = render(new Date().toISOString())
  await flushPromises()
  await vi.advanceTimersByTimeAsync(7000)
  const timestamp = new Date().toISOString()
  const added = render(timestamp)
  await flushPromises()
  expect(added.text()).toBe('now')
  await existing.setProps({ timestamp })
  expect(existing.text()).toBe('now')
  expect(vi.getTimerCount()).toBe(1)
  await vi.advanceTimersByTimeAsync(3000)
  expect(added.text()).toBe('3 seconds ago')
  expect(existing.text()).toBe('3 seconds ago')
})
it('preserves genuinely future quota reset times between clock ticks', async () => {
  render(new Date().toISOString())
  await flushPromises()
  await vi.advanceTimersByTimeAsync(7000)
  const reset = render(new Date(Date.now() + 60_000).toISOString())
  await flushPromises()
  expect(reset.text()).toBe('in 1 minute')
  await vi.advanceTimersByTimeAsync(3000)
  expect(reset.text()).toBe('in 57 seconds')
})
