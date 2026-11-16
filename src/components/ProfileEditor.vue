<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CodexProfileEffort, CodexProfileSummary, CodexProfilePersonality, type Profile } from '../api/generated'
import { useProfileForm } from '../composables/useProfileForm'
import AccountChoice from './AccountChoice.vue'
const props = defineProps<{ record?: Profile }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()
const { form, pending, fieldErrors, submit } = useProfileForm(props.record, () => emit('saved'))
</script>
<template>
  <form class="panel space-y-5 p-5" novalidate @submit.prevent="submit">
    <label class="block"><span class="field-label">{{ t('catalog.name') }}</span><input v-model="form.name" :aria-label="t('catalog.name')" class="field font-mono" required maxlength="255" :disabled="!!record" :aria-invalid="!!fieldErrors.name"><span class="mt-1 block text-xs text-muted">{{ t('profiles.nameHint') }}</span><span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span></label>
    <AccountChoice v-model="form.account_id" :error="fieldErrors.account_id" />
    <p v-if="record" class="text-xs text-muted">{{ t('profiles.rebindHint') }}</p>
    <label class="block"><span class="field-label">{{ t('profiles.model') }}</span><input v-model="form.model" :aria-label="t('profiles.model')" class="field font-mono" required maxlength="255" :aria-invalid="!!fieldErrors.model"><span v-if="fieldErrors.model" class="field-error">{{ fieldErrors.model }}</span></label>
    <label class="block"><span class="field-label">{{ t('templates.description') }}</span><textarea v-model="form.description" class="field field-area" rows="3" maxlength="4096" :aria-invalid="!!fieldErrors.description" /><span v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</span></label>
    <div class="grid gap-4 sm:grid-cols-2">
      <label><span class="field-label">{{ t('profiles.effort') }}</span><select v-model="form.codex.effort" class="field"><option :value="undefined">{{ t('common.notSet') }}</option><option v-for="value in CodexProfileEffort" :key="value" :value="value">{{ value }}</option></select></label>
      <label><span class="field-label">{{ t('profiles.summary') }}</span><select v-model="form.codex.summary" class="field"><option :value="undefined">{{ t('common.notSet') }}</option><option v-for="value in CodexProfileSummary" :key="value" :value="value">{{ value }}</option></select></label>
      <label><span class="field-label">{{ t('profiles.personality') }}</span><select v-model="form.codex.personality" class="field"><option :value="undefined">{{ t('common.notSet') }}</option><option v-for="value in CodexProfilePersonality" :key="value" :value="value">{{ value }}</option></select></label>
      <label><span class="field-label">{{ t('profiles.serviceTier') }}</span><input v-model="form.codex.service_tier" class="field" :aria-invalid="!!fieldErrors.codex"></label>
    </div>
    <p v-if="fieldErrors.codex" class="field-error">{{ fieldErrors.codex }}</p>
    <label class="block"><span class="field-label">{{ t('profiles.instructions') }}</span><textarea v-model="form.instructions" class="field field-area font-mono text-xs" rows="8" :aria-invalid="!!fieldErrors.instructions" /><span v-if="fieldErrors.instructions" class="field-error">{{ fieldErrors.instructions }}</span></label>
    <label v-if="!record" class="flex items-center gap-3"><input v-model="form.active" type="checkbox" class="h-4 w-4 accent-ink"><span class="text-sm">{{ t('templates.active') }}</span></label>
    <button class="button-primary" type="submit" :disabled="pending">{{ pending ? t('catalog.saving') : t('catalog.save') }}</button>
  </form>
</template>
