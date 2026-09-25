<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { HookResultOutput_completeness, type HookResult } from '../api/generated'
import StatusBadge from './StatusBadge.vue'
import ResultOutput from './ResultOutput.vue'
import ErrorDetails from './ErrorDetails.vue'
defineProps<{ hook: HookResult }>()
const { t } = useI18n()
const expanded = ref(false)
</script>
<template>
  <details class="rounded-md border border-line p-3" @toggle="expanded = ($event.target as HTMLDetailsElement).open">
    <summary class="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-xs">
      <span class="font-mono">{{ hook.name }}</span><StatusBadge :value="hook.status" />
    </summary>
    <div v-if="expanded" class="mt-3 space-y-3">
      <p class="text-xs text-muted">{{ t('run.exitCode') }}: {{ hook.exit_code ?? t('common.notSet') }}</p>
      <ResultOutput v-if="hook.output" :result="hook.output" />
      <p v-if="hook.output_completeness !== HookResultOutput_completeness.complete" class="text-xs text-warning-fg">{{ t(`completeness.${hook.output_completeness}`) }}</p>
      <ErrorDetails v-if="hook.error" :error="hook.error" />
    </div>
  </details>
</template>
