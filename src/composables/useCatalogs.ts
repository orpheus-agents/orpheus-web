import { computed } from 'vue'
import { get } from '../api/client'
import type { Profile } from '../api/generated'
import { useResource } from './useResource'

export type CatalogDescriptions = ReadonlyMap<string, Profile['description']>

export function useCatalogs() {
  const profiles = useResource((signal) => get('/api/v1/profiles', { signal }), () => 'profiles', { interval: 30_000 })
  const templates = useResource((signal) => get('/api/v1/templates', { signal }), () => 'templates', { interval: 30_000 })
  const disconnected = computed(() => profiles.disconnected.value || templates.disconnected.value)
  return {
    profiles: computed<CatalogDescriptions>(() => new Map((profiles.data.value?.items ?? []).map((item) => [item.name, item.description]))),
    templates: computed<CatalogDescriptions>(() => new Map((templates.data.value?.items ?? []).map((item) => [item.name, item.description]))),
    disconnected,
    refresh() { void profiles.refresh(); void templates.refresh() },
  }
}
