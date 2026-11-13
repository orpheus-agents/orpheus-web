import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { get, send } from '../api/client'
import { template, templateId } from '../test/fixtures'
import { provideToasts } from '../composables/useToasts'
import TemplateView from './TemplateView.vue'

vi.mock('../api/client', async (original) => ({ ...await original<typeof import('../api/client')>(), get: vi.fn(), send: vi.fn() }))
let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount(); vi.useRealTimers(); vi.resetAllMocks() })

it('keeps a confirmed write when an earlier poll completes late', async () => {
  vi.useFakeTimers()
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  let finishOld!: (value: ReturnType<typeof template>) => void
  let finishNew!: (value: ReturnType<typeof template>) => void
  vi.mocked(get)
    .mockResolvedValueOnce(template())
    .mockImplementationOnce(() => new Promise((resolve) => { finishOld = resolve }))
    .mockImplementationOnce(() => new Promise((resolve) => { finishNew = resolve }))
  vi.mocked(send).mockResolvedValue(template({ active: false }))
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/settings/templates/:id', name: 'template', component: TemplateView, props: true },
    { path: '/settings/templates', name: 'templates', component: { render: () => null } },
  ] })
  await router.push(`/settings/templates/${templateId}`)
  await flushPromises()
  wrapper = mount(defineComponent({ setup() { provideToasts(); return () => h(RouterView) } }), { global: { plugins: [router] } })
  await flushPromises()
  await vi.advanceTimersByTimeAsync(30_000)
  const oldSignal = vi.mocked(get).mock.calls[1]![1].signal
  await wrapper.findAll('button').find((button) => button.text() === 'Disable')!.trigger('click')
  await flushPromises()
  expect(oldSignal.aborted).toBe(true)
  expect(get).toHaveBeenCalledTimes(3)
  // Even a transport that delivers an aborted response must not restore active=true.
  finishOld(template())
  await flushPromises()
  expect(wrapper.findAll('button').some((button) => button.text() === 'Enable')).toBe(true)
  expect(wrapper.findAll('button').some((button) => button.text() === 'Disable')).toBe(false)
  finishNew(template({ active: false }))
  await flushPromises()
})
