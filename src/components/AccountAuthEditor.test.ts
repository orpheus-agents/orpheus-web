import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ApiError, send } from '../api/client'
import { readAuthFile, writeAuthFile } from '../api/accountAuth'
import { LLMAccountDetailsAuth_mode, LLMAccountDetailsHarness, type LlmAccountDetails } from '../api/generated'
import { createTestI18n } from '../test/i18n'
import AccountAuthEditor from './AccountAuthEditor.vue'

vi.mock('./JsonField.vue', () => ({ __esModule: true, default: { props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' } }))
vi.mock('../composables/useToasts', () => ({ useToasts: () => ({ push: vi.fn() }) }))
vi.mock('../api/accountAuth', () => ({ readAuthFile: vi.fn(), writeAuthFile: vi.fn() }))
vi.mock('../api/client', async (original) => ({ ...await original<typeof import('../api/client')>(), send: vi.fn() }))
let wrapper: ReturnType<typeof mount>
const record: LlmAccountDetails = { id: 'id', name: 'Account', harness: LLMAccountDetailsHarness.codex, auth_mode: LLMAccountDetailsAuth_mode.account, credential_store: 'main', profiles: [], active: true, api_key_mask: null }
afterEach(() => { wrapper?.unmount(); vi.resetAllMocks() })
it('loads secrets only on request and retains the draft and original ETag after a conflict', async () => {
  vi.mocked(readAuthFile).mockResolvedValue({ text: '{"access_token":"old","unknown":9007199254740993123}', etag: '"old"' })
  vi.mocked(writeAuthFile).mockRejectedValue(new ApiError(409))
  wrapper = mount(AccountAuthEditor, { props: { record }, global: { plugins: [createTestI18n()] } })
  expect(readAuthFile).not.toHaveBeenCalled()
  await wrapper.get('button').trigger('click'); await flushPromises()
  const draft = '{"access_token":"edited","unknown":9007199254740993123}'
  await wrapper.get('textarea').setValue(draft)
  await wrapper.get('form').trigger('submit'); await flushPromises()
  expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe(draft)
  expect(writeAuthFile).toHaveBeenCalledWith('id', draft, '"old"', expect.any(AbortSignal))
  expect(readAuthFile).toHaveBeenCalledTimes(1)
  vi.mocked(readAuthFile).mockResolvedValue({ text: '{"access_token":"latest"}', etag: '"latest"' })
  await wrapper.findAll('button').find((button) => button.text().startsWith('Reload'))!.trigger('click'); await flushPromises()
  vi.mocked(writeAuthFile).mockResolvedValue(undefined)
  await wrapper.get('form').trigger('submit'); await flushPromises()
  expect(writeAuthFile).toHaveBeenLastCalledWith('id', '{"access_token":"latest"}', '"latest"', expect.any(AbortSignal))
  expect(wrapper.find('textarea').exists()).toBe(false)
  expect(wrapper.emitted('saved')).toHaveLength(1)
})
it('keeps the masked API key out of the replacement field and clears a successful replacement', async () => {
  vi.mocked(send).mockResolvedValue(undefined)
  wrapper = mount(AccountAuthEditor, { props: { record: { ...record, auth_mode: LLMAccountDetailsAuth_mode.api_key, api_key_mask: 'sk-e...last' } }, global: { plugins: [createTestI18n()] } })
  expect(wrapper.text()).toContain('sk-e...last')
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
  await wrapper.get('input').setValue('new-secret')
  await wrapper.get('form').trigger('submit'); await flushPromises()
  expect(send).toHaveBeenCalledWith('put', '/api/v1/llm-accounts/{id}/api-key', expect.objectContaining({ body: { api_key: 'new-secret' } }))
  expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
})
