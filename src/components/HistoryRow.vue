<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { UserRound, Sparkles, Terminal } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { MessageItemType, MessageRole, ToolCallOutput_completeness } from '../api/generated'
import { entity, type HistoryItem } from '../events/history'
import RelativeTime from './RelativeTime.vue'
import StatusBadge from './StatusBadge.vue'
import ResultOutput from './ResultOutput.vue'
const RichText = defineAsyncComponent(() => import('./RichText.vue'))
const props = defineProps<{ item: HistoryItem }>()
const { t } = useI18n()
const object = computed(() => entity(props.item))
const expanded = ref(false)
function toggle(event: Event) {
  expanded.value = (event.target as HTMLDetailsElement).open
}
</script>
<template>
  <article class="border-b border-line px-5 py-5 last:border-0 sm:px-6">
    <template v-if="item.type === MessageItemType.message">
      <div class="mb-3 flex items-center gap-2 text-xs">
        <component
          :is="item.message.role === MessageRole.user ? UserRound : Sparkles"
          class="h-4 w-4 text-brand"
          aria-hidden="true"
        /><span class="font-semibold">{{ t(`history.${item.message.role}`) }}</span><span v-if="item.message.kind" class="text-muted">{{ t(`history.${item.message.kind}`) }}</span><RelativeTime class="ml-auto text-muted" :timestamp="object.created_at" />
      </div>
      <details v-if="item.message.text.length > 8000" @toggle="toggle">
        <summary class="cursor-pointer text-sm text-brand">{{ t('history.longMessage') }}</summary>
        <RichText v-if="expanded" :text="item.message.text" />
      </details>
      <RichText v-else :text="item.message.text" />
      <p v-if="item.message.delivery_status" class="mt-2 text-xs text-muted">
        {{ t(`delivery.${item.message.delivery_status}`) }}
      </p>
      <p v-if="item.message.error" class="mt-2 text-xs text-danger-fg">
        {{ item.message.error.code }}: {{ item.message.error.message }}
      </p>
    </template>
    <details v-else class="text-sm" @toggle="toggle">
      <summary class="flex cursor-pointer flex-wrap items-center gap-2">
        <Terminal class="h-4 w-4 text-muted" aria-hidden="true" /><span class="font-mono">{{
          item.tool_call.name
        }}</span><StatusBadge :value="item.tool_call.status" /><RelativeTime
          class="ml-auto text-xs text-muted"
          :timestamp="object.created_at"
        />
      </summary>
      <div v-if="expanded" class="mt-4 space-y-3">
        <h4 class="field-label">{{ t('history.input') }}</h4>
        <pre class="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface p-3 text-xs">{{
          JSON.stringify(item.tool_call.input, null, 2)
        }}</pre>
        <h4 class="field-label">{{ t('history.output') }}</h4>
        <ResultOutput v-if="item.tool_call.result" :result="item.tool_call.result" />
        <p v-else class="text-xs text-muted">{{ t('history.noOutput') }}</p>
        <p
          v-if="item.tool_call.output_completeness !== ToolCallOutput_completeness.complete"
          class="text-xs text-warning-fg"
        >
          {{ t(`completeness.${item.tool_call.output_completeness}`)
          }}<span v-if="item.tool_call.truncation_reason"> · {{ item.tool_call.truncation_reason }}</span>
        </p>
      </div>
    </details>
  </article>
</template>
