import { computed, ref, watch } from 'vue'
import { get } from '../api/client'
import { useResource } from './useResource'

export function useAccountOptions(id: () => string) {
  const search = ref('')
  const applied = ref('')
  const cursor = ref<string>()
  const query = computed(() => ({ name_contains: applied.value.trim() || undefined, limit: 50, cursor: cursor.value }))
  const page = useResource((signal) => get('/api/v1/llm-accounts', { signal, query: query.value }), () => JSON.stringify(query.value), { interval: 30_000 })
  const selected = useResource((signal) => get('/api/v1/llm-accounts/{id}', { signal, path: { id: id() } }), () => id() || null, { interval: 30_000 })
  const options = computed(() => {
    const rows = page.data.value?.items ?? []
    return selected.data.value && !rows.some((row) => row.id === selected.data.value?.id) ? [selected.data.value, ...rows] : rows
  })
  watch(applied, () => { cursor.value = undefined })
  return { search, page, selected, options, apply: () => { cursor.value = undefined; applied.value = search.value }, move: (value: string) => { cursor.value = value } }
}
