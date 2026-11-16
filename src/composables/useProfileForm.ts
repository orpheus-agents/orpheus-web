import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { send } from '../api/client'
import type { CodexProfile, Profile, UpdateProfile } from '../api/generated'
import { useCatalogMutation } from './useCatalogMutation'
import { useToasts } from './useToasts'

export function useProfileForm(record: Profile | undefined, saved: () => void) {
  const { t } = useI18n()
  const { push } = useToasts()
  const router = useRouter()
  const mutation = useCatalogMutation()
  const form = reactive({ name: record?.name ?? '', account_id: record?.account_id ?? '', description: record?.description ?? '', model: record?.model ?? '', instructions: record?.instructions ?? '', active: true, codex: { ...record?.codex } as CodexProfile })
  async function submit() {
    mutation.fieldErrors.value = {}
    for (const field of ['name', 'account_id', 'model'] as const) if (!form[field].trim()) mutation.fieldErrors.value[field] = t('catalog.required')
    if (Object.keys(mutation.fieldErrors.value).length) return
    const body = { account_id: form.account_id, description: form.description || null, model: form.model.trim(), instructions: form.instructions, codex: { ...form.codex } }
    const result = await mutation.run((signal) => {
      if (record) {
        // Explicit null removes an old optional setting; omission preserves it in PATCH.
        const patch: UpdateProfile = { ...body, codex: { effort: body.codex.effort ?? null, summary: body.codex.summary ?? null, personality: body.codex.personality ?? null, service_tier: body.codex.service_tier || null } }
        return send('patch', '/api/v1/profiles/{id}', { signal, path: { id: record.id }, body: patch })
      }
      if (!body.codex.service_tier) delete body.codex.service_tier
      return send('post', '/api/v1/profiles', { signal, body: { ...body, name: form.name.trim(), active: form.active } })
    })
    if (result.ok) { push(t('catalog.saved')); if (record) saved(); else await router.push({ name: 'profile', params: { id: result.value.id } }) }
  }
  return { ...mutation, form, submit }
}
