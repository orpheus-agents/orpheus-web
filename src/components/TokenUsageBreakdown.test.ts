import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { AggregateUsage, Usage } from '../api/generated'
import { formatNumber } from '../format'
import { createTestI18n } from '../test/i18n'
import TokenUsageBreakdown from './TokenUsageBreakdown.vue'

it('draws cached input inside input and reasoning inside output for aggregate usage', () => {
  const usage: AggregateUsage = {
    input_tokens: '9007199254740993',
    cached_input_tokens: '4100000',
    output_tokens: '1940280',
    reasoning_output_tokens: '760000',
    total_tokens: '9007199256681273',
  }
  const wrapper = mount(TokenUsageBreakdown, { props: { usage, compact: true }, global: { plugins: [createTestI18n()] } })

  expect(wrapper.findAll('dt').map((item) => item.text())).toEqual(['Input', 'Cached', 'Output', 'Reasoning'])
  expect(wrapper.findAll('dd').map((item) => item.text())).toEqual(['9007.2T', '4.1M', '1.9M', '760K'])
  expect(wrapper.findAll('dd')[0].attributes('title')).toBe('9,007,199,254,740,993')
  const [input, output] = wrapper.findAll('[aria-hidden] > div')
  expect(parseFloat((input.element as HTMLElement).style.width)).toBeCloseTo(100, 3)
  expect(parseFloat((output.element as HTMLElement).style.width)).toBeCloseTo(0, 3)
  expect(input.find('div').attributes('style')).toContain('repeating-linear-gradient')
})

it('shows full numbers and zero shares in the selected locale', () => {
  const usage: Usage = { input_tokens: 3200, cached_input_tokens: 0, output_tokens: 1200, reasoning_output_tokens: 0, total_tokens: 4400 }
  const wrapper = mount(TokenUsageBreakdown, { props: { usage }, global: { plugins: [createTestI18n('ru')] } })

  expect(wrapper.findAll('dt').map((item) => item.text())).toEqual(['Ввод', 'Из кеша', 'Вывод', 'Рассуждение'])
  expect(wrapper.findAll('dd').map((item) => item.text())).toEqual([formatNumber(3200, 'ru'), '0', formatNumber(1200, 'ru'), '0'])
  expect(wrapper.findAll('dd')[0].attributes('title')).toBeUndefined()
  const [input, output] = wrapper.findAll('[aria-hidden] > div')
  expect(parseFloat((input.element as HTMLElement).style.width)).toBeCloseTo(72.73, 1)
  expect(parseFloat((output.element as HTMLElement).style.width)).toBeCloseTo(27.27, 1)
  expect((input.find('div').element as HTMLElement).style.width).toBe('0%')
})
