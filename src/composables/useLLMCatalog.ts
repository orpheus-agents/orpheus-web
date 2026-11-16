import { get } from '../api/client'
import { useCatalogList } from './useCatalogList'
import { useResource } from './useResource'

export function useAccounts() {
  return useCatalogList('accounts', (signal, query) => get('/api/v1/llm-accounts', { signal, query }))
}
export function useProfiles() {
  return useCatalogList('profiles', (signal, query) => get('/api/v1/profiles', { signal, query }))
}
export function useAccount(id: () => string) {
  return useResource((signal) => get('/api/v1/llm-accounts/{id}', { signal, path: { id: id() } }), () => id(), { interval: 30_000 })
}
export function useProfile(id: () => string) {
  return useResource((signal) => get('/api/v1/profiles/{id}', { signal, path: { id: id() } }), () => id(), { interval: 30_000 })
}
