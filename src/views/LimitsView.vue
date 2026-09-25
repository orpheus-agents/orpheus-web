<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLimits } from '../composables/useLimits'
import AccountLimitsCard from '../components/AccountLimitsCard.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
const { t } = useI18n()
const { data, error, pending, disconnected, updatedAt, refresh } = useLimits()
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="section-title">{{ t('limits.title') }}</h1>
      <RefreshStatus :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" />
    </div>
    <p class="max-w-3xl text-sm leading-6 text-muted">{{ t('limits.hint') }}</p>
    <template v-if="data">
      <div v-if="!data.items.length" class="panel">
        <EmptyState :title="t('limits.emptyTitle')" :hint="t('limits.emptyHint')" />
      </div>
      <AccountLimitsCard v-for="account in data.items" :key="account.account_id" :account="account" />
    </template>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
