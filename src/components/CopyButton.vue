<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useToasts } from '../composables/useToasts'
const props = defineProps<{ value: string }>()
const { t } = useI18n()
const toasts = useToasts()
async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    toasts.push(t('common.copied'))
  } catch {
    toasts.push(t('common.copyFailed'))
  }
}
</script>
<template>
  <button class="icon-button" :aria-label="t('common.copy')" @click="copy">
    <Copy class="h-3.5 w-3.5" aria-hidden="true" />
  </button>
</template>
