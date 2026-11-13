import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute } from 'vue-router'
import { get } from '../api/client'
import { useResource } from './useResource'

/** One catalog record for its card, including inactive records. */
export function useTemplate(id: MaybeRefOrGetter<string>) {
  const route = useRoute()
  return useResource(
    (signal) => get('/api/v1/templates/{id}', { signal, path: { id: toValue(id) } }),
    () => (route.name === 'template' ? `template:${toValue(id)}` : null),
    { interval: 30_000 },
  )
}

/** The catalog record a stored reference names, looked up exactly: missing from a page never means deleted. */
export function useTemplateReference(name: MaybeRefOrGetter<string | undefined>) {
  const resource = useResource(
    (signal) => get('/api/v1/templates', { signal, query: { name: toValue(name), limit: 1 } }),
    () => (toValue(name) ? `reference:${toValue(name)}` : null),
    { interval: 30_000 },
  )
  return {
    template: computed(() => resource.data.value?.items[0]),
    disconnected: resource.disconnected,
    refresh: resource.refresh,
  }
}
