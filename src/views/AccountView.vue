<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { ApiError } from '../api/client'
import { useAccount } from '../composables/useLLMCatalog'
import { sectionLinks } from '../router'
import AccountEditor from '../components/AccountEditor.vue'
import AccountAuthEditor from '../components/AccountAuthEditor.vue'
import CatalogControls from '../components/CatalogControls.vue'
import CopyButton from '../components/CopyButton.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
const props = defineProps<{ id: string }>()
const { t } = useI18n()
const { data, error, pending, updatedAt, disconnected, refresh } = useAccount(() => props.id)
const missing = computed(() => error.value instanceof ApiError && [404, 422].includes(error.value.status))
</script>
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4"><RouterLink :to="sectionLinks.accounts" class="caps flex items-center gap-2 text-muted hover:text-ink"><ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('accounts.back') }}</RouterLink><RefreshStatus v-if="!missing" :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" /></div>
    <EmptyState v-if="missing" :title="t('catalog.notFound')" :hint="t('accounts.notFoundHint')" />
    <template v-else-if="data">
      <h1 class="break-all font-display text-2xl font-bold tracking-title sm:text-3xl">{{ data.name }}</h1>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div class="space-y-5"><AccountEditor :key="data.id" :record="data" @saved="refresh" /><AccountAuthEditor :key="data.id" :record="data" @saved="refresh" /></div>
        <aside class="space-y-5">
          <section class="panel p-5">
            <dl class="space-y-4 text-sm">
              <div><dt class="field-label">{{ t('catalog.id') }}</dt><dd class="flex items-center gap-2 break-all font-mono text-xs">{{ data.id }}<CopyButton :value="data.id" /></dd></div>
              <div><dt class="field-label">{{ t('accounts.harness') }}</dt><dd class="font-mono">{{ data.harness }}</dd></div>
              <div><dt class="field-label">{{ t('accounts.authMode') }}</dt><dd>{{ t(`accounts.mode.${data.auth_mode}`) }}</dd></div>
              <div v-if="data.credential_store"><dt class="field-label">{{ t('accounts.store') }}</dt><dd class="font-mono">{{ data.credential_store }}</dd></div>
              <div><dt class="field-label">{{ t('limits.profiles') }}</dt><dd>{{ data.profiles.join(', ') || t('common.notSet') }}</dd></div>
            </dl>
          </section>
          <CatalogControls :id="data.id" kind="accounts" :active="data.active" @changed="refresh" />
        </aside>
      </div>
    </template>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
