<script setup lang="ts">
import { useI18n } from 'vue-i18n'
// Cursors decide which way the walk can go; the page number only counts steps and is never a jump target.
defineProps<{ previousCursor: string | null; nextCursor: string | null; page: number; pending: boolean }>()
defineEmits<{ previous: [cursor: string]; next: [cursor: string] }>()
const { t } = useI18n()
</script>
<template>
  <nav class="flex items-center gap-3" :aria-label="t('templates.pages')">
    <button class="button" :disabled="!previousCursor || pending" @click="previousCursor && $emit('previous', previousCursor)">
      {{ t('templates.previous') }}
    </button>
    <span class="caps min-w-24 text-center text-muted" aria-live="polite">{{ t('templates.page', { page }) }}</span>
    <button class="button" :disabled="!nextCursor || pending" @click="nextCursor && $emit('next', nextCursor)">
      {{ t('templates.next') }}
    </button>
  </nav>
</template>
