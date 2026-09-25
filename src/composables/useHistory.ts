import { onUnmounted, ref, shallowRef, watch, type Ref } from 'vue'
import { ApiError, get } from '../api/client'
import { streamEvents } from '../api/stream'
import { RunEventType, SandboxEventType } from '../api/generated'
import { HistorySnapshotExpired, HistoryWindow, type HistoryItem } from '../events/history'
import { usePolling } from './usePolling'

export function useHistory(sid: Ref<string>, rid: Ref<string>, changed: () => void) {
  const items = shallowRef<HistoryItem[]>([])
  const loading = ref(true),
    loadingMore = ref(false),
    disconnected = ref(false),
    trimmed = ref(false)
  const error = shallowRef<unknown>(null)
  const next = ref<string | null>(null)
  let model = new HistoryWindow(sid.value, rid.value)
  let initialized = false
  let pageController: AbortController | undefined
  function publish() {
    items.value = model.sorted
    next.value = model.next
    trimmed.value = model.trimmed
  }
  const polling = usePolling(async (signal) => {
    const current = model
    try {
      if (!initialized) {
        const page = await get('/api/v1/sessions/{sid}/history', {
          path: { sid: sid.value },
          query: { run_id: rid.value, limit: 50 },
          signal,
        })
        if (signal.aborted || model !== current) return
        model.page(page, true)
        initialized = true
        error.value = null
        loading.value = false
        publish()
      }
      await streamEvents(
        sid.value,
        model.cursor,
        signal,
        (event) => {
          if (signal.aborted || model !== current) return
          if (model.event(event)) {
            publish()
            if (event.type === RunEventType.run_updated || event.type === SandboxEventType.sandbox_updated) changed()
          }
        },
        () => {
          if (!signal.aborted && model === current) {
            disconnected.value = false
            polling.reset()
          }
        },
      )
    } catch (cause) {
      if (!signal.aborted && model === current) {
        disconnected.value = true
        if (!initialized) error.value = cause
        loading.value = false
        if (
          (cause instanceof ApiError && [400, 422].includes(cause.status)) ||
          cause instanceof HistorySnapshotExpired
        ) {
          resetModel()
        }
      }
      throw cause
    }
  }, 1000)
  function resetModel() {
    pageController?.abort()
    model = new HistoryWindow(sid.value, rid.value)
    initialized = false
    loadingMore.value = false
    next.value = null
    trimmed.value = false
  }
  function refresh() {
    resetModel()
    loading.value = true
    error.value = null
    items.value = []
    void polling.refresh()
  }
  async function more() {
    if (!model.next || loadingMore.value) return
    loadingMore.value = true
    pageController = new AbortController()
    const signal = pageController.signal
    const current = model
    try {
      const page = await get('/api/v1/sessions/{sid}/history', {
        path: { sid: sid.value },
        query: { run_id: rid.value, limit: 50, cursor: model.next },
        signal,
      })
      if (signal.aborted || model !== current) return
      model.page(page)
      error.value = null
      publish()
    } catch (cause) {
      if (!signal.aborted && model === current) error.value = cause
    } finally {
      if (model === current) loadingMore.value = false
    }
  }
  watch([sid, rid], refresh, { flush: 'sync' })
  onUnmounted(() => pageController?.abort())
  return { items, loading, loadingMore, disconnected, error, next, trimmed, more, refresh }
}
