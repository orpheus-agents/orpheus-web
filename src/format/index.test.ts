import { expect, it } from 'vitest'
import { formatNumber, formatCompactNumber, formatDuration, formatDate, formatPercent, formatAxisTime } from './index'
import { AnalyticsOverviewBucket as Bucket } from '../api/generated'
it('preserves aggregate token precision beyond Number.MAX_SAFE_INTEGER', () => {
  expect(formatNumber('9007199254740993123', 'en-US')).toBe('9,007,199,254,740,993,123')
  expect(formatCompactNumber('9007199254740993123', 'en-US')).toBeTruthy()
})
it('formats percentages without clamping over-quota values', () => {
  expect(formatPercent(120.25, 'en-US')).toBe('120.3%')
  expect(formatPercent(34.5, 'ru-RU')).toBe('34,5 %')
  expect(formatPercent(0, 'en-US')).toBe('0%')
})
it('formats hourly and daily axis labels in the chosen timezone, including DST', () => {
  expect(formatAxisTime('2026-03-29T01:30:00Z', 'en-GB', 'Europe/Berlin', Bucket.hour)).toBe('03:30')
  expect(formatAxisTime('2026-03-29T00:30:00Z', 'en-GB', 'America/New_York', Bucket.day)).toBe('28 Mar')
  expect(formatAxisTime('2026-03-29T01:30:00Z', 'ru-RU', 'Europe/Berlin', Bucket.day)).toBe('29 мар.')
})
it('formats duration and timestamps centrally in the selected locale and timezone', () => {
  expect(formatDuration(3660, 'en-US')).toContain('1 hr')
  expect(formatDuration(0, 'ru-RU')).toContain('0')
  expect(formatDate('2026-03-29T01:30:00Z', 'en-GB', 'Europe/Berlin')).toContain('03:30')
})
