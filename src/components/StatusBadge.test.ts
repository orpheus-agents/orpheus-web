import { afterEach, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { SandboxStateState } from '../api/generated'
import { createTestI18n } from '../test/i18n'
import StatusBadge from './StatusBadge.vue'

const wrappers: ReturnType<typeof mount>[] = []
function badge(value: SandboxStateState) {
  const wrapper = mount(StatusBadge, { props: { value }, global: { plugins: [createTestI18n('ru')] } })
  wrappers.push(wrapper)
  return { label: wrapper.text(), marker: wrapper.find('.marker').classes().find((name) => name.startsWith('bg-')) }
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})

// Every sandbox state needs a deliberate tone: a new API value fails type checking here.
const tones = {
  [SandboxStateState.not_created]: 'bg-muted',
  [SandboxStateState.provisioning]: 'bg-accent',
  [SandboxStateState.ready]: 'bg-ink',
  [SandboxStateState.pausing]: 'bg-accent',
  [SandboxStateState.paused]: 'bg-muted',
  [SandboxStateState.resuming]: 'bg-accent',
  [SandboxStateState.deleting]: 'bg-accent',
  [SandboxStateState.deleted]: 'bg-muted',
  [SandboxStateState.unavailable]: 'bg-danger',
} satisfies Record<SandboxStateState, string>

it.each(Object.entries(tones))('marks sandbox state %s with %s', (state, marker) => {
  expect(badge(state as SandboxStateState).marker).toBe(marker)
})

it('names deletion states of single-run sandboxes', () => {
  expect(badge(SandboxStateState.deleting)).toEqual({ label: 'Удаляется', marker: 'bg-accent' })
  expect(badge(SandboxStateState.deleted)).toEqual({ label: 'Удалена', marker: 'bg-muted' })
})
