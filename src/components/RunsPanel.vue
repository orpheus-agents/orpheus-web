<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRuns } from '../composables/useRuns'
import StatusBadge from './StatusBadge.vue'
import RelativeTime from './RelativeTime.vue'
import PageState from './PageState.vue'
const props = defineProps<{ sid: string; selected: string }>()
const { t } = useI18n()
const { data, error, pending, refresh, cursor } = useRuns(toRef(props, 'sid'))
</script>
<template>
  <section class="panel overflow-hidden">
    <h2 class="border-b border-line px-5 py-4 font-semibold">{{ t('run.list') }}</h2>
    <template v-if="data">
      <RouterLink
        v-for="run in data.items"
        :key="run.id"
        :to="`/sessions/${sid}/runs/${run.id}`"
        class="flex items-center justify-between gap-3 border-b border-line px-5 py-3 hover:bg-surface"
        :class="{ 'bg-brand/5': run.id === selected }"
      >
        <span class="text-xs"><span class="font-medium">{{ t('run.title', { number: run.number }) }}</span><RelativeTime class="mt-1 block text-muted" :timestamp="run.created_at" /></span><StatusBadge :value="run.status" />
      </RouterLink>
      <div v-if="cursor || data.next_cursor" class="flex justify-end gap-2 p-3">
        <button v-if="cursor" class="button" @click="cursor = undefined">{{ t('common.firstPage') }}</button><button
          :disabled="!data.next_cursor || pending"
          class="button"
          @click="cursor = data.next_cursor ?? undefined"
        >
          {{ t('common.nextPage') }}
        </button>
      </div>
    </template><PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </section>
</template>
