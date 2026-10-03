import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { formatCompactNumber } from '../format'
import { createTestI18n } from '../test/i18n'
import { overview } from '../test/fixtures'
import AnalyticsMetrics from './AnalyticsMetrics.vue'

it('shows run statuses as a bar in the activity chart colours with a legend', () => {
  const wrapper = mount(AnalyticsMetrics, { props: { overview: overview() }, global: { plugins: [createTestI18n()] } })
  const runs = wrapper.findAll('article')[1]

  expect(runs.find('p').text()).toBe('248')
  expect(runs.findAll('dt').map((item) => item.text())).toEqual(['Completed', 'Failed', 'Cancelled', 'In progress'])
  expect(runs.findAll('dd').map((item) => item.text())).toEqual(['224', '9', '3', '12'])
  const segments = runs.findAll('[aria-hidden] > div')
  expect(segments.map((segment) => (segment.element as HTMLElement).style.background)).toEqual(
    ['ink', 'danger', 'muted', 'accent'].map((tone) => `var(--color-${tone})`),
  )
  expect(parseFloat((segments[0].element as HTMLElement).style.width)).toBeCloseTo(90.32, 1)
})

it('keeps the total tokens as the headline and the breakdown beneath it', () => {
  const wrapper = mount(AnalyticsMetrics, { props: { overview: overview() }, global: { plugins: [createTestI18n('ru')] } })
  const tokens = wrapper.findAll('article')[2]

  expect(tokens.find('p').text()).toBe(formatCompactNumber('14780500', 'ru'))
  expect(tokens.findAll('dt').map((item) => item.text())).toEqual(['Ввод', 'Из кеша', 'Вывод', 'Рассуждение'])
})
