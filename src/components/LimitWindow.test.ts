import { afterEach, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { AccountLimitWindow } from '../api/generated'
import { formatPercent } from '../format'
import { createTestI18n } from '../test/i18n'
import LimitWindow from './LimitWindow.vue'

const wrappers: ReturnType<typeof mount>[] = []
function render(window: AccountLimitWindow, stale = false, locale: 'en' | 'ru' = 'en') {
  const wrapper = mount(LimitWindow, { props: { window, label: 'Primary window', stale }, global: { plugins: [createTestI18n(locale)] } })
  wrappers.push(wrapper)
  return wrapper
}
// The shared clock starts from the real time, so the fixtures are relative to it.
function inSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString()
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})

it('shows what is left as the number, the bar and the meter, with the reset countdown in the corner', () => {
  const wrapper = render({ used_percent: 34, remaining_percent: 66, window_minutes: 10080, resets_at: inSeconds(5 * 86400 + 9 * 3600 + 30 * 60) })

  expect(wrapper.find('strong').text()).toBe('66%')
  expect(wrapper.find('p').text()).toBe('66%left')
  expect(wrapper.find('h4 + span').text()).toBe('Resets in 5 days 9 hr')
  expect(wrapper.find('h4 + span').attributes('title')).toContain(String(new Date().getFullYear()))
  expect(wrapper.text()).not.toContain('10080')
  const meter = wrapper.find('[role="meter"]')
  expect(meter.attributes('aria-valuenow')).toBe('66')
  expect(meter.attributes('aria-valuetext')).toBe('66% left')
  expect((meter.find('div').element as HTMLElement).style.width).toBe('66%')
  expect(meter.find('div').classes()).toContain('bg-ink')
})

it('keeps usage above 100% explicit and empties the bar', () => {
  const wrapper = render({ used_percent: 120, remaining_percent: 0, window_minutes: 300, resets_at: inSeconds(40 * 60 + 30) }, false, 'ru')

  expect(wrapper.find('strong').text()).toBe(formatPercent(0, 'ru'))
  expect(wrapper.find('.text-danger-ink').text()).toBe(`использовано ${formatPercent(120, 'ru')}`)
  expect(wrapper.find('h4 + span').text()).toBe('Сброс через 41 мин')
  expect((wrapper.find('[role="meter"] div').element as HTMLElement).style.width).toBe('0%')
  expect(wrapper.find('[role="meter"] div').classes()).toContain('bg-danger')
})

it('mutes stale values and reports a reset that already passed or is unknown', () => {
  const passed = render({ used_percent: 80, remaining_percent: 20, window_minutes: 300, resets_at: inSeconds(-2 * 3600) }, true)
  expect(passed.find('h4 + span').text()).toBe('Reset 2 hours ago')
  expect(passed.find('[role="meter"] div').classes()).toContain('bg-muted')

  const unknown = render({ used_percent: 5, remaining_percent: 95, window_minutes: null, resets_at: null })
  expect(unknown.find('h4 + span').text()).toBe('Reset time unknown')
  expect(unknown.find('h4 + span').attributes('title')).toBeUndefined()
})
