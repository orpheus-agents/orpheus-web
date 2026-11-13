<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const props = defineProps<{ value: string | null; pending: boolean }>()
const emit = defineEmits<{ save: [description: string | null] }>()
const { t } = useI18n()
const draft = ref(props.value ?? '')
// A refresh replaces the text only while the reader has not started editing it.
watch(() => props.value, (value, previous) => {
  if (draft.value === (previous ?? '')) draft.value = value ?? ''
})
</script>
<template>
  <form class="space-y-3" @submit.prevent="emit('save', draft.trim() ? draft : null)">
    <label class="block"><span class="field-label">{{ t('templates.description') }}</span><textarea
      v-model="draft"
      class="field field-area"
      maxlength="4096"
      rows="4"
    /></label>
    <button class="button" type="submit" :disabled="pending || draft === (value ?? '')">{{ t('templates.save') }}</button>
  </form>
</template>
