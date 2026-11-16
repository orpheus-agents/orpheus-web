import { computed } from 'vue'
import { get } from '../api/client'
import type { Profile } from '../api/generated'
import { useResource } from './useResource'

export type CatalogDescriptions = ReadonlyMap<string, Profile['description']>

export function useCatalogs(names: () => readonly string[]) {
  const selected = computed(() => [...new Set(names())].sort())
  const profiles = useResource(async (signal) => {
    const pages = await Promise.all(selected.value.map((name) => get('/api/v1/profiles', { signal, query: { name } })))
    return pages.flatMap((page) => page.items)
  }, () => JSON.stringify(selected.value), { interval: 30_000 })
  return {
    profiles: computed<CatalogDescriptions>(() => new Map((profiles.data.value ?? []).map((item) => [item.name, item.description]))),
    disconnected: profiles.disconnected,
    refresh() { void profiles.refresh() },
  }
}
