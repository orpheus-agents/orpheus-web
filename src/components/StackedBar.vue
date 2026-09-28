<script setup lang="ts">
import { computed } from 'vue'
import { fill, hatch, type Count, type Segment } from '../charts/palette'

const props = defineProps<{ segments: Segment[]; total?: Count }>()
// Segments are shares of the total; when they add up to more, the sum is the scale.
const scale = computed(() => {
  const total = BigInt(props.total ?? 0)
  const sum = props.segments.reduce((value, segment) => value + BigInt(segment.value), 0n)
  return total > sum ? total : sum
})
function width(value: Count, of: bigint) {
  if (of <= 0n) return '0%'
  const count = BigInt(value)
  const clamped = count < 0n ? 0n : count > of ? of : count
  return `${Number(clamped * 1_000_000n / of) / 10_000}%`
}
</script>
<template>
  <div>
    <div class="flex h-2 w-full overflow-hidden bg-surface-subtle" aria-hidden="true">
      <div
        v-for="segment in segments"
        :key="segment.key"
        class="relative h-full shrink-0"
        :style="{ width: width(segment.value, scale), background: fill(segment.tone) }"
      >
        <div
          v-if="segment.nested"
          class="absolute inset-y-0 left-0"
          :style="{ width: width(segment.nested.value, BigInt(segment.value)), background: hatch(segment.tone) }"
        />
      </div>
    </div>
    <dl class="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
      <template v-for="segment in segments" :key="segment.key">
        <div class="flex items-center gap-1.5">
          <dt class="flex items-center gap-1.5 text-muted"><span class="marker" :style="{ background: fill(segment.tone) }" />{{ segment.label }}</dt>
          <dd class="tabular-nums" :title="segment.title">{{ segment.display }}</dd>
        </div>
        <div v-if="segment.nested" class="flex items-center gap-1.5">
          <dt class="flex items-center gap-1.5 text-muted"><span class="marker" :style="{ background: hatch(segment.tone, 3) }" />{{ segment.nested.label }}</dt>
          <dd class="tabular-nums" :title="segment.nested.title">{{ segment.nested.display }}</dd>
        </div>
      </template>
    </dl>
  </div>
</template>
