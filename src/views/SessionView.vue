<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { useSession } from '../composables/useSession'
import { sectionLinks } from '../router'
import { formatCompactNumber, formatNumber, shortenKey } from '../format'
import CopyButton from '../components/CopyButton.vue'
import StatusBadge from '../components/StatusBadge.vue'
import SessionInfo from '../components/SessionInfo.vue'
import RunDetails from '../components/RunDetails.vue'
import RunsPanel from '../components/RunsPanel.vue'
import HistoryPanel from '../components/HistoryPanel.vue'
import EventsPanel from '../components/EventsPanel.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
import ErrorDetails from '../components/ErrorDetails.vue'
const { t, locale } = useI18n()
const props = defineProps<{ sid: string; rid?: string }>()
const sid = toRef(props, 'sid')
const journal = ref(false)
const rid = toRef(props, 'rid')
watch([sid, rid], () => { journal.value = false })
const { data, run, runError, runPending, runStale, sessionPending, selected, error, pending, updatedAt, disconnected, refresh } = useSession(sid, rid)
</script>
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <RouterLink :to="sectionLinks.sessions" class="caps flex items-center gap-2 text-muted hover:text-ink">
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('session.back') }}
      </RouterLink><RefreshStatus :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" />
    </div>
    <template v-if="data">
      <div>
        <p class="font-mono text-xs text-muted">{{ data.namespace ?? t('session.noNamespace') }}</p>
        <h1 class="mt-2 flex items-center gap-3 break-all font-display text-2xl font-bold tracking-title sm:text-3xl" :title="data.external_key ?? undefined">
          {{ data.external_key ? shortenKey(data.external_key) : data.id.slice(0, 8) }}<CopyButton v-if="data.external_key" :value="data.external_key" />
        </h1>
        <p class="mt-2 flex items-center gap-2 break-all font-mono text-xs text-muted">
          {{ data.id }}<CopyButton :value="data.id" />
        </p>
        <p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted">
          <StatusBadge :value="data.status" /><span :title="formatNumber(data.usage.total_tokens, locale)">{{
            t('session.totalTokens', { value: formatCompactNumber(data.usage.total_tokens, locale) })
          }}</span>
        </p>
      </div>
      <ErrorDetails v-if="data.error" :error="data.error" />
      <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="min-w-0 space-y-5">
          <div v-if="run" class="space-y-5 transition-opacity" :class="{ 'opacity-50': runStale }" :aria-busy="runStale || undefined">
            <div class="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span class="caps text-muted">{{ rid ? t('session.selectedRun') : t('session.latestRun') }}</span><RouterLink :to="`/sessions/${sid}/runs/${run.id}`" class="font-semibold text-accent-ink">
                {{
                  t('run.title', { number: run.number })
                }}
              </RouterLink><StatusBadge :value="run.status" /><RouterLink
                v-if="rid && data.last_run_id && data.last_run_id !== run.id"
                :to="`/sessions/${sid}`"
                class="ml-auto flex items-center gap-2 text-accent-ink hover:underline"
              >
                <span class="marker bg-accent" aria-hidden="true" />{{ t('session.newerRun') }}
              </RouterLink>
            </div>
            <HistoryPanel :key="run.id" :sid="sid" :rid="run.id" @changed="refresh" />
          </div>
          <PageState v-else :loading="runPending" :error="runError" @retry="refresh" />
          <details :open="journal" class="panel" @toggle="journal = ($event.target as HTMLDetailsElement).open">
            <summary class="caps cursor-pointer px-6 py-4 font-semibold">{{ t('events.title') }}</summary>
            <EventsPanel v-if="journal" :key="sid" :sid="sid" />
          </details>
        </div>
        <aside class="space-y-5">
          <RunDetails v-if="run" :run="run" class="transition-opacity" :class="{ 'opacity-50': runStale }" :aria-busy="runStale || undefined" /><RunsPanel :sid="sid" :selected="selected ?? ''" /><SessionInfo
            :session="data"
          />
        </aside>
      </div>
    </template>
    <PageState v-else :loading="sessionPending" :error="error" @retry="refresh" />
  </div>
</template>
