import { afterEach, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { RunStatus, SandboxStateState } from '../api/generated'
import { session } from '../test/fixtures'
import { createTestI18n } from '../test/i18n'
import SessionInfo from './SessionInfo.vue'

let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount() })

it.each([
  { locale: 'en', multiple: false, title: 'Session mode', label: 'Single run' },
  { locale: 'en', multiple: true, title: 'Session mode', label: 'Can continue' },
  { locale: 'ru', multiple: false, title: 'Режим сессии', label: 'Один запуск' },
  { locale: 'ru', multiple: true, title: 'Режим сессии', label: 'Можно продолжать' },
] as const)('shows the session policy for $locale, multiple=$multiple', ({ locale, multiple, title, label }) => {
  wrapper = mount(SessionInfo, {
    props: { session: session({ allow_multiple_runs: multiple }) },
    global: { plugins: [createTestI18n(locale)], stubs: { CopyButton: true } },
  })
  const mode = wrapper.findAll('dt').find((term) => term.text() === title)
  expect(mode?.element.nextElementSibling?.textContent).toBe(label)
})

it('retains the single-run mode while sandbox deletion fails and then completes', async () => {
  const data = session({ allow_multiple_runs: false, status: RunStatus.completed, active_run_id: null })
  data.sandbox.state = SandboxStateState.deleting
  data.sandbox.error = { code: 'sandbox_delete_failed', message: 'Deletion will be retried', phase: null, details: [] }
  wrapper = mount(SessionInfo, {
    props: { session: data },
    global: { plugins: [createTestI18n('en')], stubs: { CopyButton: true } },
  })
  expect(wrapper.text()).toContain('Single run')
  expect(wrapper.text()).toContain('Deleting')
  expect(wrapper.text()).toContain('Deletion will be retried')

  await wrapper.setProps({ session: { ...data, sandbox: { ...data.sandbox, state: SandboxStateState.deleted, error: null } } })
  expect(wrapper.text()).toContain('Single run')
  expect(wrapper.text()).toContain('Deleted')
  expect(wrapper.text()).not.toContain('Deletion will be retried')
})
