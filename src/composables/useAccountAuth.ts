import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { readAuthFile, writeAuthFile } from '../api/accountAuth'
import { send } from '../api/client'
import { validAuthJSON } from './useAccountForm'
import { useCatalogMutation } from './useCatalogMutation'
import { useToasts } from './useToasts'

export function useAccountAuth(id: () => string, saved: () => void) {
  const { t } = useI18n()
  const { push } = useToasts()
  const mutation = useCatalogMutation()
  const opened = ref(false)
  const text = ref('')
  const etag = ref('')
  const key = ref('')
  async function load() {
    const result = await mutation.run((signal) => readAuthFile(id(), signal))
    if (result.ok) { text.value = result.value.text; etag.value = result.value.etag; opened.value = true }
  }
  async function saveFile() {
    if (!validAuthJSON(text.value)) { mutation.fieldErrors.value = { auth_file: t('accounts.invalidAuth') }; return }
    const result = await mutation.run((signal) => writeAuthFile(id(), text.value, etag.value, signal))
    if (result.ok) { text.value = ''; etag.value = ''; opened.value = false; push(t('catalog.saved')); saved() }
  }
  async function saveKey() {
    if (!key.value.trim()) { mutation.fieldErrors.value = { api_key: t('catalog.required') }; return }
    const result = await mutation.run((signal) => send('put', '/api/v1/llm-accounts/{id}/api-key', { signal, path: { id: id() }, body: { api_key: key.value } }))
    if (result.ok) { key.value = ''; push(t('catalog.saved')); saved() }
  }
  return { ...mutation, opened, text, key, load, saveFile, saveKey }
}
