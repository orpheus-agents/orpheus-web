import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from 'vue-router'
import { ApiError } from '../api/client'
import type { operations } from '../api/generated'
import { useResource } from './useResource'

export const CATALOG_ACTIVITY = ['true', 'false', 'all'] as const
export type CatalogActivity = (typeof CATALOG_ACTIVITY)[number]
export const PAGE_SIZES = [25, 50, 100, 200] as const
const DEFAULT_LIMIT = 50
type Query = NonNullable<operations['get_templates']['parameters']['query']>

const text = (value: unknown) => (typeof value === 'string' ? value : '')

/** The list state lives in the URL: activity, search, page size, cursor and the page counter. */
export function catalogList(query: LocationQuery) {
  const activity: CatalogActivity = query.active === 'false' || query.active === 'all' ? query.active : 'true'
  const limit = PAGE_SIZES.find((size) => String(size) === query.limit) ?? DEFAULT_LIMIT
  const cursor = text(query.cursor) || undefined
  const page = cursor ? Math.max(1, Number.parseInt(text(query.page), 10) || 1) : 1
  const search = text(query.name_contains)
  const request: Query = {
    active: activity === 'all' ? undefined : activity === 'true',
    name_contains: search.trim() ? search : undefined,
    limit,
    cursor,
  }
  return { activity, search, limit, cursor, page, request }
}

export function useCatalogList<T>(name: string, load: (signal: AbortSignal, query: Query) => Promise<T & { prev_cursor: string | null }>) {
  const route = useRoute()
  const router = useRouter()
  const state = computed(() => catalogList(route.query))
  const filters = reactive({ search: '' })
  watch(() => state.value.search, (search) => { filters.search = search }, { immediate: true })

  // Filters and page size restart the walk from the first page.
  function filtered(change: { activity?: CatalogActivity; search?: string; limit?: number }): LocationQueryRaw {
    const { activity, search, limit } = { ...state.value, ...change }
    return {
      active: activity === 'true' ? undefined : activity,
      name_contains: search.trim() ? search : undefined,
      limit: limit === DEFAULT_LIMIT ? undefined : limit,
    }
  }
  const resource = useResource(
    (signal) => load(signal, state.value.request),
    // The page counter is not part of the request: normalising it must not reload the page.
    () => (route.name === name ? JSON.stringify(state.value.request) : null),
    { interval: 30_000, keep: () => true },
  )
  watch(resource.data, (data) => {
    if (data && data.prev_cursor === null && state.value.page !== 1) void router.replace({ query: { ...route.query, page: undefined } })
  })
  return {
    ...resource,
    filters,
    state,
    invalidCursor: computed(() => resource.error.value instanceof ApiError && resource.error.value.problem?.code === 'invalid_cursor'),
    search: () => router.replace({ query: filtered({ search: filters.search }) }),
    changeActivity: (activity: CatalogActivity) => router.replace({ query: filtered({ activity }) }),
    changeLimit: (limit: number) => router.replace({ query: filtered({ limit }) }),
    firstPage: () => router.replace({ query: filtered({}) }),
    next: (cursor: string) => router.push({ query: { ...filtered({}), cursor, page: state.value.page + 1 } }),
    previous: (cursor: string) => router.push({ query: { ...filtered({}), cursor, page: state.value.page > 2 ? state.value.page - 1 : undefined } }),
  }
}
