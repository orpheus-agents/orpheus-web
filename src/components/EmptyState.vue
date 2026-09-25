<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import { Inbox } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title: string
    hint?: string
    icon?: FunctionalComponent
  }>(),
  {
    hint: undefined,
    icon: () => Inbox,
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
    <component :is="icon" class="h-6 w-6 text-muted" aria-hidden="true" />
    <p class="text-sm font-medium text-ink">{{ title }}</p>
    <p v-if="hint" class="max-w-sm text-xs text-muted">{{ hint }}</p>
  </div>
</template>
