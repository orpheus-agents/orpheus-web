<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useProfiles } from '../composables/useLLMCatalog'
import CatalogFilters from '../components/CatalogFilters.vue'
import CatalogPager from '../components/CatalogPager.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
import ProfilesTable from '../components/ProfilesTable.vue'
const { t } = useI18n()
const list = useProfiles()
const { data, error, pending, stale, updatedAt, disconnected, refresh, filters, state, invalidCursor } = list
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="section-title">{{ t('profiles.title') }}</h1>
      <div class="flex flex-wrap items-center gap-4">
        <RefreshStatus :updated-at="updatedAt" :disconnected="(disconnected && !invalidCursor)" :pending="pending" @refresh="refresh()" />
        <RouterLink :to="{ name: 'newProfile' }" class="button-primary">{{ t('profiles.add') }}</RouterLink>
      </div>
    </div>
    <CatalogFilters v-model:search="filters.search" :activity="state.activity" @activity="list.changeActivity" @search="list.search" />
    <div v-if="invalidCursor" class="panel p-6 text-center" role="alert">
      <EmptyState :title="t('templates.invalidCursorTitle')" :hint="t('templates.invalidCursorHint')" />
      <button class="button" @click="list.firstPage">{{ t('templates.firstPage') }}</button>
    </div>
    <div v-else-if="data" class="panel overflow-hidden transition-opacity" :class="{ 'opacity-50': stale }" :aria-busy="stale || undefined">
      <ProfilesTable v-if="data.items.length" :profiles="data.items" />
      <EmptyState v-if="!data.items.length" :title="t('profiles.emptyTitle')" :hint="state.search.trim() ? t('catalog.emptyFiltered') : t('profiles.emptyHint')" />
      <CatalogPager :limit="state.limit" :page="state.page" :next-cursor="data.next_cursor" :prev-cursor="data.prev_cursor" :pending="pending" @limit="list.changeLimit" @next="list.next" @previous="list.previous" />
    </div>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
