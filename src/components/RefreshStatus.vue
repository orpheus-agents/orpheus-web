<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import RelativeTime from './RelativeTime.vue'
defineProps<{ updatedAt: string | null; disconnected: boolean; pending: boolean }>()
defineEmits<{ refresh: [] }>()
const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap items-center gap-3 text-xs text-muted" role="status">
    <span v-if="disconnected" class="flex items-center gap-2 text-warning-fg"><span class="h-1.5 w-1.5 rounded-full bg-warning" />{{ t('common.reconnecting') }}</span>
    <span v-if="updatedAt" class="flex items-center gap-2"><span v-if="!disconnected" class="h-1.5 w-1.5 rounded-full bg-success" />{{ t('common.updated') }}
      <RelativeTime :timestamp="updatedAt" /></span>
    <button class="icon-button" :disabled="pending" :aria-label="t('common.refresh')" @click="$emit('refresh')">
      <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': pending }" aria-hidden="true" />
    </button>
  </div>
</template>
