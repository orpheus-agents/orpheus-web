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

export function formatPercent(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value / 100)
}
export function formatAxisTime(timestamp: string, locale: string, timeZone: string, bucket: AnalyticsOverviewBucket) {
  const options: Intl.DateTimeFormatOptions = bucket === AnalyticsOverviewBucket.hour
    ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(new Date(timestamp))
}
