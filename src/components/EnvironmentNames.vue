<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { Run } from '../api/generated'
import { formatNumber } from '../format'
import NameList from './NameList.vue'
defineProps<{ label: string; names: Run['harness_env_names'] }>()
const { t, locale } = useI18n()
</script>

<template>
  <details v-if="names?.length" class="group/env text-xs">
    <summary class="flex cursor-pointer items-center justify-between gap-3 font-mono text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
      {{ label }}
      <span class="flex items-center gap-1 text-ink">
        {{ formatNumber(names.length, locale) }}
        <ChevronRight class="size-4 group-open/env:rotate-90" aria-hidden="true" />
      </span>
    </summary>
    <NameList :names="names" class="mt-2" />
  </details>
  <dl v-else class="flex justify-between gap-3 text-xs">
    <dt class="font-mono text-muted">{{ label }}</dt>
    <dd>{{ names === null ? t('services.unknownEnvironment') : t('services.emptyEnvironment') }}</dd>
  </dl>
</template>
