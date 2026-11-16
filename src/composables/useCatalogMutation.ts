import { onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ApiError } from '../api/client'
import { useToasts } from './useToasts'

export function useCatalogMutation() {
  const pending = ref(false)
  const fieldErrors = ref<Record<string, string>>({})
  const { t } = useI18n()
  const { push } = useToasts()
  const controller = new AbortController()
  onUnmounted(() => controller.abort())
  async function run<T>(write: (signal: AbortSignal) => Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
    if (pending.value) return { ok: false }
    fieldErrors.value = {}
    pending.value = true
    try {
      const value = await write(controller.signal)
      return controller.signal.aborted ? { ok: false } : { ok: true, value }
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error instanceof ApiError && error.status === 422) {
          for (const detail of error.problem?.details ?? []) {
            if (detail.path[0] === 'body' && typeof detail.path[1] === 'string') fieldErrors.value[detail.path[1]] = t('catalog.invalidField')
          }
        }
        if (error instanceof ApiError && error.problem?.code === 'profile_exists') fieldErrors.value.name = t('profiles.exists')
        if (!Object.keys(fieldErrors.value).length) {
          if (error instanceof ApiError && error.problem?.code === 'account_in_use') push(t('accounts.inUse'))
          else if (error instanceof ApiError && error.status === 409) push(t('accounts.authConflict'))
          else push(t('catalog.failed', { message: error instanceof ApiError ? error.message : t('common.retryHint') }))
        }
      }
      return { ok: false }
    } finally {
      pending.value = false
    }
  }
  return { pending, fieldErrors, run }
}
