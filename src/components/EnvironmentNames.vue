<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Run } from '../api/generated'
defineProps<{ names: Run['harness_env_names'] }>()
const { t } = useI18n()
</script>

<template>
  <span v-if="names === null">{{ t('services.unknownEnvironment') }}</span>
  <span v-else-if="!names.length">{{ t('services.emptyEnvironment') }}</span>
  <span v-else class="break-all font-mono">{{ names.join(', ') }}</span>
</template>
