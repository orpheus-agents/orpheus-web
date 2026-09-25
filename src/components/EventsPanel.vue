<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEvents } from '../composables/useEvents'
import { formatDate } from '../format'
import PageState from './PageState.vue'
const props = defineProps<{ sid: string }>()
const { t, locale } = useI18n()
const { data, error, pending, refresh, after } = useEvents(toRef(props, 'sid'))
</script>
<template>
  <div v-if="data" class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('events.sequence') }}</th>
          <th>{{ t('events.type') }}</th>
          <th>{{ t('events.time') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in data.items" :key="event.id">
          <td class="font-mono text-xs">{{ event.id }}</td>
          <td class="font-mono text-xs">{{ event.type }}</td>
          <td class="text-xs">{{ formatDate(event.created_at, locale) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-end gap-2 p-4">
      <button v-if="after !== '0'" class="button" @click="after = '0'">{{ t('common.firstPage') }}</button><button class="button" :disabled="!data.has_more" @click="after = data.next_cursor">
        {{ t('common.nextPage') }}
      </button>
    </div>
  </div>
  <PageState v-else :loading="pending" :error="error" @retry="refresh" />
</template>
