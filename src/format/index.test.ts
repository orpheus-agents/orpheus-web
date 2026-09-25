import { expect, it } from 'vitest'
import { formatNumber, formatCompactNumber, formatDuration, formatDate, formatPercent, formatAxisTime, fromZonedInput, toZonedInput } from './index'
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
it('converts datetime-local values in the chosen zone, independently of the browser zone', () => {
  expect(toZonedInput('2026-09-25T07:00:00Z', 'Asia/Tokyo')).toBe('2026-09-25T16:00')
  expect(toZonedInput('2026-09-25T07:00:00Z', 'America/New_York')).toBe('2026-09-25T03:00')
  expect(toZonedInput('not a date', 'UTC')).toBe('')
  expect(fromZonedInput('2026-09-25T10:00', 'Asia/Tokyo')).toBe('2026-09-25T01:00:00.000Z')
  expect(fromZonedInput('2026-09-25T10:00', 'Europe/Moscow')).toBe('2026-09-25T07:00:00.000Z')
  expect(fromZonedInput('2026-09-25T10:00:30', 'UTC')).toBe('2026-09-25T10:00:30.000Z')
  expect(fromZonedInput('', 'UTC')).toBe('')
  expect(toZonedInput(fromZonedInput('2026-07-01T12:00', 'Europe/Berlin'), 'Europe/Berlin')).toBe('2026-07-01T12:00')
})
it('reads skipped times with the pre-transition offset and repeated times as their first occurrence', () => {
  // New York springs forward at 02:00 on 8 March 2026 (−05:00 → −04:00) and falls back on 1 November.
  expect(fromZonedInput('2026-03-08T01:30', 'America/New_York')).toBe('2026-03-08T06:30:00.000Z')
  expect(fromZonedInput('2026-03-08T02:30', 'America/New_York')).toBe('2026-03-08T07:30:00.000Z')
  expect(toZonedInput(fromZonedInput('2026-03-08T02:30', 'America/New_York'), 'America/New_York')).toBe('2026-03-08T03:30')
  expect(fromZonedInput('2026-03-08T03:30', 'America/New_York')).toBe('2026-03-08T07:30:00.000Z')
  expect(fromZonedInput('2026-11-01T01:30', 'America/New_York')).toBe('2026-11-01T05:30:00.000Z')
  // Sydney springs forward at 02:00 on 4 October 2026 (+10:00 → +11:00); Berlin falls back at 03:00 on 25 October.
  expect(fromZonedInput('2026-10-04T02:30', 'Australia/Sydney')).toBe('2026-10-03T16:30:00.000Z')
  expect(toZonedInput(fromZonedInput('2026-10-04T02:30', 'Australia/Sydney'), 'Australia/Sydney')).toBe('2026-10-04T03:30')
  expect(fromZonedInput('2026-10-25T02:30', 'Europe/Berlin')).toBe('2026-10-25T00:30:00.000Z')
  expect(fromZonedInput('2026-10-25T03:30', 'Europe/Berlin')).toBe('2026-10-25T02:30:00.000Z')
})
