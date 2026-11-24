import { computed } from 'vue'
import { get } from '../api/client'
import type { Profile, Profiles } from '../api/generated'
import { useResource } from './useResource'

export type CatalogDescriptions = ReadonlyMap<string, Profile['description']>

export function useCatalogs(names?: () => readonly string[]) {
  const selected = computed(() => names ? [...new Set(names())].sort() : null)
  const profiles = useResource(async (signal) => {
    if (selected.value !== null) {
      const pages = await Promise.all(selected.value.map((name) => get('/api/v1/profiles', { signal, query: { name } })))
      return pages.flatMap((page) => page.items)
    }
    const items: Profile[] = []
    let cursor: string | undefined
    do {
      const page: Profiles = await get('/api/v1/profiles', { signal, query: { limit: 200, cursor } })
      items.push(...page.items)
      cursor = page.next_cursor ?? undefined
    } while (cursor)
    return items
  }, () => JSON.stringify(selected.value), { interval: 30_000 })
  return {
    profiles: computed<CatalogDescriptions>(() => new Map((profiles.data.value ?? []).map((item) => [item.name, item.description]))),
    disconnected: profiles.disconnected,
    refresh() { void profiles.refresh() },
  }
}
