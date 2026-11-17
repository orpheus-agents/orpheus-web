<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { LLMAccountDetailsAuth_mode, type LlmAccountDetails } from '../api/generated'
import { useAccountAuth } from '../composables/useAccountAuth'
const JsonField = defineAsyncComponent(() => import('./JsonField.vue'))
const props = defineProps<{ record: LlmAccountDetails }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()
const { opened, text, key, pending, fieldErrors, load, saveFile, saveKey } = useAccountAuth(() => props.record.id, () => emit('saved'))
</script>
<template>
  <section class="panel space-y-4 p-5">
    <h2 class="panel-title">{{ t('accounts.authorization') }}</h2>
    <template v-if="record.auth_mode === LLMAccountDetailsAuth_mode.account">
      <p class="text-sm text-muted">{{ t('accounts.authHint') }}</p>
      <button v-if="!opened" class="button" :disabled="pending" @click="load">{{ t('accounts.editAuth') }}</button>
      <form v-else class="space-y-4" @submit.prevent="saveFile">
        <JsonField v-model="text" :label="t('accounts.authFile')" :error="fieldErrors.auth_file" />
        <div class="flex flex-wrap gap-3"><button type="submit" class="button-primary" :disabled="pending">{{ t('catalog.save') }}</button><button type="button" class="button" :disabled="pending" @click="load">{{ t('accounts.reloadAuth') }}</button><button type="button" class="button" :disabled="pending" @click="opened = false; text = ''">{{ t('templates.cancel') }}</button></div>
      </form>
    </template>
    <form v-else class="space-y-4" @submit.prevent="saveKey">
      <p class="font-mono text-sm">{{ record.api_key_mask }}</p>
      <label class="block"><span class="field-label">{{ t('accounts.replaceKey') }}</span><input v-model="key" class="field font-code" type="password" autocomplete="new-password" :aria-invalid="!!fieldErrors.api_key"><span v-if="fieldErrors.api_key" class="field-error">{{ fieldErrors.api_key }}</span></label>
      <button type="submit" class="button-primary" :disabled="pending">{{ t('catalog.save') }}</button>
    </form>
  </section>
</template>
