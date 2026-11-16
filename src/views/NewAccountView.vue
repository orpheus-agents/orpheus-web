<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { sectionLinks } from '../router'
import AccountEditor from '../components/AccountEditor.vue'
const { t } = useI18n()
</script>
<template>
  <div class="space-y-6">
    <RouterLink :to="sectionLinks.accounts" class="caps text-muted hover:text-ink">{{ t('accounts.back') }}</RouterLink>
    <h1 class="section-title">{{ t('nav.newAccount') }}</h1>
    <AccountEditor class="max-w-3xl" />
  </div>
</template>
