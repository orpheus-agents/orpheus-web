import { AnalyticsOverviewBucket } from '../api/generated'

export function formatCompactNumber(value: number | string, locale: string) {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(typeof value === 'string' ? BigInt(value) : value)
}
export function formatNumber(value: number | string, locale: string) {
  return new Intl.NumberFormat(locale).format(typeof value === 'string' ? BigInt(value) : value)
}
export function formatDuration(seconds: number, locale: string) {
  const value = Math.max(0, Math.floor(seconds))
  const units: [number, string][] = value >= 86400 ? [[Math.floor(value / 86400), 'day'], [Math.floor(value % 86400 / 3600), 'hour']]
    : value >= 3600 ? [[Math.floor(value / 3600), 'hour'], [Math.floor(value % 3600 / 60), 'minute']]
      : value >= 60 ? [[Math.floor(value / 60), 'minute'], [value % 60, 'second']] : [[value, 'second']]
  return units.filter(([n], i) => n || !i).map(([n, unit]) => new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' }).format(n)).join(' ')
}
export function formatRelativeTime(timestamp: string, now: number, locale: string) {
  const seconds = (Date.parse(timestamp) - now) / 1000
  const [scale, unit]: [number, Intl.RelativeTimeFormatUnit] = Math.abs(seconds) < 60 ? [1, 'second'] : Math.abs(seconds) < 3600 ? [60, 'minute'] : Math.abs(seconds) < 86400 ? [3600, 'hour'] : [86400, 'day']
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / scale), unit)
}
export function formatDate(timestamp: string, locale: string, timeZone?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(new Date(timestamp))
}

function wallClock(timestamp: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(timestamp)
  const field = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return Date.UTC(field('year'), field('month') - 1, field('day'), field('hour'), field('minute'), field('second'))
}
/** The wall-clock time of an instant in the zone, as an `<input type="datetime-local">` value. */
export function toZonedInput(timestamp: string, timeZone: string) {
  const instant = Date.parse(timestamp)
  return Number.isFinite(instant) ? new Date(wallClock(instant, timeZone)).toISOString().slice(0, 16) : ''
}
/**
 * The instant a datetime-local value denotes in the zone. A time that occurs twice (clocks
 * set back) means its first occurrence; a time that does not exist (clocks set forward) is
 * read with the offset in force before the transition, so 02:30 in a 02:00 → 03:00 gap is 03:30.
 */
export function fromZonedInput(value: string, timeZone: string) {
  const wall = Date.parse(value.length === 16 ? `${value}:00Z` : `${value}Z`)
  if (!Number.isFinite(wall)) return ''
  const offsetAt = (instant: number) => wallClock(instant, timeZone) - instant
  const day = 86_400_000
  // Offsets two days either side bracket any transition near the wall-clock value.
  const offsets = [...new Set([-2 * day, 0, 2 * day].map((shift) => offsetAt(wall + shift)))]
  const existing = offsets.map((offset) => wall - offset).filter((instant) => wallClock(instant, timeZone) === wall)
  return new Date(existing.length ? Math.min(...existing) : wall - offsetAt(wall - 2 * day)).toISOString()
}

export function formatPercent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value / 100)
}
export function formatAxisTime(timestamp: string, locale: string, timeZone: string, bucket: AnalyticsOverviewBucket) {
  const options: Intl.DateTimeFormatOptions = bucket === AnalyticsOverviewBucket.hour
    ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(new Date(timestamp))
}
