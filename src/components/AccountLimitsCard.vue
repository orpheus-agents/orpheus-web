<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AccountLimitItemState, type AccountLimitItem } from '../api/generated'
import { formatNumber } from '../format'
import LimitWindow from './LimitWindow.vue'
import RelativeTime from './RelativeTime.vue'

const props = defineProps<{ account: AccountLimitItem }>()
const { t, locale } = useI18n()
// One indicator in the corner: the marker carries freshness, the text the observation time or why there is none.
// The reset count sits right under it, so a stale count is read together with its staleness.
const indicator = computed(() => {
  switch (props.account.state) {
    case AccountLimitItemState.fresh:
      return { marker: 'bg-accent', text: 'text-accent-ink', label: null }
    case AccountLimitItemState.stale:
      return { marker: 'bg-muted', text: 'text-muted', label: t('status.stale') }
    case AccountLimitItemState.unavailable:
      return { marker: 'bg-danger', text: 'text-danger-ink', label: t('status.unavailable') }
    default:
      return { marker: 'bg-muted', text: 'text-muted', label: t('limits.noObservation') }
  }
})
</script>
<template>
  <article class="panel p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="font-mono text-base font-semibold">{{ account.account_id }}</h2>
        <p class="mt-1 font-mono text-xs text-muted">{{ t('limits.profiles') }}: {{ account.profiles.join(', ') }}</p>
      </div>
      <div class="font-mono text-xs sm:text-right">
        <p class="flex items-center gap-2 whitespace-nowrap leading-6 sm:justify-end" :class="indicator.text" :title="t(`limits.state.${account.state}`)">
          <span class="marker" :class="indicator.marker" aria-hidden="true" />{{ indicator.label
          }}<template v-if="account.observed_at"><template v-if="indicator.label"> · </template><RelativeTime :timestamp="account.observed_at" /></template>
        </p>
        <p v-if="account.reset_credits_available !== null" class="mt-1" :class="account.state === AccountLimitItemState.fresh ? 'text-ink' : 'text-muted'">
          {{ t('limits.resetsAvailable', { value: formatNumber(account.reset_credits_available, locale) }, account.reset_credits_available) }}
        </p>
      </div>
    </div>
    <p v-if="account.error_code" class="mt-4 text-sm text-danger-ink">
      {{ t(`limits.errors.${account.error_code}`) }}
      <span v-if="account.last_attempt_at">{{ t('limits.attempt') }} <RelativeTime :timestamp="account.last_attempt_at" /></span>
    </p>
    <div v-if="account.buckets.length" class="mt-5 space-y-5">
      <section v-for="bucket in account.buckets" :key="bucket.limit_id">
        <div class="mb-3 flex flex-wrap items-baseline gap-3">
          <h3 class="text-sm font-medium">{{ bucket.limit_name ?? bucket.limit_id }}</h3>
          <span v-if="bucket.plan_type" class="text-xs text-muted">{{ bucket.plan_type }}</span><span v-if="bucket.rate_limit_reached_type" class="text-xs text-danger-ink">{{
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
