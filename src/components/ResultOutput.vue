<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { JSONResultType, TextResultType, type ToolResult } from '../api/generated'
defineProps<{ result: ToolResult }>()
const { t } = useI18n()
</script>
<template>
  <div class="console max-h-96">
    <pre v-if="result.type === TextResultType.text" class="whitespace-pre-wrap break-words">{{ result.text }}</pre>
    <pre v-else-if="result.type === JSONResultType.json" class="whitespace-pre-wrap break-words">{{
      JSON.stringify(result.value, null, 2)
    }}</pre>
    <template v-else>
      <pre class="whitespace-pre-wrap break-words">{{ result.head }}</pre>
      <p class="my-3 border-y border-term-line py-2 text-term-dim">
        {{ t('history.truncated', { bytes: result.original_bytes ?? t('common.unknown') }) }}
      </p>
      <pre class="whitespace-pre-wrap break-words">{{ result.tail }}</pre>
    </template>
  </div>
</template>
