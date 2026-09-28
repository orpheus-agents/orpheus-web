/** Fills shared by the bars and the activity chart; see branding/interface.md → Components → Bars. */
export type Tone = 'ink' | 'accent' | 'muted' | 'danger'
export type Count = number | string
export interface Share {
  label: string
  value: Count
  display: string
  title?: string
}
export interface Segment extends Share {
  key: string
  tone: Tone
  /** A part of this segment, drawn hatched at its start; never larger than the segment. */
  nested?: Share
}
export function fill(tone: Tone) {
  return `rgb(var(--color-${tone}))`
}
/** Stripes at 40% of the pitch: 2 px on 5 px for bars, finer for 8 px legend markers. */
export function hatch(tone: Tone, pitch = 5) {
  const stripe = pitch * 0.4
  return `repeating-linear-gradient(135deg, ${fill(tone)} 0 ${stripe}px, rgb(var(--color-surface-raised)) ${stripe}px ${pitch}px)`
}
