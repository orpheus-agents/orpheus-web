import { onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { send } from '../api/client'
import { useTemplateErrors, type TemplateField } from './useTemplateActions'
import { useToasts } from './useToasts'

/** Registers a template: AgentBox checks the name and tag before the record is created. */
export function useTemplateForm() {
  const { t } = useI18n()
  const router = useRouter()
  const { push } = useToasts()
  const errors = useTemplateErrors()
  const form = reactive({ template_name: '', tag: '', description: '', active: true })
  const fieldErrors = ref<Partial<Record<TemplateField, string>>>({})
  const pending = ref(false)
  const controller = new AbortController()
  onUnmounted(() => controller.abort())
  async function submit() {
    if (pending.value) return
    fieldErrors.value = {}
    if (!form.template_name.trim()) {
      fieldErrors.value = { template_name: t('templates.errors.required') }
      return
    }
    pending.value = true
    const tag = form.tag.trim()
    try {
      const created = await send('post', '/api/v1/templates', {
        signal: controller.signal,
        body: { template_name: form.template_name.trim(), tag: tag || null, description: form.description || null, active: form.active },
      })
      push(t('templates.created', { name: created.name }))
      await router.push({ name: 'template', params: { id: created.id } })
    } catch (error) {
      if (controller.signal.aborted) return
      fieldErrors.value = errors.fields(error, !tag)
      if (!Object.keys(fieldErrors.value).length) errors.report(error)
    } finally {
      pending.value = false
    }
  }
  return { form, fieldErrors, pending, submit }
}
