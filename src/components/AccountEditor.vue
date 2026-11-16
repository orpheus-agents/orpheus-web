<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CreateLLMAccountAuth_mode, CreateLLMAccountHarness, type LlmAccountDetails } from '../api/generated'
import { useAccountForm } from '../composables/useAccountForm'
import PageState from './PageState.vue'
const props = defineProps<{ record?: LlmAccountDetails }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()
const { form, fieldErrors, pending, stores, submit } = useAccountForm(props.record, () => emit('saved'))
</script>
<template>
  <form class="panel space-y-5 p-5" novalidate @submit.prevent="submit">
    <label class="block"><span class="field-label">{{ t('catalog.name') }}</span><input v-model="form.name" class="field" required maxlength="255" :aria-invalid="!!fieldErrors.name"><span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span></label>
    <template v-if="!record">
      <label class="block"><span class="field-label">{{ t('accounts.harness') }}</span><select v-model="form.harness" class="field"><option v-for="value in CreateLLMAccountHarness" :key="value" :value="value">{{ value }}</option></select></label>
      <label class="block"><span class="field-label">{{ t('accounts.authMode') }}</span><select v-model="form.auth_mode" class="field"><option v-for="value in CreateLLMAccountAuth_mode" :key="value" :value="value">{{ t(`accounts.mode.${value}`) }}</option></select></label>
      <template v-if="form.auth_mode === CreateLLMAccountAuth_mode.account">
        <label v-if="stores.data.value" class="block"><span class="field-label">{{ t('accounts.store') }}</span><select v-model="form.credential_store" class="field" :aria-invalid="!!fieldErrors.credential_store"><option value="" disabled>{{ t('accounts.chooseStore') }}</option><option v-for="name in stores.data.value.items" :key="name" :value="name">{{ name }}</option></select><span v-if="fieldErrors.credential_store" class="field-error">{{ fieldErrors.credential_store }}</span></label>
        <PageState v-else :loading="stores.pending.value" :error="stores.error.value" @retry="stores.refresh" />
        <p v-if="stores.data.value && !stores.data.value.items.length" class="text-sm text-muted">{{ t('accounts.noStores') }}</p>
        <label class="block"><span class="field-label">{{ t('accounts.authFile') }}</span><textarea v-model="form.auth_file" class="field field-area font-mono text-xs" rows="12" spellcheck="false" autocomplete="off" :aria-invalid="!!fieldErrors.auth_file" /><span v-if="fieldErrors.auth_file" class="field-error">{{ fieldErrors.auth_file }}</span></label>
      </template>
      <label v-else class="block"><span class="field-label">{{ t('accounts.apiKey') }}</span><input v-model="form.api_key" type="password" class="field font-mono" autocomplete="new-password" :aria-invalid="!!fieldErrors.api_key"><span v-if="fieldErrors.api_key" class="field-error">{{ fieldErrors.api_key }}</span></label>
      <label class="flex items-center gap-3"><input v-model="form.active" type="checkbox" class="h-4 w-4 accent-ink"><span class="text-sm">{{ t('templates.active') }}</span></label>
    </template>
    <button class="button-primary" type="submit" :disabled="pending">{{ pending ? t('catalog.saving') : t('catalog.save') }}</button>
  </form>
</template>
