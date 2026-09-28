<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AccountLimitWindow } from '../api/generated'
import { useNow } from '../composables/useNow'
import { useSettings } from '../composables/useSettings'
import { formatCountdown, formatDate, formatPercent, formatRelativeTime } from '../format'

const props = defineProps<{ window: AccountLimitWindow; label: string; stale: boolean }>()
const { t, locale } = useI18n()
const now = useNow()
const { timeZone } = useSettings()
// Like the provider's own meter: the bar and the number are what is left, not what was spent.
const remaining = computed(() => Math.min(Math.max(props.window.remaining_percent, 0), 100))
const reset = computed(() => {
  if (!props.window.resets_at) return { text: t('limits.resetUnknown') }
  const at = Date.parse(props.window.resets_at)
  const current = Math.max(now.value, Date.now())
  return {
    text: at > current ? t('limits.resetIn', { value: formatCountdown((at - current) / 1000, locale.value) }) : t('limits.resetAt', { value: formatRelativeTime(props.window.resets_at, current, locale.value) }),
    title: formatDate(props.window.resets_at, locale.value, timeZone.value),
  }
})
const tone = computed(() => (props.stale ? 'bg-muted' : remaining.value < 10 ? 'bg-danger' : 'bg-ink'))
</script>
<template>
  <div class="border border-line bg-surface p-4">
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h4 class="text-sm font-medium">{{ label }}</h4>
      <span class="font-mono text-xs text-muted" :title="reset.title">{{ reset.text }}</span>
    </div>
    <p class="mt-4 flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-muted">
      <strong class="font-display text-2xl font-extrabold tabular-nums tracking-title text-ink">{{ formatPercent(remaining, locale) }}</strong>{{ t('limits.remaining') }}<template v-if="window.used_percent > 100">
        · <span class="text-danger-ink">{{ t('limits.usedOver', { value: formatPercent(window.used_percent, locale) }) }}</span>
      </template>
    </p>
    <div
      class="mt-3 h-1.5 overflow-hidden bg-line"
      role="meter"
      :aria-label="t('limits.remainingQuota')"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="remaining"
      :aria-valuetext="`${formatPercent(remaining, locale)} ${t('limits.remaining')}`"
    >
      <div class="h-full" :class="tone" :style="{ width: `${remaining}%` }" />
    </div>
  </div>
</template>
