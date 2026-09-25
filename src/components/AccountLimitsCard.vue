<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { AccountLimitItemState, type AccountLimitItem } from '../api/generated'
import StatusBadge from './StatusBadge.vue'
import LimitWindow from './LimitWindow.vue'
import RelativeTime from './RelativeTime.vue'
defineProps<{ account: AccountLimitItem }>()
const { t } = useI18n()
</script>
<template>
  <article class="panel p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="font-mono text-base font-semibold">{{ account.account_id }}</h2>
        <p class="mt-1 text-xs text-muted">{{ t('limits.profiles') }}: {{ account.profiles.join(', ') }}</p>
      </div>
      <StatusBadge :value="account.state" />
    </div>
    <p class="my-4 text-xs text-muted">
      {{ t(`limits.state.${account.state}`) }}
      <span v-if="account.observed_at">{{ t('limits.observed') }} <RelativeTime :timestamp="account.observed_at" /></span>
    </p>
    <p v-if="account.error_code" class="mb-4 text-xs text-warning-fg">
      {{ t(`limits.errors.${account.error_code}`) }}
      <span v-if="account.last_attempt_at">{{ t('limits.attempt') }} <RelativeTime :timestamp="account.last_attempt_at" /></span>
    </p>
    <div class="space-y-5">
      <section v-for="bucket in account.buckets" :key="bucket.limit_id">
        <div class="mb-3 flex flex-wrap items-baseline gap-3">
          <h3 class="text-sm font-medium">{{ bucket.limit_name ?? bucket.limit_id }}</h3>
          <span v-if="bucket.plan_type" class="text-xs text-muted">{{ bucket.plan_type }}</span><span v-if="bucket.rate_limit_reached_type" class="text-xs text-warning-fg">{{
            bucket.rate_limit_reached_type
          }}</span>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <LimitWindow
            v-if="bucket.primary"
            :window="bucket.primary"
            :label="t('limits.primary')"
            :stale="account.state !== AccountLimitItemState.fresh"
          />
          <LimitWindow
            v-if="bucket.secondary"
            :window="bucket.secondary"
            :label="t('limits.secondary')"
            :stale="account.state !== AccountLimitItemState.fresh"
          />
          <p v-if="!bucket.primary && !bucket.secondary" class="text-sm text-muted">{{ t('limits.noWindows') }}</p>
        </div>
      </section>
    </div>
  </article>
</template>
