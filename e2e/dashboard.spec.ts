import { expect, test } from '@playwright/test'
import { mockAPI } from './fixtures'
import { sid, rid, limits, run } from '../src/test/fixtures'
import { AccountLimitItemState } from '../src/api/generated'

test.beforeEach(async ({ page }) => { await mockAPI(page) })

test('analytics has only metrics and chart; periods and section filters are independent', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Orchestrator activity' })).toBeVisible()
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
  const request = page.waitForRequest((r) => r.url().includes('analytics/overview') && r.url().includes('window=7d'))
  await page.getByLabel('Period', { exact: true }).selectOption('7d')
  expect(new URL((await request).url()).searchParams.get('bucket')).toBe('day')
  await page.getByRole('link', { name: 'Sessions', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Current', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Namespace', { exact: true }).fill('engineering')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Past', exact: true }).click()
  await expect(page.getByLabel('Period', { exact: true })).toHaveValue('all')
  await page.getByRole('link', { name: 'Analytics', exact: true }).click()
  await expect(page.getByLabel('Period', { exact: true })).toHaveValue('7d')
  await expect(page.getByLabel('Namespace', { exact: true })).toHaveValue('')
  await page.getByRole('link', { name: 'Sessions', exact: true }).click()
  await expect(page.getByLabel('Namespace', { exact: true })).toHaveValue('engineering')
  await expect(page.getByRole('button', { name: 'Past', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('session pagination and links preserve the list filters; history is updated through SSE', async ({ page }) => {
  await page.goto('/sessions?namespace=engineering&activity=inactive')
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page).toHaveURL(/cursor=next-page/)
  await page.getByRole('link', { name: '11111111', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Conversation', exact: true })).toBeVisible()
  await expect(page.getByText('All tests pass.', { exact: false })).toBeVisible()
  await expect(page.getByText('npm test', { exact: true })).toBeVisible()
  await page.locator('summary', { hasText: 'Output' }).click()
  await expect(page.getByText('All 24 tests passed.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /cancel|start run/i })).toHaveCount(0)
  await page.getByRole('link', { name: 'Back to sessions' }).click()
  await expect(page).toHaveURL(/cursor=next-page/)
  await expect(page.getByLabel('Namespace', { exact: true })).toHaveValue('engineering')
  await page.goto(`/sessions/${sid}/runs/${rid}`)
  await expect(page.getByText('Selected run', { exact: true })).toBeVisible()
})

test('quota states and values above 100% remain explicit', async ({ page }) => {
  const data = limits()
  data.items[0].state = AccountLimitItemState.stale
  data.items[0].buckets[0].primary!.used_percent = 120
  data.items[0].buckets[0].primary!.remaining_percent = 0
  data.items.push({ account_id: 'new-account', profiles: ['new'], state: AccountLimitItemState.unknown, observed_at: null, last_attempt_at: null, error_code: null, buckets: [] })
  await page.route('**/api/v1/accounts/limits', (route) => route.fulfill({ json: data }))
  await page.goto('/limits')
  await expect(page.getByText('120%', { exact: true })).toBeVisible()
  await expect(page.getByRole('meter').first()).toHaveAttribute('aria-valuenow', '100')
  await expect(page.getByText('No observation yet. This does not mean the quota is unused.')).toBeVisible()
  await expect(page.getByText('Last known values;', { exact: false })).toBeVisible()
})

test('failed first request can be retried; a later failure preserves the snapshot', async ({ page }) => {
  let fail = true
  await page.route('**/api/v1/analytics/overview**', async (route) => {
    if (fail) await route.fulfill({ status: 503, json: { error: { code: 'unavailable', message: 'Storage unavailable', details: [], phase: null } } })
    else await route.fallback()
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Could not load data')
  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
  fail = true
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  await expect(page.getByText('Reconnecting…')).toBeVisible()
  await expect(page.getByText('Updated', { exact: false })).toBeVisible()
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
})

test('desktop, dark theme and narrow screens remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/analytics-light.png', fullPage: true, animations: 'disabled' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.screenshot({ path: 'test-results/analytics-dark.png', fullPage: true, animations: 'disabled' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/analytics-mobile.png', fullPage: true, animations: 'disabled' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Sessions', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Limits', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Provider limits' })).toBeVisible()
})

test('archive date range uses timestamp filters and is not applied to current sessions', async ({ page }) => {
  await page.goto('/sessions?activity=inactive')
  await page.getByLabel('Period', { exact: true }).selectOption('custom')
  await page.getByLabel('From', { exact: true }).fill('2026-09-01T10:00')
  await page.getByLabel('Until', { exact: true }).fill('2026-09-25T10:00')
  const archiveRequest = page.waitForRequest((r) => r.url().includes('last_run_created_from='))
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  const query = new URL((await archiveRequest).url()).searchParams
  expect(query.get('last_run_created_from')).toMatch(/T.*Z$/)
  expect(Date.parse(query.get('last_run_created_from')!)).toBeLessThan(Date.parse(query.get('last_run_created_to')!))
  const currentRequest = page.waitForRequest((r) => r.url().includes('/api/v1/sessions?') && r.url().includes('activity=active'))
  await page.getByRole('button', { name: 'Current', exact: true }).click()
  expect(new URL((await currentRequest).url()).searchParams.has('last_run_created_from')).toBe(false)
})

test('Russian navigation, dates and page titles survive reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Change language' }).click()
  await page.getByRole('option', { name: 'Русский' }).click()
  await expect(page.getByRole('heading', { name: 'Активность оркестратора' })).toBeVisible()
  await expect(page).toHaveTitle('Аналитика / Orpheus')
  await page.screenshot({ path: 'test-results/analytics-ru.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('link', { name: 'Сессии', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await page.screenshot({ path: 'test-results/sessions-ru.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('link', { name: '11111111', exact: true }).click()
  await expect(page.getByText('All tests pass.', { exact: false })).toBeVisible()
  await page.screenshot({ path: 'test-results/session-ru.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('link', { name: 'Лимиты', exact: true }).click()
  await expect(page.getByRole('meter').first()).toHaveAttribute('aria-valuenow', '34')
  await page.screenshot({ path: 'test-results/limits-ru.png', fullPage: true, animations: 'disabled' })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Лимиты провайдера' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
})

test('run selection preserves paginated runs and closes the technical journal', async ({ page }) => {
  const older = '44444444-4444-4444-8444-444444444444'
  const lists: string[] = []
  await page.route(`**/api/v1/sessions/${sid}/runs?**`, async (route) => {
    const cursor = new URL(route.request().url()).searchParams.get('cursor')
    lists.push(cursor ?? 'first')
    await route.fulfill({ json: { items: [run({ id: cursor ? older : rid, number: cursor ? 1 : 3 })], next_cursor: cursor ? null : 'older' } })
  })
  await page.goto(`/sessions/${sid}`)
  await expect(page.getByRole('heading', { name: 'Conversation', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByRole('link', { name: /Run #1/ })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 240))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  const journal = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Technical event log' }) })
  await journal.locator('summary').click()
  await expect(journal).toHaveAttribute('open', '')
  await page.getByRole('link', { name: /Run #1/ }).click()
  await expect(page).toHaveURL(new RegExp(older))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await expect(page.getByRole('heading', { name: 'Conversation', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'First page' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Run #1/ })).toBeVisible()
  await expect(journal).not.toHaveAttribute('open', '')
  await page.getByRole('link', { name: 'A newer run has started — show the latest' }).click()
  await expect(page).toHaveURL(new RegExp(`/sessions/${sid}$`))
  await expect(page.getByText('Latest run', { exact: true })).toBeVisible()
  expect(lists.filter((cursor) => cursor === 'first')).toHaveLength(1)
})

test('a click anywhere on a session row opens the session', async ({ page }) => {
  await page.goto('/sessions')
  await page.getByText('thread:192', { exact: true }).click()
  await expect(page).toHaveURL(/\/sessions\/55555555/)
  await expect(page.getByRole('heading', { name: 'Conversation', exact: true })).toBeVisible()
})

test('empty history stays empty while SSE reconnects', async ({ page }) => {
  await page.route('**/history?**', (route) => route.fulfill({ json: { items: [], next_cursor: null, event_cursor: '0' } }))
  await page.route('**/events/stream?**', (route) => route.fulfill({ status: 503 }))
  await page.goto(`/sessions/${sid}`)
  await expect(page.getByText('Reconnecting…')).toBeVisible()
  await expect(page.getByText('No messages yet')).toBeVisible()
  await expect(page.getByText('Could not load data')).toHaveCount(0)
})
