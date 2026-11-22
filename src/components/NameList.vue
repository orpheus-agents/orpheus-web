<script setup lang="ts">
defineProps<{ names: string[] }>()
</script>
<template>
  <ul class="flex flex-wrap gap-x-1.5 gap-y-1 font-mono">
    <li v-for="(name, index) in names" :key="name" class="min-w-0 wrap-anywhere">{{ name }}<span v-if="index < names.length - 1" aria-hidden="true">,</span></li>
  </ul>
</template>
