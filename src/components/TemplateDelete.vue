<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
defineProps<{ pending: boolean }>()
const emit = defineEmits<{ confirm: [] }>()
const { t } = useI18n()
const asking = ref(false)
const cancel = ref<HTMLButtonElement>()
async function ask() {
  asking.value = true
  await nextTick()
  cancel.value?.focus()
}
</script>
<template>
  <button v-if="!asking" class="button-danger" @click="ask">{{ t('templates.delete') }}</button>
  <div v-else class="space-y-3 border border-danger p-4" role="alertdialog" aria-labelledby="template-delete-title" aria-describedby="template-delete-hint">
    <p id="template-delete-title" class="text-sm font-semibold">{{ t('templates.confirmTitle') }}</p>
    <p id="template-delete-hint" class="text-sm text-muted">{{ t('templates.confirmHint') }}</p>
    <div class="flex flex-wrap gap-3">
      <button class="button-danger" :disabled="pending" @click="emit('confirm')">{{ t('templates.confirm') }}</button>
      <button ref="cancel" class="button" :disabled="pending" @click="asking = false">{{ t('templates.cancel') }}</button>
    </div>
  </div>
</template>
