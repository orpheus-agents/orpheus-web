<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { sectionLinks } from '../router'
import AccountEditor from '../components/AccountEditor.vue'
const { t } = useI18n()
</script>
<template>
  <div class="space-y-6">
    <RouterLink :to="sectionLinks.accounts" class="caps flex items-center gap-2 text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('accounts.back') }}</RouterLink>
    <h1 class="section-title">{{ t('nav.newAccount') }}</h1>
    <AccountEditor class="max-w-3xl" />
  </div>
</template>
