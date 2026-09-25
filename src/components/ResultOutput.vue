<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { JSONResultType, TextResultType, type ToolResult } from '../api/generated'
defineProps<{ result: ToolResult }>()
const { t } = useI18n()
</script>
<template>
  <div class="max-h-96 overflow-auto rounded-md border border-line bg-surface p-3 text-xs leading-5">
    <pre v-if="result.type === TextResultType.text" class="whitespace-pre-wrap break-words">{{ result.text }}</pre>
    <pre v-else-if="result.type === JSONResultType.json" class="whitespace-pre-wrap break-words">{{
      JSON.stringify(result.value, null, 2)
    }}</pre>
    <template v-else>
      <pre class="whitespace-pre-wrap break-words">{{ result.head }}</pre>
      <p class="my-3 border-y border-line py-2 text-warning-fg">
        {{ t('history.truncated', { bytes: result.original_bytes ?? t('common.unknown') }) }}
      </p>
      <pre class="whitespace-pre-wrap break-words">{{ result.tail }}</pre>
    </template>
  </div>
</template>
