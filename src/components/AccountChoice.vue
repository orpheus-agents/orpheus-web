<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAccountOptions } from '../composables/useAccountOptions'
import RefreshStatus from './RefreshStatus.vue'
const id = defineModel<string>({ required: true })
defineProps<{ error?: string }>()
const { t } = useI18n()
const { search, page, selected, options, apply, move } = useAccountOptions(() => id.value)
</script>
<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3"><span class="field-label">{{ t('profiles.account') }}</span><RefreshStatus :pending="page.pending.value" :updated-at="page.updatedAt.value" :disconnected="page.disconnected.value || selected.disconnected.value" @refresh="page.refresh(); selected.refresh()" /></div>
    <div class="flex gap-2"><input v-model="search" type="search" class="field" :aria-label="t('catalog.search')" :placeholder="t('catalog.searchPlaceholder')" @keydown.enter.prevent="apply"><button type="button" class="button" @click="apply">{{ t('filters.apply') }}</button></div>
    <select v-model="id" class="field" :aria-label="t('profiles.account')" :aria-invalid="!!error"><option value="" disabled>{{ t('catalog.choose') }}</option><option v-if="id && !options.some((item) => item.id === id)" :value="id" disabled>{{ t('profiles.accountUnavailable', { id }) }}</option><option v-for="item in options" :key="item.id" :value="item.id">{{ item.name }} · {{ item.id.slice(0, 8) }}{{ item.active ? '' : ` · ${t('templates.inactive')}` }}</option></select>
    <p v-if="error" class="field-error">{{ error }}</p>
    <p v-if="selected.data.value && !selected.data.value.active" class="text-xs text-muted">{{ t('profiles.inactiveAccountHint') }}</p>
    <div v-if="page.data.value" class="flex gap-2"><button v-if="page.data.value.prev_cursor" type="button" class="button" :disabled="page.pending.value" @click="move(page.data.value.prev_cursor)">{{ t('templates.previous') }}</button><button v-if="page.data.value.next_cursor" type="button" class="button" :disabled="page.pending.value" @click="move(page.data.value.next_cursor)">{{ t('templates.next') }}</button></div>
  </div>
</template>
