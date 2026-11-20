<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ServiceCodes } from '../api/generated'
defineProps<{ services: ServiceCodes }>()
const { t } = useI18n()
</script>
<template>
  <span v-if="!services.length">{{ t('services.empty') }}</span>
  <ul v-else class="flex flex-wrap gap-x-1.5 gap-y-1 font-mono">
    <li v-for="(code, index) in services" :key="code" class="min-w-0 break-all">{{ code }}<span v-if="index < services.length - 1" aria-hidden="true">,</span></li>
  </ul>
</template>
