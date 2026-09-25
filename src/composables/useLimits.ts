import { get } from '../api/client'
import { useResource } from './useResource'
export function useLimits() {
  return useResource(
    (signal) => get('/api/v1/accounts/limits', { signal }),
    () => 'limits',
    { interval: 30_000 },
  )
}
