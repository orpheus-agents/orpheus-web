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
function indicator(wrapper: ReturnType<typeof mount>) {
  const element = wrapper.find('article > div > p')
  return { text: element.text(), marker: element.find('.marker').classes().find((name) => name.startsWith('bg-')), title: element.attributes('title') }
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

  const unavailable = render({ account_id: 'b', profiles: ['b'], state: AccountLimitItemState.unavailable, observed_at: null, last_attempt_at: minutesAgo(1), error_code: AccountLimitItemError_codeAnyOf0.AccountLimitItemErrorCodeTemporarilyUnavailable, buckets: [] })
  expect(indicator(unavailable)).toMatchObject({ text: 'Unavailable', marker: 'bg-danger' })
  expect(unavailable.text()).toContain('The provider or connection is temporarily unavailable. Last attempt 1 minute ago')

  const unknown = render({ account_id: 'c', profiles: ['c'], state: AccountLimitItemState.unknown, observed_at: null, last_attempt_at: null, error_code: null, buckets: [] })
  expect(indicator(unknown)).toEqual({ text: 'No observation yet', marker: 'bg-muted', title: 'No observation yet. This does not mean the quota is unused.' })
  expect(unknown.findAll('article > *')).toHaveLength(1)
})
