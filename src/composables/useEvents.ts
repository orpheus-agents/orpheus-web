import { ref, watch, type Ref } from 'vue'
import { get } from '../api/client'
import { sameSession, useResource } from './useResource'

export function useEvents(sid: Ref<string>) {
  const after = ref('0')
  watch(
    sid,
    () => {
      after.value = '0'
    },
    { flush: 'sync' },
  )
  const resource = useResource(
    (signal) =>
      get('/api/v1/sessions/{sid}/events', {
        path: { sid: sid.value },
        query: { after: after.value, limit: 50 },
        signal,
      }),
    () => `${sid.value}:${after.value}`,
    { keep: sameSession },
  )
  return { ...resource, after }
}
