<script setup lang="ts">
import { ref, watch } from 'vue'
import { renderCode } from '../render/markdown'
const props = defineProps<{ source: string; language: 'yaml' | 'bash' | 'json'; prompt?: boolean }>()
const html = ref('')
watch(
  () => [props.source, props.language] as const,
  async ([source, language], _previous, cleanup) => {
    let valid = true
    cleanup(() => {
      valid = false
    })
    const rendered = await renderCode(source, language)
    if (valid) html.value = rendered
  },
  { immediate: true },
)
</script>
<template>
  <!-- HTML is sanitized by DOMPurify in render/markdown.ts. -->
  <div class="console flex gap-2">
    <span v-if="prompt" class="select-none text-term-ok" aria-hidden="true">$</span>
    <div class="min-w-0 flex-1" v-html="html" />
  </div>
</template>
