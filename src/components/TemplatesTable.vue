<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Template } from '../api/generated'
defineProps<{ templates: Template[] }>()
const { t } = useI18n()
const router = useRouter()
// The name link handles its own input; the rest of the row opens the card.
function open(id: string, event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a, button, input, label') || window.getSelection()?.toString()) return
  const to = router.resolve({ name: 'template', params: { id } })
  if (event.metaKey || event.ctrlKey) window.open(to.href, '_blank', 'noopener')
  else void router.push(to)
}
</script>
<template>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('templates.name') }}</th>
          <th>{{ t('templates.description') }}</th>
          <th>{{ t('templates.state') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="template in templates" :key="template.id" class="cursor-pointer" @click="open(template.id, $event)">
          <td>
            <RouterLink :to="{ name: 'template', params: { id: template.id } }" class="font-mono text-accent-ink hover:underline">
              {{ template.name }}
            </RouterLink>
          </td>
          <td class="max-w-md">
            <p class="line-clamp-2" :class="{ 'text-muted': !template.description }">{{ template.description ?? t('common.notSet') }}</p>
          </td>
          <td class="whitespace-nowrap">
            <span class="inline-flex items-center gap-2 font-mono text-xs" :class="template.active ? 'font-semibold text-ink' : 'text-muted'">
              <span class="marker" :class="template.active ? 'bg-accent' : 'border border-muted'" aria-hidden="true" />
              {{ template.active ? t('templates.active') : t('templates.inactive') }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
