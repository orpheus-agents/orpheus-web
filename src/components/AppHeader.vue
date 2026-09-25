<script setup lang="ts">
import { Activity, Layers, Gauge, LogOut, Languages } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { BrowserAuthSession } from '../api/generated'
import { BrowserAuthSessionMode } from '../api/generated'
import { sectionLinks } from '../router'
defineProps<{ session: BrowserAuthSession | null; ready: boolean; pending: boolean }>()
defineEmits<{ logout: [] }>()
const { t, locale } = useI18n()
const route = useRoute()
const nav = [
  { name: 'analytics', icon: Activity },
  { name: 'sessions', icon: Layers },
  { name: 'limits', icon: Gauge },
] as const
function changeLocale() {
  locale.value = locale.value === 'en' ? 'ru' : 'en'
  window.localStorage.setItem('orpheus_locale', locale.value)
}
</script>
<template>
  <header class="border-b border-line bg-surface-raised">
    <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-8 px-5 sm:px-8">
      <RouterLink to="/" class="flex h-20 items-center gap-3 font-semibold tracking-tight" :aria-label="t('app.name')">
        <img src="/orpheus-mark.svg" class="h-8 w-8" alt="">
        <span class="text-xl">{{ t('app.name') }}</span>
      </RouterLink>
      <nav v-if="ready" class="order-3 flex w-full gap-6 sm:order-none sm:w-auto" :aria-label="t('nav.main')">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="sectionLinks[item.name]"
          class="nav-link"
          :class="{
            selected: item.name === 'sessions' ? route.path.startsWith('/sessions') : route.name === item.name,
          }"
        >
          <component :is="item.icon" class="h-4 w-4" aria-hidden="true" />{{ t(`nav.${item.name}`) }}
        </RouterLink>
      </nav>
      <div class="ml-auto flex items-center gap-3">
        <span v-if="session?.user" class="hidden max-w-48 truncate text-sm text-muted md:block">{{
          session.user.display_name
        }}</span>
        <button class="button text-xs" :aria-label="t('app.language')" @click="changeLocale">
          <Languages class="h-4 w-4" aria-hidden="true" />{{ t('app.otherLanguage') }}
        </button>
        <button
          v-if="ready && session?.mode === BrowserAuthSessionMode.saml"
          class="icon-button"
          :disabled="pending"
          :aria-label="t('auth.logout')"
          @click="$emit('logout')"
        >
          <LogOut class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
</template>
