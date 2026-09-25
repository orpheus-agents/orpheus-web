<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AnalyticsOverview } from '../api/generated'
import { formatCompactNumber, formatDuration, formatNumber } from '../format'
defineProps<{ overview: AnalyticsOverview }>()
const { t, locale } = useI18n()
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
      <p class="text-xs text-muted">
        {{
          t('analytics.completedFailed', {
            completed: formatNumber(overview.period.by_status.completed, locale),
            failed: formatNumber(overview.period.by_status.failed, locale),
          })
        }}
      </p>
      <p class="mt-1 text-xs text-muted">
        {{
          t('analytics.cancelledActive', {
            cancelled: formatNumber(overview.period.by_status.cancelled, locale),
            active: formatNumber(
              overview.period.runs_count -
                overview.period.by_status.completed -
                overview.period.by_status.failed -
                overview.period.by_status.cancelled,
              locale,
            ),
          })
        }}
      </p>
    </article>
    <article class="panel p-5">
      <h2 class="caps text-muted">{{ t('analytics.tokens') }}</h2>
      <p
        class="my-4 font-display text-4xl font-extrabold tabular-nums tracking-display"
        :title="formatNumber(overview.period.usage.total_tokens, locale)"
      >
        {{ formatCompactNumber(overview.period.usage.total_tokens, locale) }}
      </p>
      <p class="text-xs text-muted">
        {{
          t('analytics.inputOutput', {
            input: formatCompactNumber(overview.period.usage.input_tokens, locale),
            output: formatCompactNumber(overview.period.usage.output_tokens, locale),
          })
        }}
      </p>
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
