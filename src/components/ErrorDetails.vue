<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Error as APIError } from '../api/generated'
defineProps<{ error: APIError }>()
const { t } = useI18n()
</script>
<template>
  <div class="rounded-lg border border-danger/30 bg-danger-bg p-3 text-xs leading-5 text-danger-fg" role="alert">
    <p class="font-mono font-semibold">{{ error.code }}</p>
    <p>{{ error.message }}</p>
    <p v-if="error.phase">{{ t('run.phase') }}: {{ t(`phase.${error.phase}`) }}</p>
    <p v-for="(detail, index) in error.details" :key="index" class="mt-1 font-mono">
      {{ detail.path.join('.') }} · {{ detail.code }}
    </p>
  </div>
</template>
