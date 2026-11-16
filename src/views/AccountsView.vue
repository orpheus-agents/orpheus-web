<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAccounts } from '../composables/useLLMCatalog'
import { useLimits } from '../composables/useLimits'
import { useCatalogs } from '../composables/useCatalogs'
import CatalogFilters from '../components/CatalogFilters.vue'
import CatalogPager from '../components/CatalogPager.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
import AccountLimitsCard from '../components/AccountLimitsCard.vue'
const { t } = useI18n()
const list = useAccounts()
const limits = useLimits(() => list.data.value?.items.map((account) => account.id) ?? [])
const catalogs = useCatalogs(() => list.data.value?.items.flatMap((account) => account.profiles) ?? [])
const { data, error, pending, stale, updatedAt, disconnected, refresh, filters, state, invalidCursor } = list
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="section-title">{{ t('accounts.title') }}</h1>
      <div class="flex flex-wrap items-center gap-4">
        <RefreshStatus :updated-at="updatedAt" :disconnected="(disconnected && !invalidCursor) || limits.disconnected.value || catalogs.disconnected.value" :pending="pending" @refresh="refresh(); limits.refresh(); catalogs.refresh()" />
        <RouterLink :to="{ name: 'newAccount' }" class="button-primary">{{ t('accounts.add') }}</RouterLink>
      </div>
    </div>
    <CatalogFilters v-model:search="filters.search" :activity="state.activity" @activity="list.changeActivity" @search="list.search" />
    <div v-if="invalidCursor" class="panel p-6 text-center" role="alert">
      <EmptyState :title="t('templates.invalidCursorTitle')" :hint="t('templates.invalidCursorHint')" />
      <button class="button" @click="list.firstPage">{{ t('templates.firstPage') }}</button>
    </div>
    <div v-else-if="data" class="space-y-5 transition-opacity" :class="{ 'opacity-50': stale }" :aria-busy="stale || undefined">
      <AccountLimitsCard v-for="account in data.items" :key="account.id" :record="account" :limits-pending="limits.pending.value" :limits-failed="limits.disconnected.value" :account="limits.data.value?.items.find((item) => item.account_id === account.id)" :profiles="catalogs.profiles.value" />
      <EmptyState v-if="!data.items.length" :title="t('accounts.emptyTitle')" :hint="state.search.trim() ? t('catalog.emptyFiltered') : t('accounts.emptyHint')" />
      <CatalogPager :limit="state.limit" :page="state.page" :next-cursor="data.next_cursor" :prev-cursor="data.prev_cursor" :pending="pending" @limit="list.changeLimit" @next="list.next" @previous="list.previous" />
    </div>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
