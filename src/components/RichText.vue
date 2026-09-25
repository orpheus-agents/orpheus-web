<script setup lang="ts">
import { ref, watch } from 'vue'
import { renderMarkdown } from '../render/markdown'
const props = defineProps<{ text: string }>()
const html = ref('')
watch(
  () => props.text,
  async (text, _previous, cleanup) => {
    let valid = true
    cleanup(() => {
      valid = false
    })
    const rendered = await renderMarkdown(text)
    if (valid) html.value = rendered
  },
  { immediate: true },
)
</script>
<template>
  <!-- HTML is sanitized by DOMPurify in render/markdown.ts. -->
  <div class="prose-output" v-html="html" />
</template>
