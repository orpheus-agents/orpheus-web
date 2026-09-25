<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PathsApiV1SessionsGetParametersQueryActivity as Activity } from '../api/generated'
import { useSessions } from '../composables/useSessions'
import SessionsTable from '../components/SessionsTable.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
const { t } = useI18n()
const {
  data,
  error,
  pending,
  stale,
  updatedAt,
  disconnected,
  refresh,
  fromLocal,
  toLocal,
  filters,
  statuses,
  apply,
  changeActivity,
  changePeriod,
  page,
  hasCursor,
} = useSessions()
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="section-title">{{ t('sessions.title') }}</h1>
      <RefreshStatus :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" />
    </div>
    <div class="inline-flex border border-ink" role="group" :aria-label="t('sessions.activity')">
      <button
        v-for="activity in [Activity.active, Activity.inactive]"
        :key="activity"
        class="caps h-10 px-5 font-semibold transition"
        :class="filters.activity === activity ? 'bg-ink text-surface' : 'text-muted hover:text-ink'"
        :aria-pressed="filters.activity === activity"
        @click="changeActivity(activity)"
      >
        {{ t(`sessions.${activity}`) }}
      </button>
    </div>
    <form class="flex flex-wrap items-end gap-3" @submit.prevent="apply">
      <label><span class="field-label">{{ t('filters.namespace') }}</span><input
        v-model="filters.namespace"
        :aria-label="t('filters.namespace')"
        class="field"
        :placeholder="t('filters.allNamespaces')"
      ></label>
      <label><span class="field-label">{{ t('filters.externalKey') }}</span><input
        v-model="filters.external_key"
        :aria-label="t('filters.externalKey')"
        class="field"
        :placeholder="t('filters.exactKey')"
      ></label>
      <label><span class="field-label">{{ t('sessions.status') }}</span><select v-model="filters.status" :aria-label="t('sessions.status')" class="field" @change="apply">
        <option value="">{{ t('filters.allStatuses') }}</option>
        <option v-for="value in statuses" :key="value" :value="value">
          {{ t(`status.${value}`) }}
        </option>
      </select></label>
      <label v-if="filters.activity === Activity.inactive"><span class="field-label">{{ t('filters.period') }}</span><select v-model="filters.period" :aria-label="t('filters.period')" class="field" @change="changePeriod">
        <option v-for="period in ['all', '24h', '7d', '30d', 'custom']" :key="period" :value="period">
          {{ t(`period.${period}`) }}
        </option>
      </select></label>
      <template v-if="filters.activity === Activity.inactive && filters.period === 'custom'">
        <label><span class="field-label">{{ t('filters.from') }}</span><input v-model="fromLocal" type="datetime-local" class="field" required :max="toLocal || undefined"></label><label><span class="field-label">{{ t('filters.to') }}</span><input v-model="toLocal" type="datetime-local" class="field" required :min="fromLocal || undefined"></label>
      </template>
      <button class="button" type="submit">{{ t('filters.apply') }}</button>
    </form>
    <div v-if="data" class="panel overflow-hidden transition-opacity" :class="{ 'opacity-50': stale }" :aria-busy="stale || undefined">
      <SessionsTable :sessions="data.items" />
      <div class="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
        <p class="font-mono text-xs text-muted">{{ t('sessions.shown', data.items.length) }}</p>
        <div class="flex gap-2">
          <button v-if="hasCursor" class="button" @click="page()">{{ t('common.firstPage') }}</button><button class="button" :disabled="!data.next_cursor || pending" @click="page(data.next_cursor)">
            {{ t('common.nextPage') }}
          </button>
        </div>
      </div>
    </div>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
