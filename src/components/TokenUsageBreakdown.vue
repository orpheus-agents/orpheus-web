<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AggregateUsage, Usage } from '../api/generated'
import { formatCompactNumber, formatNumber } from '../format'
import type { Count, Share } from '../charts/palette'
import { usageSegments, type UsageLabel } from '../charts/usage'
import StackedBar from './StackedBar.vue'

const props = defineProps<{ usage: Usage | AggregateUsage; compact?: boolean }>()
const { t, locale } = useI18n()
const labels = computed<Record<UsageLabel, string>>(() => ({
  input: t('usage.input'),
  cachedInput: t('usage.cachedInput'),
  output: t('usage.output'),
  reasoningOutput: t('usage.reasoningOutput'),
}))
function share(label: UsageLabel, value: Count): Share {
  const full = formatNumber(value, locale.value)
  return props.compact
    ? { label: labels.value[label], value, display: formatCompactNumber(value, locale.value), title: full }
    : { label: labels.value[label], value, display: full }
}
const segments = computed(() => usageSegments(props.usage, share))
</script>
<template>
  <StackedBar :segments="segments" :total="usage.total_tokens" />
</template>
