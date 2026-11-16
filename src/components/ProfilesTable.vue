<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Profile } from '../api/generated'
defineProps<{ profiles: Profile[] }>()
const { t } = useI18n()
const router = useRouter()
// The name link handles its own input; the rest of the row opens the card.
function open(id: string, event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a, button, input, label') || window.getSelection()?.toString()) return
  const to = router.resolve({ name: 'profile', params: { id } })
  if (event.metaKey || event.ctrlKey) window.open(to.href, '_blank', 'noopener')
  else void router.push(to)
}
</script>
<template>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('catalog.name') }}</th>
          <th>{{ t('profiles.account') }}</th>
          <th>{{ t('profiles.model') }}</th>
          <th>{{ t('templates.description') }}</th>
          <th>{{ t('templates.state') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="profile in profiles" :key="profile.id" class="cursor-pointer" @click="open(profile.id, $event)">
          <td>
            <RouterLink :to="{ name: 'profile', params: { id: profile.id } }" class="font-mono text-accent-ink hover:underline">
              {{ profile.name }}
            </RouterLink>
          </td>
          <td><RouterLink :to="{ name: 'account', params: { id: profile.account_id } }" class="text-accent-ink hover:underline">{{ profile.account_name }}</RouterLink><p v-if="!profile.account_active" class="text-xs text-muted">{{ t('profiles.accountInactive') }}</p></td>
          <td class="font-mono text-xs">{{ profile.model }}</td>
          <td class="max-w-md">
            <p class="line-clamp-2" :class="{ 'text-muted': !profile.description }">{{ profile.description ?? t('common.notSet') }}</p>
          </td>
          <td class="whitespace-nowrap">
            <span class="inline-flex items-center gap-2 font-mono text-xs" :class="profile.active ? 'font-semibold text-ink' : 'text-muted'">
              <span class="marker" :class="profile.active ? 'bg-accent' : 'border border-muted'" aria-hidden="true" />
              {{ profile.active ? t('templates.active') : t('templates.inactive') }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
