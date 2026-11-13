<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { navigation, sectionLinks } from '../router'
const { t } = useI18n()
const route = useRoute()
const items = computed(() => navigation.find(({ name }) => name === route.meta.section)?.children ?? [])
</script>
<template>
  <nav v-if="items.length" class="border-t border-line" :aria-label="t(`nav.${route.meta.section}`)">
    <div class="mx-auto flex max-w-(--breakpoint-2xl) gap-6 overflow-x-auto px-5 sm:px-8">
      <RouterLink
        v-for="item in items"
        :key="item"
        :to="sectionLinks[item]"
        class="subnav-link"
        :class="{ selected: route.meta.subsection === item }"
        :aria-current="route.meta.subsection === item ? 'page' : undefined"
      >
        {{ t(`nav.${item}`) }}
      </RouterLink>
    </div>
  </nav>
</template>
