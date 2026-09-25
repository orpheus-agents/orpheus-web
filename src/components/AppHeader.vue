<script setup lang="ts">
import { computed } from 'vue'
import { Clock3, Languages, LogOut, Monitor, Moon, Sun } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { BrowserAuthSession } from '../api/generated'
import { BrowserAuthSessionMode } from '../api/generated'
import { sectionLinks } from '../router'
import { formatOffset, THEMES, timeZones, useSettings } from '../composables/useSettings'
import HeaderMenu from './HeaderMenu.vue'
defineProps<{ session: BrowserAuthSession | null; ready: boolean; pending: boolean }>()
defineEmits<{ logout: [] }>()
const { t, locale } = useI18n()
const route = useRoute()
const { timeZone, setTimeZone, theme, resolvedTheme, setTheme } = useSettings()
const nav = ['analytics', 'sessions', 'limits'] as const
const locales = ['en', 'ru'] as const
const currentLocale = computed(() => (locale.value === 'ru' ? 'ru' : 'en'))
const languageOptions = computed(() => locales.map((value) => ({ value, label: t(`settings.languages.${value}`) })))
const zoneOptions = computed(() => timeZones().map((value) => ({ value, label: value })))
const themeOptions = computed(() => THEMES.map((value) => ({ value, label: t(`settings.themes.${value}`) })))
const themeIcon = computed(() => (theme.value === 'system' ? Monitor : resolvedTheme.value === 'dark' ? Moon : Sun))
function changeLocale(value: 'en' | 'ru') {
  locale.value = value
  window.localStorage.setItem('orpheus_locale', value)
}
</script>
<template>
  <header class="border-b border-line bg-surface">
    <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-8 px-5 sm:px-8">
      <RouterLink to="/" class="flex h-14 items-center" :aria-label="t('app.name')">
        <img src="/orpheus-mark.svg" class="h-6 w-auto sm:hidden" alt="">
        <img src="/orpheus-logo-light.svg" class="hidden h-[22px] w-auto sm:block dark:sm:hidden" alt="">
        <img src="/orpheus-logo.svg" class="hidden h-[22px] w-auto dark:sm:block" alt="">
      </RouterLink>
      <nav v-if="ready" class="order-3 flex w-full gap-6 sm:order-none sm:w-auto" :aria-label="t('nav.main')">
        <RouterLink
          v-for="item in nav"
          :key="item"
          :to="sectionLinks[item]"
          class="nav-link"
          :class="{ selected: item === 'sessions' ? route.path.startsWith('/sessions') : route.name === item }"
        >
          {{ t(`nav.${item}`) }}
        </RouterLink>
      </nav>
      <div class="ml-auto flex items-center gap-1">
        <HeaderMenu :label="t('app.language')" :icon="Languages" :model-value="currentLocale" :options="languageOptions" @update:model-value="changeLocale" />
        <HeaderMenu
          :label="`${t('settings.timezone')}: ${timeZone} (${formatOffset(timeZone)})`"
          :icon="Clock3"
          :model-value="timeZone"
          :options="zoneOptions"
          searchable
          @update:model-value="setTimeZone"
        />
        <HeaderMenu :label="t('settings.theme')" :icon="themeIcon" :model-value="theme" :options="themeOptions" @update:model-value="setTheme" />
        <template v-if="ready && session?.mode === BrowserAuthSessionMode.saml">
          <span class="mx-2 h-5 w-px bg-line" aria-hidden="true" />
          <span v-if="session.user" class="hidden max-w-48 truncate font-mono text-xs text-muted md:block">{{
            session.user.display_name
          }}</span>
          <button class="icon-button" :disabled="pending" :aria-label="t('auth.logout')" @click="$emit('logout')">
            <LogOut class="h-4 w-4" aria-hidden="true" />
          </button>
        </template>
      </div>
    </div>
  </header>
</template>
