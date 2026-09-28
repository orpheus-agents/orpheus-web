import { RunStatus, type StatusCounts } from '../api/generated'
import type { Segment, Tone } from './palette'

/** Legend groups of the activity chart and the runs card; `running` stands for every unfinished state. */
export const runGroups = [RunStatus.completed, RunStatus.failed, RunStatus.cancelled, RunStatus.running] as const
export type RunGroup = (typeof runGroups)[number]
export const runTone: Record<RunGroup, Tone> = {
  [RunStatus.completed]: 'ink',
  [RunStatus.failed]: 'danger',
  [RunStatus.cancelled]: 'muted',
  [RunStatus.running]: 'accent',
}
function activeCount(counts: StatusCounts) {
  return counts.accepted + counts.starting + counts.running + counts.cancelling + counts.finalizing
}
export function groupCount(counts: StatusCounts, group: RunGroup) {
  return group === RunStatus.running ? activeCount(counts) : counts[group]
}
export function statusSegments(counts: StatusCounts, label: (group: RunGroup) => string, display: (value: number) => string): Segment[] {
  return runGroups.map((group) => {
    const value = groupCount(counts, group)
    return { key: group, tone: runTone[group], label: label(group), value, display: display(value) }
  })
}
