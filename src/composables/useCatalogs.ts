import { computed } from 'vue'
import { get } from '../api/client'
import type { Profile } from '../api/generated'
import { useResource } from './useResource'

export type CatalogDescriptions = ReadonlyMap<string, Profile['description']>

export function useCatalogs() {
  const profiles = useResource((signal) => get('/api/v1/profiles', { signal }), () => 'profiles', { interval: 30_000 })
  return {
    profiles: computed<CatalogDescriptions>(() => new Map((profiles.data.value?.items ?? []).map((item) => [item.name, item.description]))),
    disconnected: profiles.disconnected,
    refresh() { void profiles.refresh() },
  }
}
