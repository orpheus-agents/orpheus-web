<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RunStatus, type AnalyticsOverview, type StatusCounts } from '../api/generated'
import { formatAxisTime, formatDate, formatNumber } from '../format'
const props = defineProps<{ overview: AnalyticsOverview }>()
const { t, locale } = useI18n()
const selected = ref(0)
const id = useId()
const plot = ref<SVGSVGElement>()
const width = ref(1000)
const resize = new ResizeObserver(([entry]) => {
  width.value = entry.contentRect.width
})
onMounted(() => {
  if (plot.value) resize.observe(plot.value)
})
onUnmounted(() => resize.disconnect())
const activeCount = (counts: StatusCounts) =>
  counts.accepted + counts.starting + counts.running + counts.cancelling + counts.finalizing
const groups = [RunStatus.completed, RunStatus.failed, RunStatus.cancelled, RunStatus.running] as const
const color = {
  [RunStatus.completed]: 'var(--color-ink)',
  [RunStatus.failed]: 'var(--color-danger)',
  [RunStatus.cancelled]: 'var(--color-muted)',
  [RunStatus.running]: 'var(--color-accent)',
}
const max = computed(() => Math.max(1, ...props.overview.series.map((bucket) => bucket.runs_count)))
const step = computed(() => (width.value - 55) / Math.max(1, props.overview.series.length))
const bars = computed(() =>
  props.overview.series.map((bucket, index) => {
    let total = 0
    return {
      bucket,
      index,
      segments: groups.map((status) => {
        const count = status === RunStatus.running ? activeCount(bucket.by_status) : bucket.by_status[status]
        const height = (count / max.value) * 190
        total += height
        return { status, height, y: 210 - total }
      }),
    }
  }),
)
const current = computed(() => props.overview.series[selected.value])
watch(
  () => props.overview.series.length,
  (length) => {
    selected.value = Math.max(0, length - 1)
  },
  { immediate: true },
)
const ticks = computed(() =>
  [0, Math.floor(props.overview.series.length / 2), props.overview.series.length - 1].filter(
    (n, i, arr) => n >= 0 && arr.indexOf(n) === i,
  ),
)
function move(delta: number) {
  selected.value = Math.min(props.overview.series.length - 1, Math.max(0, selected.value + delta))
}
function tick(value: string) {
  return formatAxisTime(value, locale.value, props.overview.timezone, props.overview.bucket)
}
function date(value: string) {
  return formatDate(value, locale.value, props.overview.timezone)
}
</script>
<template>
  <section class="panel overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-4 px-6 pt-6">
      <div>
        <h2 class="panel-title">{{ t('analytics.activity') }}</h2>
        <p class="mt-1 font-mono text-xs text-muted">{{ t('analytics.chartHint', { timezone: overview.timezone }) }}</p>
      </div>
      <div class="flex flex-wrap gap-4 font-mono text-xs text-muted">
        <span v-for="status in groups" :key="status" class="flex items-center gap-1.5"><span class="marker" :style="{ background: `rgb(${color[status]})` }" />{{
          t(status === RunStatus.running ? 'analytics.inProgress' : `status.${status}`)
        }}</span>
      </div>
    </div>
    <div
      class="px-3 pb-2 pt-5 sm:px-6"
      tabindex="0"
      role="listbox"
      :aria-label="t('analytics.selectInterval')"
      :aria-activedescendant="current ? `${id}-${selected}` : undefined"
      @keydown.left.prevent="move(-1)"
      @keydown.right.prevent="move(1)"
      @keydown.home.prevent="selected = 0"
      @keydown.end.prevent="selected = overview.series.length - 1"
    >
      <svg ref="plot" class="h-64 w-full" :viewBox="`0 0 ${width} 250`" role="group" :aria-label="t('analytics.activity')">
        <g v-for="part in max < 2 ? [0, 1] : [0, 0.5, 1]" :key="part">
          <line
            x1="45"
            :x2="width - 10"
            :y1="210 - part * 190"
            :y2="210 - part * 190"
            stroke="rgb(var(--color-line))"
            stroke-dasharray="3 5"
          />
          <text x="32" :y="215 - part * 190" class="font-mono" text-anchor="end" fill="rgb(var(--color-muted))" font-size="11">
            {{ formatNumber(Math.round(max * part), locale) }}
          </text>
        </g>
        <g
          v-for="bar in bars"
          :id="`${id}-${bar.index}`"
          :key="bar.bucket.from"
          role="option"
          :aria-selected="bar.index === selected"
          :aria-label="`${date(bar.bucket.from)} — ${t('analytics.intervalRuns', bar.bucket.runs_count)}`"
          class="cursor-pointer"
          @pointerenter="selected = bar.index"
          @click="selected = bar.index"
        >
          <rect
            :x="45 + bar.index * step"
            y="20"
            :width="step"
            height="190"
            :fill="bar.index === selected ? 'rgb(var(--color-line) / 0.3)' : 'transparent'"
          />
          <rect
            v-for="segment in bar.segments"
            :key="segment.status"
            :x="45 + bar.index * step + step * 0.17"
            :y="segment.y"
            :width="step * 0.66"
            :height="segment.height"
            :fill="`rgb(${color[segment.status]})`"
          />
          <title>{{ date(bar.bucket.from) }} — {{ formatNumber(bar.bucket.runs_count, locale) }}</title>
        </g>
        <text
          v-for="(index, n) in ticks"
          :key="index"
          :x="n === 0 ? 45 : n === ticks.length - 1 ? width - 10 : (width + 35) / 2"
          y="240"
          class="font-mono"
          :text-anchor="n === 0 ? 'start' : n === ticks.length - 1 ? 'end' : 'middle'"
          fill="rgb(var(--color-muted))"
          font-size="11"
        >
          {{ tick(overview.series[index].from) }}
        </text>
      </svg>
    </div>
    <div
      v-if="current"
      class="flex min-h-16 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-subtle px-6 py-4 font-mono text-xs"
      aria-live="polite"
    >
      <span class="text-muted">{{ date(current.from) }} — {{ date(current.to) }}</span>
      <div class="flex flex-wrap gap-4 tabular-nums">
        <span class="font-medium">{{ t('analytics.intervalRuns', current.runs_count) }}</span><span v-for="status in groups" :key="status" class="text-muted">{{ t(status === RunStatus.running ? 'analytics.inProgress' : `status.${status}`) }}:
          {{ status === RunStatus.running ? activeCount(current.by_status) : current.by_status[status] }}</span>
      </div>
    </div>
  </section>
</template>
