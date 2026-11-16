<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CATALOG_ACTIVITY, type CatalogActivity } from '../composables/useCatalogList'
defineProps<{ activity: CatalogActivity }>()
const search = defineModel<string>('search', { required: true })
const emit = defineEmits<{ activity: [value: CatalogActivity]; search: [] }>()
const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="inline-flex border border-ink" role="group" :aria-label="t('templates.activity.label')">
      <button v-for="value in CATALOG_ACTIVITY" :key="value" class="caps h-10 px-5 font-semibold transition" :class="activity === value ? 'bg-ink text-surface' : 'text-muted hover:text-ink'" :aria-pressed="activity === value" @click="emit('activity', value)">{{ t(`templates.activity.${value}`) }}</button>
    </div>
    <form class="flex flex-wrap items-end gap-3" role="search" @submit.prevent="emit('search')">
      <label><span class="field-label">{{ t('catalog.search') }}</span><input v-model="search" type="search" class="field" :placeholder="t('catalog.searchPlaceholder')"></label>
      <button class="button" type="submit">{{ t('filters.apply') }}</button>
    </form>
  </div>
</template>
