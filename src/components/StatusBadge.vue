<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RunStatus, HookResultStatus, ToolCallStatus, AccountLimitItemState, SandboxStateState } from '../api/generated'
const props = defineProps<{
  value: RunStatus | HookResultStatus | ToolCallStatus | AccountLimitItemState | SandboxStateState
}>()
const { t } = useI18n()
// One accent: states in motion glow, settled states are ink, failures are danger, the rest is muted.
const live: readonly string[] = [
  RunStatus.starting,
  RunStatus.running,
  RunStatus.cancelling,
  RunStatus.finalizing,
  SandboxStateState.provisioning,
  SandboxStateState.pausing,
  SandboxStateState.resuming,
  AccountLimitItemState.fresh,
]
const settled: readonly string[] = [RunStatus.completed, SandboxStateState.ready]
const failed: readonly string[] = [RunStatus.failed, AccountLimitItemState.unavailable, SandboxStateState.unavailable]
const tone = computed(() => {
  if (live.includes(props.value)) return { marker: 'bg-accent', text: 'font-semibold text-accent-ink' }
  if (settled.includes(props.value)) return { marker: 'bg-ink', text: 'text-ink' }
  if (failed.includes(props.value)) return { marker: 'bg-danger', text: 'text-danger-ink' }
  return { marker: 'bg-muted', text: 'text-muted' }
})
</script>
<template>
  <span class="inline-flex items-center gap-2 whitespace-nowrap font-mono text-xs" :class="tone.text"><span class="marker" :class="tone.marker" aria-hidden="true" />{{ t(`status.${value}`) }}</span>
</template>
