import { computed, ref, shallowRef, toValue, watch, type WatchSource } from 'vue'
import { usePolling } from './usePolling'

/** A null key suspends requests while inputs are unavailable or the route is leaving. */
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, key: WatchSource, interval = 5000) {
  const data = shallowRef<T | null>(null)
  const error = shallowRef<unknown>(null)
  const pending = ref(true)
  const updatedAt = ref<string | null>(null)
  const polling = usePolling(async (signal) => {
    if (toValue(key) === null) return
    pending.value = true
    try {
      const result = await fetcher(signal)
      if (signal.aborted) return
      data.value = result
      error.value = null
      updatedAt.value = new Date().toISOString()
    } catch (cause) {
      if (!signal.aborted) error.value = cause
      throw cause
    } finally {
      if (!signal.aborted) pending.value = false
    }
  }, interval)
  watch(
    key,
    (value) => {
      if (value === null) {
        polling.cancel()
        return
      }
      data.value = null
      error.value = null
      pending.value = true
      updatedAt.value = null
      void polling.refresh()
    },
    { flush: 'sync' },
  )
  return {
    data,
    error,
    pending,
    updatedAt,
    disconnected: computed(() => error.value !== null),
    refresh: polling.refresh,
  }
}
