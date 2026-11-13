<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Template } from '../api/generated'
import { PAGE_SIZES, TEMPLATE_ACTIVITY, useTemplates } from '../composables/useTemplates'
import { useTemplateActions } from '../composables/useTemplateActions'
import { useToasts } from '../composables/useToasts'
import CursorPager from '../components/CursorPager.vue'
import EmptyState from '../components/EmptyState.vue'
import PageState from '../components/PageState.vue'
import RefreshStatus from '../components/RefreshStatus.vue'
import TemplatesTable from '../components/TemplatesTable.vue'
const { t } = useI18n()
const { push } = useToasts()
const list = useTemplates()
const { data, error, pending, stale, updatedAt, disconnected, refresh, filters, state, invalidCursor } = list
const actions = useTemplateActions()
async function toggle(template: Template, active: boolean) {
  const result = await actions.update(template.id, { active })
  if (!result.ok) return
  push(t(active ? 'templates.enabled' : 'templates.disabled', { name: template.name }))
  // Show the new state at once; the refresh then applies the activity filter.
  if (data.value) data.value = { ...data.value, items: data.value.items.map((item) => (item.id === template.id ? result.value : item)) }
  void refresh()
}
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="section-title">{{ t('templates.title') }}</h1>
      <div class="flex flex-wrap items-center gap-4">
        <RefreshStatus :updated-at="updatedAt" :disconnected="disconnected && !invalidCursor" :pending="pending" @refresh="refresh" />
        <RouterLink :to="{ name: 'newTemplate' }" class="button-primary">{{ t('templates.add') }}</RouterLink>
      </div>
    </div>
    <p class="max-w-3xl text-sm leading-6 text-muted">{{ t('templates.hint') }}</p>
    <div class="flex flex-wrap items-end gap-3">
      <div class="inline-flex border border-ink" role="group" :aria-label="t('templates.activity.label')">
        <button
          v-for="activity in TEMPLATE_ACTIVITY"
          :key="activity"
          class="caps h-10 px-5 font-semibold transition"
          :class="state.activity === activity ? 'bg-ink text-surface' : 'text-muted hover:text-ink'"
          :aria-pressed="state.activity === activity"
          @click="list.changeActivity(activity)"
        >
          {{ t(`templates.activity.${activity}`) }}
        </button>
      </div>
      <form class="flex flex-wrap items-end gap-3" role="search" @submit.prevent="list.search">
        <label><span class="field-label">{{ t('templates.search') }}</span><input
          v-model="filters.search"
          type="search"
          class="field"
          :placeholder="t('templates.searchPlaceholder')"
        ></label>
        <button class="button" type="submit">{{ t('filters.apply') }}</button>
      </form>
      <label class="ml-auto"><span class="field-label">{{ t('templates.pageSize') }}</span><select
        class="field w-24"
        :value="state.limit"
        @change="list.changeLimit(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="size in PAGE_SIZES" :key="size" :value="size">{{ size }}</option>
      </select></label>
    </div>
    <div v-if="invalidCursor" class="panel p-6 text-center" role="alert">
      <EmptyState :title="t('templates.invalidCursorTitle')" :hint="t('templates.invalidCursorHint')" />
      <button class="button" @click="list.firstPage">{{ t('templates.firstPage') }}</button>
    </div>
    <div v-else-if="data" class="panel overflow-hidden transition-opacity" :class="{ 'opacity-50': stale }" :aria-busy="stale || undefined">
      <TemplatesTable v-if="data.items.length" :templates="data.items" :busy="actions.busy" @toggle="toggle" />
      <EmptyState v-else :title="t('templates.emptyTitle')" :hint="state.search.trim() ? t('templates.emptyFiltered') : t('templates.emptyHint')" />
      <div v-if="data.prev_cursor || data.next_cursor || state.page > 1" class="flex justify-end border-t border-line px-5 py-4">
        <CursorPager
          :previous-cursor="data.prev_cursor"
          :next-cursor="data.next_cursor"
          :page="state.page"
          :pending="pending"
          @previous="list.previous"
          @next="list.next"
        />
      </div>
    </div>
    <PageState v-else :loading="pending" :error="error" @retry="refresh" />
  </div>
</template>
