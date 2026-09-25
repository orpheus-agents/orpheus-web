<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '../composables/useAnalytics'
import {
  PathsApiV1AnalyticsOverviewGetParametersQueryWindow as Window,
  PathsApiV1AnalyticsOverviewGetParametersQueryBucket as Bucket,
} from '../api/generated'
import AnalyticsMetrics from '../components/AnalyticsMetrics.vue'
import ActivityChart from '../components/ActivityChart.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
import PageState from '../components/PageState.vue'
import { formatDate } from '../format'
const { t, locale } = useI18n()
const { data, error, pending, updatedAt, disconnected, refresh, filters, apply, changeWindow } = useAnalytics()
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="eyebrow">{{ t('analytics.eyebrow') }}</p>
        <h1 class="section-title mt-2">{{ t('analytics.title') }}</h1>
      </div>
      <RefreshStatus :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" />
    </div>
    <form class="flex flex-wrap items-end gap-3" @submit.prevent="apply">
      <label><span class="field-label">{{ t('filters.period') }}</span><select v-model="filters.window" :aria-label="t('filters.period')" class="field" @change="changeWindow">
        <option v-for="value in Object.values(Window)" :key="value" :value="value">{{ t(`period.${value}`) }}</option>
      </select></label>
      <label><span class="field-label">{{ t('filters.bucket') }}</span><select v-model="filters.bucket" :aria-label="t('filters.bucket')" class="field" @change="apply">
        <option v-for="value in Object.values(Bucket)" :key="value" :value="value">{{ t(`bucket.${value}`) }}</option>
      </select></label>
      <label class="min-w-44"><span class="field-label">{{ t('filters.namespace') }}</span><input
        v-model="filters.namespace"
        :aria-label="t('filters.namespace')"
        class="field"
        :placeholder="t('filters.allNamespaces')"
      ></label>
      <label class="min-w-44"><span class="field-label">{{ t('filters.timezone') }}</span><input v-model="filters.timezone" class="field" required :aria-label="t('filters.timezone')"></label>
      <button class="button min-h-10" type="submit">{{ t('filters.apply') }}</button>
    </form>
    <template v-if="data">
      <AnalyticsMetrics :overview="data" />
      <ActivityChart :overview="data" />
      <p class="max-w-4xl text-xs leading-5 text-muted">
        {{ t('analytics.periodHint') }}
        <span>{{ formatDate(data.from, locale, data.timezone) }} — {{ formatDate(data.to, locale, data.timezone) }}</span>
      </p>
    </template>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
