import { onUnmounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ApiError, send } from '../api/client'
import { ErrorDetailCode, type Template, type UpdateTemplate } from '../api/generated'
import { useToasts } from './useToasts'

export type TemplateField = 'template_name' | 'tag' | 'description'
const FIELDS: readonly TemplateField[] = ['template_name', 'tag', 'description']

/** Explains a rejected write next to the field it concerns; anything else becomes a toast. */
export function useTemplateErrors() {
  const { t } = useI18n()
  const { push } = useToasts()
  function fieldMessage(field: TemplateField, code: ErrorDetailCode, untagged: boolean) {
    if (code === ErrorDetailCode.required) return t('templates.errors.required')
    if (code === ErrorDetailCode.template_not_found) return t('templates.errors.templateNotFound')
    if (code === ErrorDetailCode.template_forbidden) return t('templates.errors.templateForbidden')
    if (code === ErrorDetailCode.tag_not_found) return untagged ? t('templates.errors.defaultNotFound') : t('templates.errors.tagNotFound')
    if (field === 'template_name') return t('templates.errors.invalidName')
    if (field === 'tag') return t('templates.errors.invalidTag')
    return t('templates.errors.invalidDescription')
  }
  function fields(error: unknown, untagged = false): Partial<Record<TemplateField, string>> {
    if (!(error instanceof ApiError)) return {}
    if (error.problem?.code === 'template_exists') return { template_name: t('templates.errors.exists') }
    if (error.status !== 422) return {}
    const out: Partial<Record<TemplateField, string>> = {}
    for (const detail of error.problem?.details ?? []) {
      const field = FIELDS.find((name) => detail.path[0] === 'body' && detail.path[1] === name)
      if (field && !out[field]) out[field] = fieldMessage(field, detail.code, untagged)
    }
    return out
  }
  function report(error: unknown) {
    if (error instanceof ApiError && error.problem?.code === 'agentbox_unavailable') push(t('templates.errors.agentboxUnavailable'))
    else if (error instanceof ApiError && error.status === 404) push(t('templates.errors.gone'))
    else if (error instanceof ApiError && error.problem?.code === 'invalid_origin') push(t('templates.errors.origin'))
    else push(t('templates.errors.failed', { message: error instanceof ApiError ? error.message : t('common.retryHint') }))
  }
  return { fields, report }
}

/** Updates and deletions of catalog records; several records may change at once, each only once at a time. */
export function useTemplateActions() {
  const errors = useTemplateErrors()
  const busy = reactive(new Set<string>())
  const controller = new AbortController()
  onUnmounted(() => controller.abort())
  async function run<T>(id: string, action: (signal: AbortSignal) => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
    busy.add(id)
    try {
      return { ok: true, value: await action(controller.signal) }
    } catch (error) {
      if (!controller.signal.aborted) errors.report(error)
      return { ok: false, error }
    } finally {
      busy.delete(id)
    }
  }
  return {
    busy: (id: string) => busy.has(id),
    update: (id: string, body: UpdateTemplate) => run<Template>(id, (signal) => send('patch', '/api/v1/templates/{id}', { signal, path: { id }, body })),
    remove: (id: string) => run(id, (signal) => send('delete', '/api/v1/templates/{id}', { signal, path: { id } })),
  }
}
