<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AccountLimitWindow } from '../api/generated'
import RelativeTime from './RelativeTime.vue'
import { formatDuration, formatPercent } from '../format'
defineProps<{ window: AccountLimitWindow; label: string; stale: boolean }>()
const { t, locale } = useI18n()
function percent(value: number) {
  return formatPercent(value, locale.value)
}
</script>
<template>
  <div class="rounded-lg border border-line bg-surface/40 p-4">
    <div class="flex items-center justify-between gap-2">
      <h4 class="text-sm font-medium">{{ label }}</h4>
      <span class="text-xs text-muted">{{
        window.window_minutes == null
          ? t('limits.unspecifiedWindow')
          : formatDuration(window.window_minutes * 60, locale)
      }}</span>
    </div>
    <div class="mt-5 flex items-baseline justify-between">
      <strong class="text-2xl font-semibold tabular-nums">{{ percent(window.used_percent) }}</strong><span class="text-xs text-muted">{{ t('limits.remaining', { value: percent(window.remaining_percent) }) }}</span>
    </div>
    <div
      class="my-3 h-1.5 overflow-hidden rounded-full bg-line"
      role="meter"
      :aria-label="t('limits.used')"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="Math.min(window.used_percent, 100)"
      :aria-valuetext="percent(window.used_percent)"
    >
      <div
        class="h-full rounded-full"
        :class="stale ? 'bg-muted' : window.used_percent >= 90 ? 'bg-warning' : 'bg-brand'"
        :style="{ width: `${Math.min(window.used_percent, 100)}%` }"
      />
    </div>
    <p class="text-xs text-muted">
      {{ t('limits.reset') }} <RelativeTime v-if="window.resets_at" :timestamp="window.resets_at" /><span v-else>{{
        t('common.unknown')
      }}</span>
    </p>
  </div>
</template>
