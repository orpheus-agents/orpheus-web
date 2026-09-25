<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Run } from '../api/generated'
import { formatDate, formatDuration, formatNumber } from '../format'
import { usePolling } from '../composables/usePolling'
import StatusBadge from './StatusBadge.vue'
import HookResultCard from './HookResultCard.vue'
import ErrorDetails from './ErrorDetails.vue'
defineProps<{ run: Run }>()
const { t, locale } = useI18n()
const now = ref(Date.now())
usePolling(async () => {
  now.value = Date.now()
}, 5000)
</script>
<template>
  <section class="panel p-5">
    <div class="mb-5 flex items-center justify-between">
      <h2 class="font-semibold">{{ t('run.title', { number: run.number }) }}</h2>
      <StatusBadge :value="run.status" />
    </div>
    <dl class="space-y-3 text-xs">
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.accepted') }}</dt>
        <dd class="text-right">{{ formatDate(run.created_at, locale) }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.started') }}</dt>
        <dd class="text-right">
          {{ run.execution_started_at ? formatDate(run.execution_started_at, locale) : t('common.notSet') }}
        </dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.finished') }}</dt>
        <dd class="text-right">{{ run.finished_at ? formatDate(run.finished_at, locale) : t('common.notSet') }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.runtime') }}</dt>
        <dd>
          {{
            formatDuration(
              ((run.finished_at ? Date.parse(run.finished_at) : now) - Date.parse(run.created_at)) / 1000,
              locale,
            )
          }}
        </dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.deadline') }}</dt>
        <dd>{{ run.deadline_at ? formatDate(run.deadline_at, locale) : t('common.notSet') }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.phase') }}</dt>
        <dd>{{ run.phase ? t(`phase.${run.phase}`) : t('common.notSet') }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.agent') }}</dt>
        <dd>{{ run.agent_status ? t(`status.${run.agent_status}`) : t('common.notSet') }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.observation') }}</dt>
        <dd>{{ run.observation ? t(`observation.${run.observation}`) : t('common.notSet') }}</dd>
      </div>
      <div v-if="run.stop_reason" class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.stopReason') }}</dt>
        <dd>
          {{ t(`stop.${run.stop_reason}`) }} ·
          {{ run.stop_method ? t(`stopMethod.${run.stop_method}`) : t('common.notSet') }}
        </dd>
      </div>
      <div class="flex justify-between gap-3 border-t border-line pt-3">
        <dt class="text-muted">{{ t('analytics.tokens') }}</dt>
        <dd class="font-mono">{{ formatNumber(run.usage.total_tokens, locale) }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">{{ t('run.inputOutput') }}</dt>
        <dd class="font-mono">
          {{ formatNumber(run.usage.input_tokens, locale) }} / {{ formatNumber(run.usage.output_tokens, locale) }}
        </dd>
      </div>
    </dl>
    <ErrorDetails v-if="run.error" class="mt-4" :error="run.error" />
    <ErrorDetails v-if="run.agent_error" class="mt-4" :error="run.agent_error" />
    <div v-if="run.hooks.length" class="mt-5 space-y-2 border-t border-line pt-4">
      <h3 class="field-label">{{ t('run.hooks') }}</h3>
      <HookResultCard v-for="hook in run.hooks" :key="hook.id" :hook="hook" />
    </div>
  </section>
</template>
