<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ApiError } from '../api/client'
import { useProfile } from '../composables/useLLMCatalog'
import { sectionLinks } from '../router'
import ProfileEditor from '../components/ProfileEditor.vue'
import CatalogControls from '../components/CatalogControls.vue'
import CopyButton from '../components/CopyButton.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
const props = defineProps<{ id: string }>()
const { t } = useI18n()
const { data, error, pending, updatedAt, disconnected, refresh } = useProfile(() => props.id)
const missing = computed(() => error.value instanceof ApiError && [404, 422].includes(error.value.status))
</script>
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4"><RouterLink :to="sectionLinks.profiles" class="caps text-muted hover:text-ink">{{ t('profiles.back') }}</RouterLink><RefreshStatus v-if="!missing" :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" /></div>
    <EmptyState v-if="missing" :title="t('catalog.notFound')" :hint="t('profiles.notFoundHint')" />
    <template v-else-if="data">
      <h1 class="break-all font-display text-2xl font-bold tracking-title sm:text-3xl">{{ data.name }}</h1>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <ProfileEditor :key="data.id" :record="data" @saved="refresh" />
        <aside class="space-y-5">
          <section class="panel space-y-4 p-5"><p class="flex items-center gap-2 break-all font-mono text-xs">{{ data.id }}<CopyButton :value="data.id" /></p><p v-if="!data.account_active" class="text-sm text-muted">{{ t('profiles.inactiveAccountHint') }}</p><RouterLink :to="{ name: 'account', params: { id: data.account_id } }" class="text-sm text-accent-ink hover:underline">{{ data.account_name }}</RouterLink></section>
          <CatalogControls :id="data.id" kind="profiles" :active="data.active" @changed="refresh" />
        </aside>
      </div>
    </template>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
