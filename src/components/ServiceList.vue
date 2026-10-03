<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Service } from '../api/generated'
import EmptyState from './EmptyState.vue'
defineProps<{ services: Service[]; hint?: string }>()
const { t } = useI18n()
</script>
<template>
  <div>
    <h3 class="field-label">{{ t('services.title') }}</h3>
    <p v-if="hint" class="mt-2 text-xs text-muted">{{ hint }}</p>
    <EmptyState v-if="!services.length" :title="t('services.empty')" />
    <ul v-else class="mt-3 space-y-4">
      <li v-for="service in services" :key="service.code" class="min-w-0 text-sm wrap-break-word">
        <p class="font-medium">{{ service.name }}</p>
        <p class="mt-1 text-muted">{{ service.description }}</p>
        <details class="mt-2">
          <summary :aria-label="t('services.environmentFor', { name: service.name })" class="cursor-pointer text-xs text-accent-ink">{{ t('services.environment') }}</summary>
          <ul class="mt-2 space-y-1 text-xs">
            <li v-for="name in service.env_from" :key="name"><code class="break-all">{{ name }}</code></li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</template>
