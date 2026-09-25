<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Session } from '../api/generated'
import { formatDuration, formatNumber } from '../format'
import StatusBadge from './StatusBadge.vue'
import CopyButton from './CopyButton.vue'
import ErrorDetails from './ErrorDetails.vue'
defineProps<{ session: Session }>()
const { t, locale } = useI18n()
</script>
<template>
  <section class="panel p-5">
    <h2 class="panel-title mb-4">{{ t('session.configuration') }}</h2>
    <dl class="space-y-3 text-xs">
      <div>
        <dt class="field-label">{{ t('sessions.profile') }}</dt>
        <dd>{{ session.configuration.agent.profile }} · {{ session.configuration.agent.model }}</dd>
      </div>
      <div>
        <dt class="field-label">{{ t('session.tokenBudget') }}</dt>
        <dd>{{ formatNumber(session.configuration.limits.max_session_tokens, locale) }}</dd>
      </div>
      <div>
        <dt class="field-label">{{ t('session.runTimeout') }}</dt>
        <dd>{{ formatDuration(session.configuration.limits.run_timeout_seconds, locale) }}</dd>
      </div>
    </dl>
    <details class="mt-4">
      <summary class="cursor-pointer text-xs text-accent-ink">{{ t('session.fullConfiguration') }}</summary>
      <pre class="console mt-3 max-h-96 whitespace-pre-wrap break-words">{{
        JSON.stringify(session.configuration, null, 2)
      }}</pre>
    </details>
    <div class="mt-5 flex items-center justify-between border-t border-line pt-4">
      <h3 class="panel-title text-base">{{ t('session.sandbox') }}</h3>
      <StatusBadge :value="session.sandbox.state" />
    </div>
    <dl class="mt-3 space-y-3 text-xs">
      <div>
        <dt class="field-label">{{ t('session.template') }}</dt>
        <dd class="font-mono">{{ session.configuration.sandbox.template }}</dd>
      </div>
      <div>
        <dt class="field-label">{{ t('session.sandboxId') }}</dt>
        <dd class="flex items-center gap-2 break-all font-mono">
          {{ session.sandbox.id ?? t('common.notSet')
          }}<CopyButton v-if="session.sandbox.id" :value="session.sandbox.id" />
        </dd>
      </div>
      <div>
        <dt class="field-label">{{ t('session.workspace') }}</dt>
        <dd class="break-all font-mono">{{ session.sandbox.workspace ?? t('common.notSet') }}</dd>
      </div>
    </dl>
    <ErrorDetails v-if="session.sandbox.error" class="mt-3" :error="session.sandbox.error" />
  </section>
</template>
