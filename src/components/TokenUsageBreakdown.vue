<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AggregateUsage, Usage } from '../api/generated'
import { formatCompactNumber, formatNumber } from '../format'
import type { Segment, Share } from '../charts/palette'
import StackedBar from './StackedBar.vue'

const props = defineProps<{ usage: Usage | AggregateUsage; compact?: boolean }>()
const { t, locale } = useI18n()
function share(label: string, value: number | string): Share {
  const full = formatNumber(value, locale.value)
  return props.compact
    ? { label, value, display: formatCompactNumber(value, locale.value), title: full }
    : { label, value, display: full }
}
// Cached input is part of input and reasoning is part of output: both are hatched inside their parent.
const segments = computed<Segment[]>(() => [
  { key: 'input', tone: 'ink', ...share(t('usage.input'), props.usage.input_tokens), nested: share(t('usage.cachedInput'), props.usage.cached_input_tokens) },
  { key: 'output', tone: 'accent', ...share(t('usage.output'), props.usage.output_tokens), nested: share(t('usage.reasoningOutput'), props.usage.reasoning_output_tokens) },
])
</script>
<template>
  <StackedBar :segments="segments" :total="usage.total_tokens" />
</template>
