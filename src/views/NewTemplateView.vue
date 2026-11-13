<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { useTemplateForm } from '../composables/useTemplateForm'
import { sectionLinks } from '../router'
const { t } = useI18n()
const { form, fieldErrors, pending, submit } = useTemplateForm()
</script>
<template>
  <div class="space-y-6">
    <RouterLink :to="sectionLinks.templates" class="caps flex items-center gap-2 text-muted hover:text-ink">
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />{{ t('templates.back') }}
    </RouterLink>
    <h1 class="section-title">{{ t('nav.newTemplate') }}</h1>
    <p class="max-w-3xl text-sm leading-6 text-muted">{{ t('templates.newHint') }}</p>
    <form class="panel max-w-2xl space-y-5 p-5" novalidate @submit.prevent="submit">
      <label class="block">
        <span class="field-label">{{ t('templates.templateName') }}</span>
        <input
          v-model="form.template_name"
          class="field font-mono"
          required
          maxlength="255"
          autocomplete="off"
          spellcheck="false"
          :aria-invalid="!!fieldErrors.template_name"
          aria-describedby="template-name-hint template-name-error"
        >
        <span id="template-name-hint" class="mt-1.5 block text-xs text-muted">{{ t('templates.nameHint') }}</span>
        <span v-if="fieldErrors.template_name" id="template-name-error" class="field-error block">{{ fieldErrors.template_name }}</span>
      </label>
      <label class="block">
        <span class="field-label">{{ t('templates.tag') }}</span>
        <input
          v-model="form.tag"
          class="field font-mono"
          maxlength="128"
          autocomplete="off"
          spellcheck="false"
          :aria-invalid="!!fieldErrors.tag"
          aria-describedby="template-tag-hint template-tag-error"
        >
        <span id="template-tag-hint" class="mt-1.5 block text-xs text-muted">{{ t('templates.tagHint') }}</span>
        <span v-if="fieldErrors.tag" id="template-tag-error" class="field-error block">{{ fieldErrors.tag }}</span>
      </label>
      <label class="block">
        <span class="field-label">{{ t('templates.description') }}</span>
        <textarea v-model="form.description" class="field field-area" maxlength="4096" rows="4" :aria-invalid="!!fieldErrors.description" aria-describedby="template-description-error" />
        <span v-if="fieldErrors.description" id="template-description-error" class="field-error block">{{ fieldErrors.description }}</span>
      </label>
      <label class="flex items-start gap-3">
        <input v-model="form.active" type="checkbox" class="mt-0.5 h-4 w-4 accent-ink">
        <span><span class="block text-sm">{{ t('templates.active') }}</span><span class="block text-xs text-muted">{{ t('templates.activeHint') }}</span></span>
      </label>
      <div class="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button class="button-primary" type="submit" :disabled="pending">{{ pending ? t('templates.checking') : t('templates.add') }}</button>
        <RouterLink :to="sectionLinks.templates" class="button">{{ t('templates.cancel') }}</RouterLink>
      </div>
    </form>
  </div>
</template>
