import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { get, send } from '../api/client'
import { createFileAccount } from '../api/accountAuth'
import { CreateLLMAccountAuth_mode, CreateLLMAccountHarness, type LlmAccountDetails } from '../api/generated'
import { useCatalogMutation } from './useCatalogMutation'
import { useResource } from './useResource'
import { useToasts } from './useToasts'

export function validAuthJSON(text: string) {
  if (new TextEncoder().encode(text).length > 1024 * 1024) return false
  try { const value: unknown = JSON.parse(text); return value !== null && typeof value === 'object' && !Array.isArray(value) } catch { return false }
}
export function useAccountForm(record: LlmAccountDetails | undefined, saved: () => void) {
  const { t } = useI18n()
  const { push } = useToasts()
  const router = useRouter()
  const mutation = useCatalogMutation()
  const form = reactive({ name: record?.name ?? '', harness: CreateLLMAccountHarness.codex, auth_mode: CreateLLMAccountAuth_mode.account, active: true, provider: '', credential_store: '', auth_file: '', api_key: '' })
  const needsProvider = computed(() => !record && form.harness === CreateLLMAccountHarness.opencode && form.auth_mode === CreateLLMAccountAuth_mode.api_key)
  const stores = useResource((signal) => get('/api/v1/credential-stores', { signal }), () => record ? null : 'credential-stores', { interval: 30_000 })
  async function submit() {
    mutation.fieldErrors.value = {}
    if (!form.name.trim()) mutation.fieldErrors.value.name = t('catalog.required')
    if (!record && form.auth_mode === CreateLLMAccountAuth_mode.account) {
      if (!form.credential_store) mutation.fieldErrors.value.credential_store = t('catalog.required')
      if (!validAuthJSON(form.auth_file)) mutation.fieldErrors.value.auth_file = t('accounts.invalidAuth')
    }
    if (needsProvider.value && !form.provider.trim()) mutation.fieldErrors.value.provider = t('catalog.required')
    if (!record && form.auth_mode === CreateLLMAccountAuth_mode.api_key && !form.api_key.trim()) mutation.fieldErrors.value.api_key = t('catalog.required')
    if (Object.keys(mutation.fieldErrors.value).length) return
    const result = await mutation.run((signal) => {
      if (record) return send('patch', '/api/v1/llm-accounts/{id}', { signal, path: { id: record.id }, body: { name: form.name.trim() } })
      const body = { name: form.name.trim(), harness: form.harness, auth_mode: form.auth_mode, active: form.active }
      return form.auth_mode === CreateLLMAccountAuth_mode.account
        ? createFileAccount({ ...body, credential_store: form.credential_store }, form.auth_file, signal)
        : send('post', '/api/v1/llm-accounts', { signal, body: { ...body, ...(needsProvider.value && { provider: form.provider.trim() }), api_key: form.api_key } })
    })
    if (result.ok) {
      form.api_key = ''; form.auth_file = ''
      push(t('catalog.saved'))
      if (record) saved()
      else await router.push({ name: 'account', params: { id: result.value.id } })
    }
  }
  return { ...mutation, form, needsProvider, stores, submit }
}
