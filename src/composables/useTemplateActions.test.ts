import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { ApiError, send } from '../api/client'
import { ErrorDetailCode } from '../api/generated'
import { template, templateId } from '../test/fixtures'
import { provideToasts } from './useToasts'
import { useTemplateActions, useTemplateErrors } from './useTemplateActions'

vi.mock('../api/client', async (original) => ({ ...await original<typeof import('../api/client')>(), send: vi.fn() }))
let wrapper: ReturnType<typeof mount>
let toasts: ReturnType<typeof provideToasts>
let errors: ReturnType<typeof useTemplateErrors>
let actions: ReturnType<typeof useTemplateActions>
function setup() {
  const child = defineComponent({ setup() { errors = useTemplateErrors(); actions = useTemplateActions(); return () => null } })
  wrapper = mount(defineComponent({ setup() { toasts = provideToasts(); return () => h(child) } }))
}
import { h } from 'vue'
afterEach(() => { wrapper?.unmount(); vi.resetAllMocks() })
const rejected = (status: number, code: string, details: { path: (string | number)[]; code: ErrorDetailCode }[] = []) =>
  new ApiError(status, { code, message: 'Raw provider text', details, phase: null })

it('places AgentBox and validation errors under their fields', () => {
  setup()
  expect(errors.fields(rejected(422, 'validation_error', [
    { path: ['body', 'template_name'], code: ErrorDetailCode.template_forbidden },
    { path: ['body', 'tag'], code: ErrorDetailCode.tag_not_found },
  ]))).toEqual({ template_name: 'This template belongs to another AgentBox project.', tag: 'The template has no such tag.' })
  expect(errors.fields(rejected(422, 'validation_error', [{ path: ['body', 'tag'], code: ErrorDetailCode.tag_not_found }]), true))
    .toEqual({ tag: 'The template has no default tag. Specify a tag.' })
  expect(errors.fields(rejected(422, 'validation_error', [
    { path: ['body', 'template_name'], code: ErrorDetailCode.template_not_found },
    { path: ['body', 'tag'], code: ErrorDetailCode.invalid_value },
    { path: ['body', 'description'], code: ErrorDetailCode.invalid_value },
  ]))).toEqual({
    template_name: 'This AgentBox project has no such template.',
    tag: 'Use a tag, not a build UUID: letters, digits, “.”, “_” or “-”.',
    description: 'Up to 4096 characters.',
  })
  expect(errors.fields(rejected(409, 'template_exists'))).toEqual({ template_name: 'This template and tag are already in the catalog.' })
  expect(errors.fields(rejected(422, 'invalid_cursor', [{ path: ['query', 'cursor'], code: ErrorDetailCode.invalid_value }]))).toEqual({})
  expect(errors.fields(rejected(503, 'agentbox_unavailable'))).toEqual({})
})

it('explains failures without showing provider text', () => {
  setup()
  errors.report(rejected(503, 'agentbox_unavailable'))
  errors.report(rejected(403, 'invalid_origin'))
  errors.report(rejected(404, 'template_not_found'))
  errors.report(new TypeError('offline'))
  expect(toasts.toasts.value.map(({ message }) => message)).toEqual([
    'AgentBox is unavailable, so the template was not checked. Try again later.',
    'The browser address does not match the Orpheus public URL; the change was rejected.',
    'The template has already been deleted.',
    'Could not save the change: Check your connection and try again.',
  ])
})

it('marks a record busy while it changes and reports a failed change', async () => {
  setup()
  let finish!: (value: unknown) => void
  vi.mocked(send).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
  const pending = actions.update(templateId, { active: false })
  expect(actions.busy(templateId)).toBe(true)
  finish(template({ active: false }))
  await expect(pending).resolves.toEqual({ ok: true, value: template({ active: false }) })
  expect(actions.busy(templateId)).toBe(false)
  expect(send).toHaveBeenCalledWith('patch', '/api/v1/templates/{id}', expect.objectContaining({ path: { id: templateId }, body: { active: false } }))
  vi.mocked(send).mockRejectedValueOnce(rejected(404, 'template_not_found'))
  await expect(actions.remove(templateId)).resolves.toMatchObject({ ok: false })
  await flushPromises()
  expect(toasts.toasts.value.at(-1)?.message).toBe('The template has already been deleted.')
})
