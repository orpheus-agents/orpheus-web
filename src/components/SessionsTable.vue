<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Session } from '../api/generated'
import { formatCompactNumber, formatNumber } from '../format'
import StatusBadge from './StatusBadge.vue'
import RelativeTime from './RelativeTime.vue'
import EmptyState from './EmptyState.vue'
defineProps<{ sessions: Session[] }>()
const { t, locale } = useI18n()
</script>
<template>
  <EmptyState v-if="!sessions.length" :title="t('sessions.emptyTitle')" :hint="t('sessions.emptyHint')" />
  <div v-else class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('sessions.session') }}</th>
          <th>{{ t('sessions.context') }}</th>
          <th>{{ t('sessions.profile') }}</th>
          <th>{{ t('sessions.status') }}</th>
          <th>{{ t('sessions.lastRun') }}</th>
          <th class="text-right">{{ t('sessions.tokens') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="session in sessions" :key="session.id">
          <td>
            <RouterLink
              :to="`/sessions/${session.id}`"
              class="font-mono font-medium text-brand hover:underline"
              :title="session.id"
            >
              {{ session.id.slice(0, 8) }}
            </RouterLink>
          </td>
          <td class="max-w-xs">
            <p class="truncate font-medium" :title="session.namespace ?? undefined">
              {{ session.namespace ?? t('common.notSet') }}
            </p>
            <p class="mt-1 truncate font-mono text-xs text-muted" :title="session.external_key ?? undefined">
              {{ session.external_key ?? t('common.notSet') }}
            </p>
          </td>
          <td>
            <p>{{ session.configuration.agent.profile }}</p>
            <p class="mt-1 whitespace-nowrap text-xs text-muted">{{ session.configuration.agent.model }}</p>
          </td>
          <td>
            <StatusBadge :value="session.status" />
            <p v-if="session.phase" class="mt-1 text-xs text-muted">{{ t(`phase.${session.phase}`) }}</p>
          </td>
          <td class="whitespace-nowrap text-xs text-muted">
            <RelativeTime :timestamp="session.last_run_created_at" />
          </td>
          <td class="text-right font-mono tabular-nums" :title="formatNumber(session.usage.total_tokens, locale)">
            {{ formatCompactNumber(session.usage.total_tokens, locale) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
