import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { send } from '../api/client'
import type { CodexProfile, Profile, UpdateProfile } from '../api/generated'
import { useAccountOptions } from './useAccountOptions'
import { useCatalogMutation } from './useCatalogMutation'
import { useToasts } from './useToasts'

export function useProfileForm(record: Profile | undefined, saved: () => void) {
  const { t } = useI18n()
  const { push } = useToasts()
  const router = useRouter()
  const mutation = useCatalogMutation()
  const form = reactive({ name: record?.name ?? '', account_id: record?.account_id ?? '', description: record?.description ?? '', model: record?.model ?? '', instructions: record?.instructions ?? '', active: true, variant: record?.opencode?.variant ?? '', codex: { ...record?.codex } as CodexProfile })
  const accounts = useAccountOptions(() => form.account_id)
  const harness = computed(() => record?.harness ?? accounts.current.value?.harness)
  async function submit() {
    mutation.fieldErrors.value = {}
    for (const field of ['name', 'account_id', 'model'] as const) if (!form[field].trim()) mutation.fieldErrors.value[field] = t('catalog.required')
    if (Object.keys(mutation.fieldErrors.value).length) return
    const body = { account_id: form.account_id, description: form.description || null, model: form.model.trim(), instructions: form.instructions }
    const variant = form.variant.trim()
    const result = await mutation.run((signal) => {
      if (record) {
        // Explicit null removes an old optional setting; omission preserves it in PATCH.
        const patch: UpdateProfile = { ...body }
        if (harness.value === 'codex') patch.codex = { effort: form.codex.effort ?? null, summary: form.codex.summary ?? null, personality: form.codex.personality ?? null, service_tier: form.codex.service_tier || null }
        if (harness.value === 'opencode') patch.opencode = { variant: variant || null }
        return send('patch', '/api/v1/profiles/{id}', { signal, path: { id: record.id }, body: patch })
      }
      const codex = { ...form.codex }
      if (!codex.service_tier) delete codex.service_tier
      return send('post', '/api/v1/profiles', { signal, body: { ...body, ...(harness.value === 'codex' && { codex }), ...(harness.value === 'opencode' && variant && { opencode: { variant } }), name: form.name.trim(), active: form.active } })
    })
    if (result.ok) { push(t('catalog.saved')); if (record) saved(); else await router.push({ name: 'profile', params: { id: result.value.id } }) }
  }
  return { ...mutation, form, accounts, harness, submit }
}
