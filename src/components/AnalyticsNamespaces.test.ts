import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '../test/i18n'
import { overview } from '../test/fixtures'
import AnalyticsNamespaces from './AnalyticsNamespaces.vue'

type Widget = ReturnType<ReturnType<typeof mount>['findAll']>[number]
function cell(widget: Widget, index: number) {
  return widget.findAll('li').map((row) => row.find('div').element.children[index])
}
function texts(widget: Widget, index: number) {
  return cell(widget, index).map((element) => element.textContent?.trim())
}
function widths(wrapper: ReturnType<typeof mount>, widget: number) {
  return wrapper.findAll('article')[widget].findAll('li').map((row) =>
    row.findAll('[aria-hidden] > div').map((segment) => parseFloat((segment.element as HTMLElement).style.width)),
  )
}

it('ranks namespaces in each widget by its own measure and scales bars to the largest row', () => {
  const wrapper = mount(AnalyticsNamespaces, { props: { overview: overview() }, global: { plugins: [createTestI18n()] } })
  const [runs, tokens, runtime] = wrapper.findAll('article')

  expect(wrapper.findAll('article h2').map((item) => item.text())).toEqual(['Runs by namespace', 'Tokens by namespace', 'Run time by namespace'])
  expect(texts(runs, 0)).toEqual(['engineering', 'support', 'No namespace'])
  expect(texts(runs, 1)).toEqual(['160', '80', '8'])
  expect(texts(tokens, 0)).toEqual(['support', 'engineering', 'No namespace'])
  expect(texts(tokens, 1)).toEqual(['10.3M', '4.1M', '380.5K'])
  expect(cell(tokens, 1)[0].getAttribute('title')).toBe('10,300,000')
  expect(texts(runtime, 0)).toEqual(['support', 'engineering', 'No namespace'])
  expect(texts(runtime, 1)).toEqual(['1 day 9 hr', '13 hr 53 min', '1 hr 47 min'])
  expect(widths(wrapper, 0).map((row) => row.reduce((sum, value) => sum + value, 0))).toEqual([100, 50, 5])
  expect(widths(wrapper, 2).map((row) => row[0])).toEqual([100, expect.closeTo(41.67, 1), expect.closeTo(5.38, 1)])
  expect(runs.find('li').attributes('title')).toBe('Completed 146 · Failed 6 · Cancelled 2 · In progress 6')
  expect(tokens.find('li').attributes('title')).toBe('Input 9M · Cached 3M · Output 1.3M · Reasoning 500K')
  expect(tokens.find('li [aria-hidden] > div > div').attributes('style')).toContain('repeating-linear-gradient')
  expect(wrapper.findAll('dl')).toHaveLength(0)
})

it('offers each named namespace as the page filter', async () => {
  const wrapper = mount(AnalyticsNamespaces, { props: { overview: overview() }, global: { plugins: [createTestI18n('ru')] } })
  const button = wrapper.find('article:nth-child(2) li button')

  expect(button.text()).toBe('support')
  expect(button.attributes('aria-label')).toBe('Показать только support')
  await button.trigger('click')
  expect(wrapper.emitted('select')).toEqual([['support']])
  expect(wrapper.findAll('article:first-child li button')).toHaveLength(2)
  expect(wrapper.find('article:first-child li:last-child span').text()).toBe('Без пространства имён')
})

it('shows an empty state for a period without runs', () => {
  const data = overview()
  data.namespaces = []
  const wrapper = mount(AnalyticsNamespaces, { props: { overview: data }, global: { plugins: [createTestI18n()] } })

  expect(wrapper.findAll('article')).toHaveLength(0)
  expect(wrapper.text()).toContain('No runs in this period')
})
