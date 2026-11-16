<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { sectionLinks } from '../router'
import ProfileEditor from '../components/ProfileEditor.vue'
const { t } = useI18n()
</script>
<template>
  <div class="space-y-6">
    <RouterLink :to="sectionLinks.profiles" class="caps text-muted hover:text-ink">{{ t('profiles.back') }}</RouterLink>
    <h1 class="section-title">{{ t('nav.newProfile') }}</h1>
    <ProfileEditor class="max-w-3xl" />
  </div>
</template>
