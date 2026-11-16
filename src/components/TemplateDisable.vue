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
  <button v-if="!asking" class="button" :disabled="pending" @click="ask">{{ t('templates.disable') }}</button>
  <div v-else class="space-y-3 border border-danger p-4" role="alertdialog" aria-labelledby="template-disable-title" aria-describedby="template-disable-hint">
    <p id="template-disable-title" class="text-sm font-semibold">{{ t('templates.disableConfirmTitle') }}</p>
    <p id="template-disable-hint" class="text-sm text-muted">{{ t('templates.disableConfirmHint') }}</p>
    <div class="flex flex-wrap gap-3">
      <button class="button-danger" :disabled="pending" @click="emit('confirm')">{{ t('templates.disable') }}</button>
      <button ref="cancel" class="button" :disabled="pending" @click="asking = false">{{ t('templates.cancel') }}</button>
    </div>
  </div>
</template>
