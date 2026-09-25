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
const { t } = useI18n()
const { data, error, pending, stale, updatedAt, disconnected, refresh, filters, apply, changeWindow } = useAnalytics()
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="section-title">{{ t('analytics.title') }}</h1>
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
      <button class="button" type="submit">{{ t('filters.apply') }}</button>
    </form>
    <div v-if="data" class="space-y-6 transition-opacity" :class="{ 'opacity-50': stale }" :aria-busy="stale || undefined">
      <AnalyticsMetrics :overview="data" />
      <ActivityChart :overview="data" />
    </div>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
