<script setup lang="ts">
import { computed, useId } from 'vue'
import { UserRound } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { useAccountOptions } from '../composables/useAccountOptions'
import HeaderMenu from './HeaderMenu.vue'
const accountId = defineModel<string>({ required: true })
const props = defineProps<{ accounts: ReturnType<typeof useAccountOptions>; error?: string }>()
const { t } = useI18n()
const id = useId()
const { options, selected, current } = props.accounts
const choices = computed(() => options.items.value.map((item) => ({
  value: item.id, label: item.name, note: item.id.slice(0, 8) + (item.active ? '' : ` · ${t('templates.inactive')}`),
})))
const text = computed(() => current.value ? `${current.value.name} · ${current.value.id.slice(0, 8)}` : accountId.value ? t(selected.error.value ? 'profiles.accountUnavailable' : 'common.loading', { id: accountId.value }) : t('catalog.choose'))
function end() { if (!options.moreError.value) void options.more() }
</script>
<template>
  <div class="min-w-0">
    <label :for="id" class="field-label">{{ t('profiles.account') }}</label>
    <HeaderMenu
      v-model="accountId" :field-id="id" :label="t('profiles.account')" :icon="UserRound"
      :text="text" :options="choices" searchable remote :invalid="!!error" :described-by="`${id}-hint`"
      @search="options.search" @end="end"
    >
      <template #footer>
        <div class="px-3 py-2 text-sm text-muted" aria-live="polite">
          <p v-if="options.error.value" class="flex items-center justify-between gap-2">
            {{ t('catalog.loadFailed') }}<button type="button" class="button h-8 px-3" @click="options.reload">{{ t('common.retry') }}</button>
          </p>
          <p v-else-if="options.pending.value">{{ t('common.loading') }}</p>
          <p v-else-if="options.loaded.value && !options.items.value.length">{{ t('settings.nothingFound') }}</p>
          <p v-if="options.moreError.value">{{ t('catalog.loadFailed') }}</p>
          <button v-if="options.next.value" type="button" class="button mt-1 h-8 w-full" :aria-busy="options.loadingMore.value" @click="options.more">
            {{ options.loadingMore.value ? t('common.loading') : t('catalog.more') }}
          </button>
        </div>
      </template>
    </HeaderMenu>
    <div :id="`${id}-hint`" class="mt-1 text-xs text-muted">
      <p v-if="error" class="field-error">{{ error }}</p>
      <p v-if="current && !current.active">{{ t('profiles.inactiveAccountHint') }}</p>
      <p v-if="accountId && selected.error.value" class="flex items-center gap-2">
        {{ t('catalog.loadFailed') }}<button type="button" class="text-accent-ink underline" @click="selected.refresh">{{ t('common.retry') }}</button>
      </p>
    </div>
  </div>
</template>
