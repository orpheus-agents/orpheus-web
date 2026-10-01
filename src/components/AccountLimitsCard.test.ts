import { afterEach, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AccountLimitItemError_codeAnyOf0, AccountLimitItemState, type AccountLimitItem } from '../api/generated'
import { createTestI18n } from '../test/i18n'
import { limits } from '../test/fixtures'
import AccountLimitsCard from './AccountLimitsCard.vue'

const wrappers: ReturnType<typeof mount>[] = []
function render(account: AccountLimitItem, locale: 'en' | 'ru' = 'en') {
  const wrapper = mount(AccountLimitsCard, { props: { account }, global: { plugins: [createTestI18n(locale)] } })
  wrappers.push(wrapper)
  return wrapper
}
// The freshness line carries the marker; a known reset count is the next line in the same corner.
function freshness(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('p').find((p) => p.find('.marker').exists())!
}
function indicator(wrapper: ReturnType<typeof mount>) {
  const element = freshness(wrapper)
  return { text: element.text(), marker: element.find('.marker').classes().find((name) => name.startsWith('bg-')), title: element.attributes('title') }
}
function resets(wrapper: ReturnType<typeof mount>) {
  const element = freshness(wrapper).element.nextElementSibling
  return element ? { text: element.textContent?.trim(), tone: [...element.classList].find((name) => name.startsWith('text-')) } : null
}
function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}
function fresh() {
  return limits().items[0]
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})

it('shows a fresh account as a green marker with the observation time only', () => {
  const wrapper = render(fresh(), 'ru')

  expect(indicator(wrapper)).toEqual({ text: '3 минуты назад', marker: 'bg-accent', title: 'Свежее наблюдение.' })
  expect(wrapper.text()).not.toContain('Наблюдение 3')
  expect(wrapper.text()).not.toContain('Свежие данные')
  expect(wrapper.findAll('[role="meter"]')).toHaveLength(2)
})

it('names stale, unavailable and unobserved accounts in the same corner', () => {
  const stale = render({ ...fresh(), state: AccountLimitItemState.stale })
  expect(indicator(stale)).toMatchObject({ text: 'Stale · 3 minutes ago', marker: 'bg-muted' })

  const unavailable = render({ account_id: 'b', profiles: ['b'], state: AccountLimitItemState.unavailable, observed_at: null, last_attempt_at: minutesAgo(1), error_code: AccountLimitItemError_codeAnyOf0.AccountLimitItemErrorCodeTemporarilyUnavailable, reset_credits_available: null, buckets: [] })
  expect(indicator(unavailable)).toMatchObject({ text: 'Unavailable', marker: 'bg-danger' })
  expect(unavailable.text()).toContain('The provider or connection is temporarily unavailable. Last attempt 1 minute ago')
  expect(resets(unavailable)).toBeNull()

  const unknown = render({ account_id: 'c', profiles: ['c'], state: AccountLimitItemState.unknown, observed_at: null, last_attempt_at: null, error_code: null, reset_credits_available: null, buckets: [] })
  expect(indicator(unknown)).toEqual({ text: 'No observation yet', marker: 'bg-muted', title: 'No observation yet. This does not mean the quota is unused.' })
  expect(unknown.findAll('article > *')).toHaveLength(1)
  expect(resets(unknown)).toBeNull()
})

it('puts a known reset count right under the freshness marker', () => {
  const wrapper = render(fresh(), 'ru')

  expect(indicator(wrapper).marker).toBe('bg-accent')
  expect(resets(wrapper)).toEqual({ text: 'Доступно 2 сброса', tone: 'text-ink' })
  expect(wrapper.find('h2 + p').text()).toBe('Профили: default, deep')
})

it.each([
  ['en', 0, '0 resets available'],
  ['en', 1, '1 reset available'],
  ['en', 2, '2 resets available'],
  ['en', 1234, '1,234 resets available'],
  ['ru', 0, 'Доступно 0 сбросов'],
  ['ru', 1, 'Доступен 1 сброс'],
  ['ru', 2, 'Доступно 2 сброса'],
  ['ru', 4, 'Доступно 4 сброса'],
  ['ru', 5, 'Доступно 5 сбросов'],
  ['ru', 11, 'Доступно 11 сбросов'],
  ['ru', 12, 'Доступно 12 сбросов'],
  ['ru', 14, 'Доступно 14 сбросов'],
  ['ru', 21, 'Доступен 21 сброс'],
  ['ru', 22, 'Доступно 22 сброса'],
  ['ru', 25, 'Доступно 25 сбросов'],
  ['ru', 111, 'Доступно 111 сбросов'],
  ['ru', 1234, 'Доступно 1\u00a0234 сброса'],
] as const)('renders %s reset count %s as %s without quota windows', (locale, count, text) => {
  const wrapper = render({ ...fresh(), reset_credits_available: count, buckets: [] }, locale)
  expect(resets(wrapper)?.text).toBe(text)
  expect(wrapper.findAll('[role="meter"]')).toHaveLength(0)
})

it('shows one reset count across profiles and buckets, retaining it when stale', () => {
  const account = fresh()
  const wrapper = render({ ...account, state: AccountLimitItemState.stale, buckets: [...account.buckets, { ...account.buckets[0], limit_id: 'other' }] })
  expect(wrapper.findAll('p').filter((p) => p.text() === '2 resets available')).toHaveLength(1)
  expect(indicator(wrapper)).toMatchObject({ text: 'Stale · 3 minutes ago', marker: 'bg-muted' })
  expect(resets(wrapper)).toEqual({ text: '2 resets available', tone: 'text-muted' })
  expect(wrapper.findAll('[role="meter"]')).toHaveLength(4)
})

it.each(['en', 'ru'] as const)('hides null reset counts and restores a confirmed zero in %s', async (locale) => {
  const wrapper = render({ ...fresh(), reset_credits_available: null }, locale)
  expect(resets(wrapper)).toBeNull()
  await wrapper.setProps({ account: fresh() })
  expect(resets(wrapper)?.text).toBe(locale === 'ru' ? 'Доступно 2 сброса' : '2 resets available')
  await wrapper.setProps({ account: { ...fresh(), reset_credits_available: null } })
  expect(resets(wrapper)).toBeNull()
  await wrapper.setProps({ account: { ...fresh(), reset_credits_available: 0 } })
  expect(resets(wrapper)?.text).toBe(locale === 'ru' ? 'Доступно 0 сбросов' : '0 resets available')
})
