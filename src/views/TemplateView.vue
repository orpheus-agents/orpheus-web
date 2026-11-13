<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { ApiError } from '../api/client'
import type { UpdateTemplate } from '../api/generated'
import { useTemplate } from '../composables/useTemplate'
import { useTemplateActions } from '../composables/useTemplateActions'
import { useToasts } from '../composables/useToasts'
import { sectionLinks } from '../router'
import CopyButton from '../components/CopyButton.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
import TemplateDelete from '../components/TemplateDelete.vue'
import TemplateDescription from '../components/TemplateDescription.vue'
const props = defineProps<{ id: string }>()
const { t } = useI18n()
const router = useRouter()
const { push } = useToasts()
const { data, error, pending, updatedAt, disconnected, refresh } = useTemplate(() => props.id)
const actions = useTemplateActions()
const busy = computed(() => actions.busy(props.id))
// 404 is a deleted record, 422 an address that is not a record ID; neither is a connection problem.
const missing = computed(() => (error.value instanceof ApiError && [404, 422].includes(error.value.status) ? error.value.status : null))
async function update(body: UpdateTemplate, message: string) {
  const result = await actions.update(props.id, body)
  if (!result.ok) return
  data.value = result.value
  // Cancel reads started before this write so a late snapshot cannot undo the confirmed state.
  void refresh()
  push(message)
}
async function remove() {
  const name = data.value?.name
  if (!(await actions.remove(props.id)).ok) return
  push(t('templates.deleted', { name }))
  await router.push(sectionLinks.templates)
}
</script>
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <RouterLink :to="sectionLinks.templates" class="caps flex items-center gap-2 text-muted hover:text-ink">
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('templates.back') }}
      </RouterLink>
      <RefreshStatus v-if="!missing" :updated-at="updatedAt" :disconnected="disconnected" :pending="pending" @refresh="refresh" />
    </div>
    <div v-if="missing" class="panel p-8 text-center" role="alert">
      <EmptyState
        :title="missing === 404 ? t('templates.notFoundTitle') : t('templates.invalidAddressTitle')"
        :hint="missing === 404 ? t('templates.notFoundHint') : t('templates.invalidAddressHint')"
      />
      <RouterLink :to="sectionLinks.templates" class="button">{{ t('templates.back') }}</RouterLink>
    </div>
    <template v-else-if="data">
      <h1 class="break-all font-display text-2xl font-bold tracking-title sm:text-3xl">{{ data.name }}</h1>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <section class="panel space-y-6 p-5">
          <dl class="space-y-3 text-sm">
            <div><dt class="field-label">{{ t('templates.templateName') }}</dt><dd class="break-all font-mono">{{ data.template_name }}</dd></div>
            <div>
              <dt class="field-label">{{ t('templates.tag') }}</dt>
              <dd class="font-mono" :class="{ 'text-muted': !data.tag }">{{ data.tag ?? t('templates.noTag') }}</dd>
            </div>
            <div><dt class="field-label">{{ t('templates.id') }}</dt><dd class="flex items-center gap-2 break-all font-mono text-xs">{{ data.id }}<CopyButton :value="data.id" /></dd></div>
          </dl>
          <TemplateDescription :value="data.description" :pending="busy" @save="update({ description: $event }, t('templates.saved'))" />
        </section>
        <aside class="space-y-5">
          <section class="panel space-y-4 p-5">
            <p class="flex items-center gap-2 font-mono text-sm" :class="data.active ? 'font-semibold text-ink' : 'text-muted'">
              <span class="marker" :class="data.active ? 'bg-accent' : 'border border-muted'" aria-hidden="true" />{{ data.active ? t('templates.active') : t('templates.inactive') }}
            </p>
            <p class="text-sm text-muted">{{ t('templates.activeHint') }}</p>
            <button
              class="button"
              :disabled="busy"
              @click="update({ active: !data.active }, t(data.active ? 'templates.disabled' : 'templates.enabled', { name: data.name }))"
            >
              {{ data.active ? t('templates.disable') : t('templates.enable') }}
            </button>
          </section>
          <section class="panel p-5"><TemplateDelete :pending="busy" @confirm="remove" /></section>
        </aside>
      </div>
    </template>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
