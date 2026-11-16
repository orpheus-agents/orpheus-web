import { computed } from 'vue'
import { get } from '../api/client'
import { useResource } from './useResource'
export function useLimits(ids: () => string[]) {
  const resource = useResource(
    (signal) => get('/api/v1/accounts/limits', { signal, query: { account_ids: ids() } }),
    () => ids().length ? ids().join(',') : null,
    { interval: 30_000 },
  )
  return { ...resource, disconnected: computed(() => ids().length > 0 && resource.disconnected.value) }
}
