import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Segment } from '../charts/palette'
import StackedBar from './StackedBar.vue'

const segments: Segment[] = [
  { key: 'input', tone: 'ink', label: 'Input', value: 12_840_220, display: '12.8M', title: '12,840,220', nested: { label: 'Cached', value: 4_100_000, display: '4.1M' } },
  { key: 'output', tone: 'accent', label: 'Output', value: 1_940_280, display: '1.9M', nested: { label: 'Reasoning', value: 760_000, display: '760K' } },
]
function widths(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[aria-hidden] > div').map((segment): [number, number[]] => [
    parseFloat((segment.element as HTMLElement).style.width),
    segment.findAll('div').map((nested) => parseFloat((nested.element as HTMLElement).style.width)),
  ])
}

it('sizes segments against the total and nested shares against their parent', () => {
  const wrapper = mount(StackedBar, { props: { segments, total: 14_780_500 } })
  const [input, output] = widths(wrapper)

  expect(input[0]).toBeCloseTo(86.87, 1)
  expect(input[1][0]).toBeCloseTo(31.93, 1)
  expect(output[0]).toBeCloseTo(13.13, 1)
  expect(output[1][0]).toBeCloseTo(39.17, 1)
  expect(wrapper.find('[aria-hidden] > div').attributes('style')).toContain('rgb(var(--color-ink))')
  expect(wrapper.find('[aria-hidden] > div > div').attributes('style')).toContain('repeating-linear-gradient')
})

it('lists every share with its marker, value and full-number title', () => {
  const wrapper = mount(StackedBar, { props: { segments, total: 14_780_500 } })

  expect(wrapper.findAll('dt').map((item) => item.text())).toEqual(['Input', 'Cached', 'Output', 'Reasoning'])
  expect(wrapper.findAll('dd').map((item) => item.text())).toEqual(['12.8M', '4.1M', '1.9M', '760K'])
  expect(wrapper.findAll('dd')[0].attributes('title')).toBe('12,840,220')
  expect(wrapper.findAll('dt .marker')).toHaveLength(4)
})

it('never draws a nested share wider than its parent, or segments wider than the bar', () => {
  const wrapper = mount(StackedBar, {
    props: {
      total: 1000,
      segments: [
        { key: 'a', tone: 'ink', label: 'A', value: 900, display: '900', nested: { label: 'A part', value: 1200, display: '1,200' } },
        { key: 'b', tone: 'accent', label: 'B', value: 600, display: '600' },
      ],
    },
  })
  const [a, b] = widths(wrapper)

  expect(a[0]).toBeCloseTo(60, 5)
  expect(a[1][0]).toBe(100)
  expect(b[0]).toBeCloseTo(40, 5)
})

it('keeps an empty bar and zero legend values when nothing was recorded', () => {
  const wrapper = mount(StackedBar, {
    props: { total: 0, segments: [{ key: 'a', tone: 'ink', label: 'A', value: 0, display: '0', nested: { label: 'A part', value: 0, display: '0' } }] },
  })

  expect(widths(wrapper)).toEqual([[0, [0]]])
  expect(wrapper.findAll('dd').map((item) => item.text())).toEqual(['0', '0'])
})

it('sizes decimal-string aggregate counters without converting them to floating point', () => {
  const quarter = BigInt(`1${'0'.repeat(310)}`)
  const wrapper = mount(StackedBar, {
    props: {
      total: String(quarter * 4n),
      segments: [
        { key: 'input', tone: 'ink', label: 'Input', value: String(quarter), display: '1' },
        { key: 'output', tone: 'accent', label: 'Output', value: String(quarter * 3n), display: '3' },
      ],
    },
  })

  expect(widths(wrapper)).toEqual([[25, []], [75, []]])
})

it('can stand alone without a legend', () => {
  const wrapper = mount(StackedBar, { props: { segments, total: 14_780_500, legend: false } })

  expect(wrapper.findAll('[aria-hidden] > div')).toHaveLength(2)
  expect(wrapper.find('dl').exists()).toBe(false)
})
