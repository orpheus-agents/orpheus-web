<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ServiceCodes } from '../api/generated'
import NameList from './NameList.vue'
defineProps<{ services: ServiceCodes }>()
const { t } = useI18n()
</script>
<template>
  <span v-if="!services.length">{{ t('services.empty') }}</span>
  <NameList v-else :names="services" />
</template>
