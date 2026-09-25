import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get } from '../api/client'
import {
  PathsApiV1AnalyticsOverviewGetParametersQueryWindow as Window,
  PathsApiV1AnalyticsOverviewGetParametersQueryBucket as Bucket,
  type operations,
} from '../api/generated'
import { useResource } from './useResource'

export function useAnalytics() {
  const route = useRoute()
  const router = useRouter()
  const query = computed<operations['get_analytics_overview']['parameters']['query']>(() => {
    const q = route.query
    const window = Object.values(Window).find((value) => value === q.window) ?? Window.Value24h
    return {
      window,
      bucket:
        Object.values(Bucket).find((value) => value === q.bucket) ??
        (window === Window.Value24h ? Bucket.hour : Bucket.day),
      timezone: typeof q.timezone === 'string' ? q.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone,
      namespace: typeof q.namespace === 'string' && q.namespace !== '' ? q.namespace : undefined,
    }
  })
  const filters = reactive({ window: Window.Value24h, bucket: Bucket.hour, timezone: '', namespace: '' })
  watch(
    query,
    (q) => {
      Object.assign(filters, q, { namespace: q?.namespace ?? '' })
    },
    { immediate: true },
  )
  function apply() {
    return router.replace({ query: { ...filters, namespace: filters.namespace || undefined } })
  }
  function changeWindow() {
    filters.bucket = filters.window === Window.Value24h ? Bucket.hour : Bucket.day
    void apply()
  }
  const resource = useResource(
    (signal) => get('/api/v1/analytics/overview', { signal, query: query.value }),
    () => route.name === 'analytics' ? JSON.stringify(query.value) : null,
  )
  return { ...resource, filters, apply, changeWindow }
}
