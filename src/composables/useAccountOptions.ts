import { computed } from 'vue'
import { get } from '../api/client'
import { useCatalogOptions } from './useCatalogOptions'
import { useResource } from './useResource'

export function useAccountOptions(id: () => string) {
  const options = useCatalogOptions((signal, search, cursor) => get('/api/v1/llm-accounts', {
    signal, query: { name_contains: search || undefined, limit: 50, cursor },
  }))
  const selected = useResource((signal) => get('/api/v1/llm-accounts/{id}', { signal, path: { id: id() } }), () => id() || null, { interval: 30_000 })
  const current = computed(() => selected.data.value ?? options.items.value.find((row) => row.id === id()))
  return { options, selected, current }
}
