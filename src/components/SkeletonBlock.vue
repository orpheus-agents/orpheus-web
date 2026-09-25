<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    rounded?: 'sm' | 'md' | 'lg' | 'full'
  }>(),
  {
    width: '100%',
    height: '1rem',
    rounded: 'md',
  },
)
</script>

<template>
  <span
    class="block animate-pulse bg-line/70 motion-reduce:animate-none"
    :class="{
      'rounded-sm': rounded === 'sm',
      'rounded-md': rounded === 'md',
      'rounded-lg': rounded === 'lg',
      'rounded-full': rounded === 'full',
    }"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
