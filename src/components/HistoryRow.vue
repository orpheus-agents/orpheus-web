<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageItemType, MessageRole, TextResultType, ToolCallOutput_completeness } from '../api/generated'
import { commandLine, entity, type HistoryItem } from '../events/history'
import RelativeTime from './RelativeTime.vue'
import StatusBadge from './StatusBadge.vue'
import ResultOutput from './ResultOutput.vue'
const RichText = defineAsyncComponent(() => import('./RichText.vue'))
const CodeBlock = defineAsyncComponent(() => import('./CodeBlock.vue'))
const props = defineProps<{ item: HistoryItem }>()
const { t } = useI18n()
const object = computed(() => entity(props.item))
const expanded = ref(false)
function toggle(event: Event) {
  expanded.value = (event.target as HTMLDetailsElement).open
}
const command = computed(() => (props.item.type === MessageItemType.message ? null : commandLine(props.item.tool_call.input)))
const exitCode = computed(() => {
  const result = props.item.type === MessageItemType.message ? null : props.item.tool_call.result
  return result?.type === TextResultType.text ? (result.exit_code ?? null) : null
})
</script>
<template>
  <article class="border-b border-line px-5 py-5 last:border-0 sm:px-6">
    <template v-if="item.type === MessageItemType.message">
      <div class="mb-3 flex items-center gap-2 font-mono text-xs text-muted">
        <span
          class="marker"
          :class="item.message.role === MessageRole.user ? 'bg-ink' : 'bg-accent'"
          aria-hidden="true"
        /><span class="caps font-semibold text-ink">{{ t(`history.${item.message.role}`) }}</span><span v-if="item.message.kind" class="caps">{{ t(`history.${item.message.kind}`) }}</span><RelativeTime class="ml-auto" :timestamp="object.created_at" />
      </div>
      <details v-if="item.message.text.length > 8000" @toggle="toggle">
        <summary class="cursor-pointer text-sm text-accent-ink">{{ t('history.longMessage') }}</summary>
        <RichText v-if="expanded" :text="item.message.text" />
      </details>
      <RichText v-else :text="item.message.text" />
      <p v-if="item.message.delivery_status" class="mt-2 font-mono text-xs text-muted">
        {{ t(`delivery.${item.message.delivery_status}`) }}
      </p>
      <p v-if="item.message.error" class="mt-2 text-xs text-danger-ink">
        {{ item.message.error.code }}: {{ item.message.error.message }}
      </p>
    </template>
    <template v-else>
      <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span class="font-semibold text-ink">{{ item.tool_call.name }}</span><StatusBadge :value="item.tool_call.status" /><RelativeTime class="ml-auto text-muted" :timestamp="object.created_at" />
      </div>
      <CodeBlock v-if="command" class="mt-3" :source="command" language="bash" prompt />
      <CodeBlock v-else class="mt-3 max-h-64" :source="JSON.stringify(item.tool_call.input, null, 2)" language="json" />
      <details class="mt-2" @toggle="toggle">
        <summary class="caps cursor-pointer text-muted">
          <span>{{ t('history.output') }}</span><span v-if="exitCode !== null" :class="{ 'text-danger-ink': exitCode !== 0 }"> · {{ t('run.exitCode') }}: {{ exitCode }}</span><span v-if="!item.tool_call.result"> · {{ t('history.noOutput') }}</span>
        </summary>
        <div v-if="expanded" class="mt-2 space-y-2">
          <ResultOutput v-if="item.tool_call.result" :result="item.tool_call.result" />
          <p v-if="item.tool_call.output_completeness !== ToolCallOutput_completeness.complete" class="text-xs text-muted">
            {{ t(`completeness.${item.tool_call.output_completeness}`)
            }}<span v-if="item.tool_call.truncation_reason"> · {{ item.tool_call.truncation_reason }}</span>
          </p>
        </div>
      </details>
    </template>
  </article>
</template>
