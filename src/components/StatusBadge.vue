<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RunStatus, HookResultStatus, ToolCallStatus, AccountLimitItemState, SandboxStateState } from '../api/generated'
const props = defineProps<{
  value: RunStatus | HookResultStatus | ToolCallStatus | AccountLimitItemState | SandboxStateState
}>()
const { t } = useI18n()
const success: readonly string[] = [RunStatus.completed, AccountLimitItemState.fresh, SandboxStateState.ready]
const danger: readonly string[] = [RunStatus.failed, AccountLimitItemState.unavailable, SandboxStateState.unavailable]
const warning: readonly string[] = [
  RunStatus.running,
  RunStatus.starting,
  RunStatus.finalizing,
  AccountLimitItemState.stale,
]
const tone = computed(() => {
  if (success.includes(props.value)) return 'bg-success-bg text-success-fg'
  if (danger.includes(props.value)) return 'bg-danger-bg text-danger-fg'
  if (warning.includes(props.value)) return 'bg-warning-bg text-warning-fg'
  return 'bg-surface text-muted'
})
</script>
<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
    :class="tone"
  ><span class="h-1 w-1 rounded-full bg-current" aria-hidden="true" />{{ t(`status.${value}`) }}</span>
</template>
