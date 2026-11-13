<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Template } from '../api/generated'
defineProps<{ templates: Template[]; busy: (id: string) => boolean }>()
const emit = defineEmits<{ toggle: [template: Template, active: boolean] }>()
const { t } = useI18n()
const router = useRouter()
// The name link and the activity switch handle their own input; the rest of the row opens the card.
function open(id: string, event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a, button, input, label') || window.getSelection()?.toString()) return
  const to = router.resolve({ name: 'template', params: { id } })
  if (event.metaKey || event.ctrlKey) window.open(to.href, '_blank', 'noopener')
  else void router.push(to)
}
// The box shows the stored state until the server confirms the change.
function toggle(template: Template, event: Event) {
  const input = event.target as HTMLInputElement
  emit('toggle', template, input.checked)
  input.checked = template.active
}
</script>
<template>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('templates.name') }}</th>
          <th>{{ t('templates.tag') }}</th>
          <th>{{ t('templates.description') }}</th>
          <th>{{ t('templates.state') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="template in templates" :key="template.id" class="cursor-pointer" @click="open(template.id, $event)">
          <td>
            <RouterLink :to="{ name: 'template', params: { id: template.id } }" class="break-all font-mono text-accent-ink hover:underline">
              {{ template.template_name }}
            </RouterLink>
          </td>
          <td class="whitespace-nowrap font-mono" :class="{ 'text-muted': !template.tag }">{{ template.tag ?? t('templates.noTag') }}</td>
          <td class="max-w-md">
            <p class="line-clamp-2" :class="{ 'text-muted': !template.description }">{{ template.description ?? t('common.notSet') }}</p>
          </td>
          <td class="whitespace-nowrap">
            <label class="inline-flex cursor-pointer items-center gap-2 font-mono text-xs">
              <input
                type="checkbox"
                class="h-4 w-4 accent-ink"
                :checked="template.active"
                :disabled="busy(template.id)"
                :aria-label="t('templates.toggle', { name: template.name })"
                @change="toggle(template, $event)"
              >
              <span :class="template.active ? 'text-ink' : 'text-muted'">{{ template.active ? t('templates.active') : t('templates.inactive') }}</span>
            </label>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
