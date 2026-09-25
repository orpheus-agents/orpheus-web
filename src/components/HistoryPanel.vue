<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHistory } from '../composables/useHistory'
import { entity } from '../events/history'
import HistoryRow from './HistoryRow.vue'
import PageState from './PageState.vue'
import EmptyState from './EmptyState.vue'
const props = defineProps<{ sid: string; rid: string }>()
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const { items, loading, loadingMore, disconnected, error, next, trimmed, more, refresh } = useHistory(
  toRef(props, 'sid'),
  toRef(props, 'rid'),
  () => emit('changed'),
)
</script>
<template>
  <section class="panel overflow-hidden">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
      <h2 class="font-semibold">{{ t('history.title') }}</h2>
      <div class="flex items-center gap-3 text-xs text-muted">
        <span :class="disconnected ? 'text-warning-fg' : 'text-success-fg'">{{
          disconnected ? t('common.reconnecting') : t('history.live')
        }}</span><button class="button" @click="refresh">{{ t('common.refresh') }}</button>
      </div>
    </header>
    <p v-if="trimmed" class="border-b border-line px-6 py-3 text-xs text-muted">{{ t('history.windowHint') }}</p>
    <PageState v-if="loading || (error && !items.length)" :loading="loading" :error="error" @retry="refresh" />
    <EmptyState v-else-if="!items.length" :title="t('history.empty')" />
    <HistoryRow v-for="item in items" :key="entity(item).id" :item="item" />
    <div v-if="next" class="flex flex-col items-center gap-2 border-t border-line p-4">
      <p v-if="error" class="text-xs text-danger-fg" role="alert">{{ t('common.requestFailed') }}</p>
      <button class="button" :disabled="loadingMore" @click="more">{{ t('history.more') }}</button>
    </div>
  </section>
</template>
