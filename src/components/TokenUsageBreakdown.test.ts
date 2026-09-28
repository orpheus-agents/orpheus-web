import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { AggregateUsage, Usage } from '../api/generated'
import { createTestI18n } from '../test/i18n'
import TokenUsageBreakdown from './TokenUsageBreakdown.vue'

it('shows cached input within input and reasoning within output for aggregate usage', () => {
  const usage: AggregateUsage = {
    input_tokens: '9007199254740993',
    cached_input_tokens: '4100000',
    output_tokens: '1940280',
    reasoning_output_tokens: '760000',
    total_tokens: '9007199256681273',
  }
  const wrapper = mount(TokenUsageBreakdown, { props: { usage, compact: true }, global: { plugins: [createTestI18n()] } })
  const rows = wrapper.findAll('dl > div')

  expect(rows.map((row) => row.find('dt').text())).toEqual(['Input', 'Of which cached', 'Output', 'Of which reasoning'])
  expect(rows[0].find('dd').attributes('title')).toBe('9,007,199,254,740,993')
  expect(rows[1].find('dd').text()).toBe('4.1M')
  expect(rows[3].find('dd').text()).toBe('760K')
})

it('shows zero breakdown values in the selected locale', () => {
  const usage: Usage = { input_tokens: 3200, cached_input_tokens: 0, output_tokens: 1200, reasoning_output_tokens: 0, total_tokens: 4400 }
  const wrapper = mount(TokenUsageBreakdown, { props: { usage }, global: { plugins: [createTestI18n('ru')] } })
  const rows = wrapper.findAll('dl > div')

  expect(rows.map((row) => row.find('dt').text())).toEqual(['Ввод', 'Из них кешировано', 'Вывод', 'Из них на рассуждение'])
  expect(rows.map((row) => row.find('dd').text())).toEqual(['3 200', '0', '1 200', '0'])
})
