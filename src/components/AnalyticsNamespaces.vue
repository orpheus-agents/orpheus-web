<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RunStatus, type AnalyticsNamespace, type AnalyticsOverview } from '../api/generated'
import { formatCompactNumber, formatDuration, formatNumber } from '../format'
import type { Count, Segment } from '../charts/palette'
import { statusSegments } from '../charts/runs'
import { usageSegments } from '../charts/usage'
import StackedBar from './StackedBar.vue'
import EmptyState from './EmptyState.vue'

interface Row {
  namespace: string | null
  value: Count
  display: string
  title?: string
  segments: Segment[]
  summary?: string
}
interface Widget {
  key: 'runs' | 'tokens' | 'runtime'
  title: string
  rows: Row[]
  scale: Count
}

const props = defineProps<{ overview: AnalyticsOverview }>()
const emit = defineEmits<{ select: [namespace: string] }>()
const { t, locale } = useI18n()
const usageLabels = { input: 'usage.input', cachedInput: 'usage.cachedInput', output: 'usage.output', reasoningOutput: 'usage.reasoningOutput' } as const
function summary(segments: Segment[]) {
  return segments.flatMap((segment) => [segment, ...(segment.nested ? [segment.nested] : [])]).map((share) => `${share.label} ${share.display}`).join(' · ')
}
// Each widget ranks namespaces by its own measure; bars are scaled to the largest row, not to the period.
function widget(key: Widget['key'], title: string, row: (group: AnalyticsNamespace) => Row): Widget {
  const rows = props.overview.namespaces.map(row).sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)))
  return { key, title, rows, scale: rows[0]?.value ?? 0 }
}
const widgets = computed<Widget[]>(() => [
  widget('runs', t('analytics.namespaceRuns'), (group) => {
    const segments = statusSegments(
      group.by_status,
      (status) => t(status === RunStatus.running ? 'analytics.inProgress' : `status.${status}`),
      (value) => formatNumber(value, locale.value),
    )
    return { namespace: group.namespace, value: group.runs_count, display: formatNumber(group.runs_count, locale.value), segments, summary: summary(segments) }
  }),
  widget('tokens', t('analytics.namespaceTokens'), (group) => {
    const segments = usageSegments(group.usage, (label, value) => ({ label: t(usageLabels[label]), value, display: formatCompactNumber(value, locale.value) }))
    return {
      namespace: group.namespace,
      value: group.usage.total_tokens,
      display: formatCompactNumber(group.usage.total_tokens, locale.value),
      title: formatNumber(group.usage.total_tokens, locale.value),
      segments,
      summary: summary(segments),
    }
  }),
  widget('runtime', t('analytics.namespaceRuntime'), (group) => {
    const seconds = Math.round(group.runtime_seconds)
    const display = formatDuration(group.runtime_seconds, locale.value)
    return { namespace: group.namespace, value: seconds, display, segments: [{ key: 'runtime', tone: 'ink', label: t('analytics.runtime'), value: seconds, display }] }
  }),
])
</script>
<template>
  <section v-if="!overview.namespaces.length" class="panel">
    <EmptyState :title="t('analytics.emptyNamespaces')" />
  </section>
  <div v-else class="grid gap-4 lg:grid-cols-3">
    <article v-for="item in widgets" :key="item.key" class="panel p-5">
      <h2 class="caps text-muted">{{ item.title }}</h2>
      <ol class="mt-4 space-y-3">
        <li v-for="row in item.rows" :key="row.namespace ?? ''" :title="row.summary">
          <div class="flex items-baseline justify-between gap-3 font-mono text-xs">
            <button
              v-if="row.namespace !== null"
              type="button"
              class="truncate text-accent-ink hover:underline"
              :aria-label="t('analytics.filterNamespace', { namespace: row.namespace })"
              @click="emit('select', row.namespace)"
            >
              {{ row.namespace }}
            </button>
            <span v-else class="truncate text-muted">{{ t('analytics.noNamespace') }}</span>
            <span class="shrink-0 tabular-nums" :title="row.title">{{ row.display }}</span>
          </div>
          <StackedBar class="mt-1.5" :segments="row.segments" :total="item.scale" :legend="false" />
        </li>
      </ol>
    </article>
  </div>
</template>
