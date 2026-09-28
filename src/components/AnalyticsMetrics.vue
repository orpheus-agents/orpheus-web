<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RunStatus, type AnalyticsOverview } from '../api/generated'
import { formatCompactNumber, formatDuration, formatNumber } from '../format'
import { statusSegments } from '../charts/runs'
import TokenUsageBreakdown from './TokenUsageBreakdown.vue'
import StackedBar from './StackedBar.vue'
const props = defineProps<{ overview: AnalyticsOverview }>()
const { t, locale } = useI18n()
const runs = computed(() =>
  statusSegments(
    props.overview.period.by_status,
    (group) => t(group === RunStatus.running ? 'analytics.inProgress' : `status.${group}`),
    (value) => formatNumber(value, locale.value),
  ),
)
</script>
<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article class="panel p-5">
      <h2 class="caps text-muted">{{ t('analytics.active') }}</h2>
      <p class="my-4 font-display text-4xl font-extrabold tabular-nums tracking-display">
        {{ formatNumber(overview.current.active_sessions, locale) }}
      </p>
      <p class="text-xs text-muted">{{ t('analytics.activeHint') }}</p>
    </article>
    <article class="panel p-5">
      <h2 class="caps text-muted">{{ t('analytics.runs') }}</h2>
      <p class="my-4 font-display text-4xl font-extrabold tabular-nums tracking-display">
        {{ formatNumber(overview.period.runs_count, locale) }}
      </p>
      <StackedBar :segments="runs" :total="overview.period.runs_count" />
    </article>
    <article class="panel p-5">
      <h2 class="caps text-muted">{{ t('analytics.tokens') }}</h2>
      <p
        class="my-4 font-display text-4xl font-extrabold tabular-nums tracking-display"
        :title="formatNumber(overview.period.usage.total_tokens, locale)"
      >
        {{ formatCompactNumber(overview.period.usage.total_tokens, locale) }}
      </p>
      <TokenUsageBreakdown :usage="overview.period.usage" compact />
    </article>
    <article class="panel p-5">
      <h2 class="caps text-muted">{{ t('analytics.runtime') }}</h2>
      <p class="my-4 font-display text-3xl font-extrabold tabular-nums tracking-display">
        {{ formatDuration(overview.period.runtime_seconds, locale) }}
      </p>
      <p class="text-xs text-muted">{{ t('analytics.runtimeHint') }}</p>
    </article>
  </div>
</template>
