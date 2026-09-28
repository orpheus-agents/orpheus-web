<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AggregateUsage, Usage } from '../api/generated'
import { formatCompactNumber, formatNumber } from '../format'

const props = defineProps<{ usage: Usage | AggregateUsage; compact?: boolean }>()
const { t, locale } = useI18n()
function display(value: number | string) {
  return props.compact ? formatCompactNumber(value, locale.value) : formatNumber(value, locale.value)
}
</script>

<template>
  <dl class="space-y-1 text-xs">
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <dt class="text-muted">{{ t('usage.input') }}</dt>
      <dd class="font-mono tabular-nums text-right" :title="compact ? formatNumber(usage.input_tokens, locale) : undefined">
        {{ display(usage.input_tokens) }}
      </dd>
    </div>
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-l border-line pl-3">
      <dt class="text-muted">{{ t('usage.cachedInput') }}</dt>
      <dd class="font-mono tabular-nums text-right" :title="compact ? formatNumber(usage.cached_input_tokens, locale) : undefined">
        {{ display(usage.cached_input_tokens) }}
      </dd>
    </div>
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <dt class="text-muted">{{ t('usage.output') }}</dt>
      <dd class="font-mono tabular-nums text-right" :title="compact ? formatNumber(usage.output_tokens, locale) : undefined">
        {{ display(usage.output_tokens) }}
      </dd>
    </div>
    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-l border-line pl-3">
      <dt class="text-muted">{{ t('usage.reasoningOutput') }}</dt>
      <dd class="font-mono tabular-nums text-right" :title="compact ? formatNumber(usage.reasoning_output_tokens, locale) : undefined">
        {{ display(usage.reasoning_output_tokens) }}
      </dd>
    </div>
  </dl>
</template>
