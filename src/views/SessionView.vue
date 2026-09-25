<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { useSession } from '../composables/useSession'
import { sectionLinks } from '../router'
import { formatCompactNumber, formatNumber } from '../format'
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
const { data, run, runError, runPending, sessionPending, selected, error, pending, updatedAt, disconnected, refresh } = useSession(sid, rid)
</script>
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <RouterLink :to="sectionLinks.sessions" class="flex items-center gap-2 text-sm text-muted hover:text-brand">
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('session.back') }}
      </RouterLink><RefreshStatus :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" />
    </div>
    <template v-if="data">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="font-mono text-xs text-muted">{{ data.namespace ?? t('session.noNamespace') }}</p>
          <h1 class="mt-2 break-all text-xl font-semibold">
            {{ data.external_key ?? data.id.slice(0, 8) }}
          </h1>
          <p class="mt-2 flex items-center gap-2 break-all font-mono text-xs text-muted">
            {{ data.id }}<CopyButton :value="data.id" />
          </p>
        </div>
        <div class="text-right">
          <StatusBadge :value="data.status" />
          <p class="mt-2 text-xs text-muted" :title="formatNumber(data.usage.total_tokens, locale)">
            {{ t('session.totalTokens', { value: formatCompactNumber(data.usage.total_tokens, locale) }) }}
          </p>
        </div>
      </div>
      <ErrorDetails v-if="data.error" :error="data.error" />
      <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="min-w-0 space-y-5">
          <template v-if="run">
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <span class="text-muted">{{ rid ? t('session.selectedRun') : t('session.latestRun') }}</span><RouterLink :to="`/sessions/${sid}/runs/${run.id}`" class="font-medium text-brand">
                {{
                  t('run.title', { number: run.number })
                }}
              </RouterLink><StatusBadge :value="run.status" />
            </div>
            <HistoryPanel :key="run.id" :sid="sid" :rid="run.id" @changed="refresh" />
          </template>
          <PageState v-else :loading="runPending" :error="runError" @retry="refresh" />
          <details :open="journal" class="panel" @toggle="journal = ($event.target as HTMLDetailsElement).open">
            <summary class="cursor-pointer px-6 py-4 text-sm font-medium">{{ t('events.title') }}</summary>
            <EventsPanel v-if="journal" :key="sid" :sid="sid" />
          </details>
        </div>
        <aside class="space-y-5">
          <RunDetails v-if="run" :run="run" /><RunsPanel :sid="sid" :selected="selected ?? ''" /><SessionInfo
            :session="data"
          />
        </aside>
      </div>
    </template>
    <PageState v-else :loading="sessionPending" :error="error" @retry="refresh" />
  </div>
</template>
