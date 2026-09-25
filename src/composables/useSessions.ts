import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get } from '../api/client'
import {
  RunStatus,
  PathsApiV1SessionsGetParametersQueryActivity as Activity,
  PathsApiV1SessionsGetParametersQuerySort as Sort,
  PathsApiV1SessionsGetParametersQueryOrder as Order,
  type operations,
} from '../api/generated'
import { useResource } from './useResource'
import { useSettings } from './useSettings'
import { fromZonedInput, toZonedInput } from '../format'

export function useSessions() {
  const route = useRoute()
  const router = useRouter()
  const { timeZone } = useSettings()
  const string = (value: unknown) => (typeof value === 'string' ? value : '')
  const activeStatuses = [RunStatus.accepted, RunStatus.starting, RunStatus.running, RunStatus.cancelling, RunStatus.finalizing]
  const inactiveStatuses = [RunStatus.completed, RunStatus.failed, RunStatus.cancelled]
  const availableStatuses = (activity: unknown) => activity === Activity.inactive ? inactiveStatuses : activeStatuses
  const relativeDays = (period: unknown) => period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 0
  let windowEnd: string | undefined
  const filters = reactive({
    activity: Activity.active,
    namespace: '',
    external_key: '',
    status: '' as RunStatus | '',
    period: 'all',
    from: '',
    to: '',
  })
  watch(
    () => route.query,
    (q) => {
      Object.assign(filters, {
        activity: q.activity === Activity.inactive ? Activity.inactive : Activity.active,
        namespace: string(q.namespace),
        external_key: string(q.external_key),
        status: availableStatuses(q.activity).find((s) => s === q.status) ?? '',
        period: string(q.period) || 'all',
        from: string(q.from),
        to: string(q.to),
      })
    },
    { immediate: true },
  )
  const query = computed<operations['list_sessions']['parameters']['query']>(() => {
    const q = route.query
    const inactive = q.activity === Activity.inactive
    return {
      activity: inactive ? Activity.inactive : Activity.active,
      sort: Sort.last_run_created_at,
      order: Order.desc,
      limit: 50,
      namespace: string(q.namespace) || undefined,
      external_key: string(q.external_key) || undefined,
      status: availableStatuses(q.activity).find((s) => s === q.status),
      cursor: string(q.cursor) || undefined,
      last_run_created_from: inactive && q.period === 'custom' ? string(q.from) || undefined : undefined,
      last_run_created_to: inactive && q.period === 'custom' ? string(q.to) || undefined : undefined,
    }
  })
  // The date inputs show and read wall-clock time in the time zone chosen in the header.
  const fromLocal = computed({
    get: () => toZonedInput(filters.from, timeZone.value),
    set: (value: string) => {
      filters.from = fromZonedInput(value, timeZone.value)
    },
  })
  const toLocal = computed({
    get: () => toZonedInput(filters.to, timeZone.value),
    set: (value: string) => {
      filters.to = fromZonedInput(value, timeZone.value)
    },
  })
  async function apply() {
    await router.replace({
      query: {
        ...filters,
        namespace: filters.namespace || undefined,
        external_key: filters.external_key || undefined,
        status: filters.status || undefined,
        from: filters.period === 'custom' ? filters.from || undefined : undefined,
        to: filters.period === 'custom' ? filters.to || undefined : undefined,
      },
    })
  }
  function changeActivity(activity: Activity) {
    filters.activity = activity
    filters.status = ''
    void apply()
  }
  function changePeriod() {
    if (filters.period !== 'custom') void apply()
  }
  function page(cursor?: string | null) {
    return router.push({ query: { ...route.query, cursor: cursor || undefined,
      at: cursor && relativeDays(route.query.period) ? windowEnd : undefined,
    } })
  }
  const resource = useResource(
    async (signal) => {
      const request = { ...query.value }
      const days = request.activity === Activity.inactive ? relativeDays(route.query.period) : 0
      if (days) {
        // A cursor is bound to its original filters; only the first page rolls forward.
        const to = request.cursor && string(route.query.at) ? string(route.query.at) : new Date().toISOString()
        request.last_run_created_to = to
        request.last_run_created_from = new Date(Date.parse(to) - days * 86400_000).toISOString()
      }
      const result = await get('/api/v1/sessions', { signal, query: request })
      if (!signal.aborted) windowEnd = request.last_run_created_to
      return result
    },
    () => route.name === 'sessions' ? JSON.stringify([query.value, route.query.period, route.query.at]) : null,
    { keep: () => true },
  )
  return {
    ...resource,
    fromLocal,
    toLocal,
    filters,
    statuses: computed(() => availableStatuses(filters.activity)),
    apply,
    changeActivity,
    changePeriod,
    page,
    hasCursor: computed(() => !!route.query.cursor),
  }
}
