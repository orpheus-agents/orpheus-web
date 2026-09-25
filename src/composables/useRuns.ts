import { ref, watch, type Ref } from 'vue'
import { get } from '../api/client'
import { PathsApiV1SessionsSidRunsGetParametersQueryOrder as Order } from '../api/generated'
import { useResource } from './useResource'

export function useRuns(sid: Ref<string>) {
  const cursor = ref<string | undefined>()
  watch(
    sid,
    () => {
      cursor.value = undefined
    },
    { flush: 'sync' },
  )
  const resource = useResource(
    (signal) =>
      get('/api/v1/sessions/{sid}/runs', {
        signal,
        path: { sid: sid.value },
        query: { order: Order.desc, limit: 10, cursor: cursor.value },
      }),
    () => `${sid.value}:${cursor.value}`,
  )
  return { ...resource, cursor }
}
