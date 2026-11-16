<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { send } from '../api/client'
import { useCatalogMutation } from '../composables/useCatalogMutation'
import { useToasts } from '../composables/useToasts'
import { sectionLinks } from '../router'
const props = defineProps<{ kind: 'accounts' | 'profiles'; id: string; active: boolean }>()
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const { push } = useToasts()
const router = useRouter()
const { pending, run } = useCatalogMutation()
const asking = ref<'disable' | 'delete' | null>(null)
const cancel = ref<HTMLButtonElement>()
const label = useId()
async function ask(action: 'disable' | 'delete') { asking.value = action; await nextTick(); cancel.value?.focus() }
async function toggle() {
  const result = await run<unknown>((signal) => props.kind === 'accounts'
    ? send('patch', '/api/v1/llm-accounts/{id}', { signal, path: { id: props.id }, body: { active: !props.active } })
    : send('patch', '/api/v1/profiles/{id}', { signal, path: { id: props.id }, body: { active: !props.active } }))
  if (result.ok) { asking.value = null; emit('changed'); push(t('catalog.saved')) }
}
async function remove() {
  const result = await run<unknown>((signal) => props.kind === 'accounts'
    ? send('delete', '/api/v1/llm-accounts/{id}', { signal, path: { id: props.id } })
    : send('delete', '/api/v1/profiles/{id}', { signal, path: { id: props.id } }))
  if (result.ok) { push(t('catalog.deleted')); await router.push(sectionLinks[props.kind]) }
}
</script>
<template>
  <section class="panel space-y-4 p-5">
    <p class="flex items-center gap-2 font-mono text-sm" :class="active ? 'text-ink' : 'text-muted'"><span class="marker" :class="active ? 'bg-accent' : 'border border-muted'" aria-hidden="true" />{{ active ? t('templates.active') : t('templates.inactive') }}</p>
    <p class="text-sm text-muted">{{ t(`${kind}.activeHint`) }}</p>
    <div v-if="!asking" class="flex flex-wrap gap-3">
      <button class="button" :disabled="pending" @click="active ? ask('disable') : toggle()">{{ active ? t('templates.disable') : t('templates.enable') }}</button>
      <button class="button-danger" :disabled="pending" @click="ask('delete')">{{ t('templates.delete') }}</button>
    </div>
    <div v-else class="space-y-3 border border-danger p-4" role="alertdialog" :aria-labelledby="label">
      <p :id="label" class="text-sm font-semibold">{{ asking === 'disable' ? t('catalog.disableConfirm') : t('catalog.deleteConfirm') }}</p>
      <p class="text-sm text-muted">{{ asking === 'disable' ? t(`${kind}.activeHint`) : t(`${kind}.deleteHint`) }}</p>
      <div class="flex flex-wrap gap-3"><button class="button-danger" :disabled="pending" @click="asking === 'disable' ? toggle() : remove()">{{ asking === 'disable' ? t('templates.disable') : t('templates.confirm') }}</button><button ref="cancel" class="button" :disabled="pending" @click="asking = null">{{ t('templates.cancel') }}</button></div>
    </div>
  </section>
</template>
