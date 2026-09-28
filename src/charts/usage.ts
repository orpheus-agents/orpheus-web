import type { AggregateUsage, Usage } from '../api/generated'
import type { Count, Segment, Share } from './palette'

export type UsageLabel = 'input' | 'cachedInput' | 'output' | 'reasoningOutput'
/** Input with its cached part and output with its reasoning part, each nested share hatched inside its parent. */
export function usageSegments(usage: Usage | AggregateUsage, share: (label: UsageLabel, value: Count) => Share): Segment[] {
  return [
    { key: 'input', tone: 'ink', ...share('input', usage.input_tokens), nested: share('cachedInput', usage.cached_input_tokens) },
    { key: 'output', tone: 'accent', ...share('output', usage.output_tokens), nested: share('reasoningOutput', usage.reasoning_output_tokens) },
  ]
}
