<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Service } from '../api/generated'
import DescribedName from './DescribedName.vue'
defineProps<{ services: Service[] }>()
const { t } = useI18n()
</script>
<template>
  <span v-if="!services.length">{{ t('services.empty') }}</span>
  <ul v-else class="flex flex-wrap gap-x-1.5 gap-y-1">
    <li v-for="(service, index) in services" :key="service.code" class="min-w-0 wrap-break-word">
      <DescribedName :name="service.name" :description="service.description">
        <ul :aria-label="t('services.environment')" class="mt-2 space-y-0.5 border-t border-line pt-2 font-mono text-xs">
          <li v-for="name in service.env_from" :key="name" class="break-all">{{ name }}</li>
        </ul>
      </DescribedName><span v-if="index < services.length - 1" aria-hidden="true">,</span>
    </li>
  </ul>
</template>
