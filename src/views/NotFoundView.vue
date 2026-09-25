<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EmptyState from '../components/EmptyState.vue'
const { t } = useI18n()
</script>
<template>
  <div class="panel p-8 text-center">
    <EmptyState :title="t('common.notFound')" /><RouterLink class="button" to="/">{{ t('nav.analytics') }}</RouterLink>
  </div>
</template>
