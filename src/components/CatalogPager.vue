<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PAGE_SIZES } from '../composables/useCatalogList'
import CursorPager from './CursorPager.vue'
defineProps<{ limit: number; page: number; nextCursor: string | null; prevCursor: string | null; pending: boolean }>()
const emit = defineEmits<{ limit: [value: number]; next: [cursor: string]; previous: [cursor: string] }>()
const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4">
    <label class="flex items-center gap-3"><span class="caps text-muted">{{ t('templates.pageSize') }}</span><select class="field w-24" :value="limit" @change="emit('limit', Number(($event.target as HTMLSelectElement).value))"><option v-for="size in PAGE_SIZES" :key="size" :value="size">{{ size }}</option></select></label>
    <CursorPager v-if="prevCursor || nextCursor || page > 1" class="ml-auto" :previous-cursor="prevCursor" :next-cursor="nextCursor" :page="page" :pending="pending" @previous="emit('previous', $event)" @next="emit('next', $event)" />
  </div>
</template>
