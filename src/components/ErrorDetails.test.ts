import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import ErrorDetails from './ErrorDetails.vue'
import { provideToasts } from '../composables/useToasts'
import { ErrorPhaseAnyOf0, type Error as APIError } from '../api/generated'

afterEach(() => { vi.unstubAllGlobals() })

const problem: APIError = { code: 'harness_failed', message: 'Harness rejected initialization.', phase: ErrorPhaseAnyOf0.preparation, details: [] }

it('shows and copies the complete diagnostic ID without a link', async () => {
  const id = '10000000-0000-4000-8000-000000000001'
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  const wrapper = mount(defineComponent({
    setup() {
      provideToasts()
      return () => h(ErrorDetails, { error: { ...problem, diagnostic_id: id } })
    },
  }))
  try {
    expect(wrapper.text()).toContain(problem.message)
    expect(wrapper.text()).toContain(id)
    expect(wrapper.find('a').exists()).toBe(false)
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledExactlyOnceWith(id)
  } finally { wrapper.unmount() }
})

it.each([undefined, null])('omits the diagnostic row when the ID is %s', (id) => {
  const wrapper = mount(ErrorDetails, { props: { error: { ...problem, diagnostic_id: id } } })
  expect(wrapper.text()).toContain(problem.message)
  expect(wrapper.text()).not.toContain('Diagnostic ID')
  expect(wrapper.find('button').exists()).toBe(false)
  wrapper.unmount()
})
