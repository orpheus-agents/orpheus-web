import { computed, type Ref } from 'vue'
import { get } from '../api/client'
import { sameSession, useResource } from './useResource'

export function useSession(sid: Ref<string>, rid: Ref<string | undefined>) {
  const session = useResource(
    (signal) => get('/api/v1/sessions/{sid}', { path: { sid: sid.value }, signal }),
    sid,
  )
  const selected = computed(() => rid.value ?? session.data.value?.last_run_id)
  const run = useResource(
    (signal) => get('/api/v1/sessions/{sid}/runs/{rid}', {
      path: { sid: sid.value, rid: selected.value! }, signal,
    }),
    () => selected.value ? `${sid.value}:${selected.value}` : null,
    { keep: sameSession },
  )
  return {
    ...session,
    run: run.data,
    runError: run.error,
    runPending: run.pending,
    runStale: run.stale,
    sessionPending: session.pending,
    selected,
    disconnected: computed(() => session.disconnected.value || run.disconnected.value),
    pending: computed(() => session.pending.value || (!!selected.value && run.pending.value)),
    updatedAt: computed(() => session.updatedAt.value && run.updatedAt.value
      ? [session.updatedAt.value, run.updatedAt.value].sort()[0] : null),
    refresh: () => Promise.all([session.refresh(), run.refresh()]),
  }
}
