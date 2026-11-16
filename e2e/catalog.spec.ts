import { expect, test } from '@playwright/test'
import { llmAccount, modelProfile, sid, rid } from '../src/test/fixtures'
import { mockAPI } from './fixtures'

test.beforeEach(async ({ page }) => { await mockAPI(page) })
test('account cards page and filter on the server and fetch only visible limits', async ({ page }) => {
  const requests: string[] = [], limits: string[] = []
  await page.route('**/api/v1/llm-accounts?**', (route) => {
    const query = new URL(route.request().url()).searchParams
    requests.push(query.toString())
    const second = query.has('cursor')
    return route.fulfill({ json: { items: [llmAccount({ id: second ? rid : sid, name: second ? 'Beta' : 'Alpha', profiles: [] })], next_cursor: second ? null : 'next', prev_cursor: second ? 'previous' : null } })
  })
  await page.route('**/api/v1/accounts/limits?**', (route) => {
    limits.push(new URL(route.request().url()).searchParams.get('account_ids')!)
    return route.fulfill({ json: { items: [], as_of: new Date().toISOString(), stale_after_seconds: 60 } })
  })
  await page.goto('/settings/llm-accounts')
  await expect(page.getByRole('link', { name: 'Alpha', exact: true })).toBeVisible()
  expect(limits).toEqual([sid])
  await page.getByRole('navigation', { name: 'Catalog pages' }).getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('link', { name: 'Beta', exact: true })).toBeVisible()
  await expect(page.getByText('Page 2', { exact: true })).toBeVisible()
  expect(limits).toEqual([sid, rid])
  await page.getByLabel('Name contains').fill('alpha')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Alpha', exact: true })).toBeVisible()
  expect(requests.at(-1)).toBe('active=true&name_contains=alpha&limit=50')
  await page.locator('article').getByText('Active', { exact: false }).click()
  await expect(page).toHaveURL(new RegExp(`/settings/llm-accounts/${sid}$`))
})
test('profile rows open the profile while the nested account link opens the account', async ({ page }) => {
  await page.route('**/api/v1/profiles?**', (route) => route.fulfill({ json: { items: [modelProfile({ account_active: false, available: false })], next_cursor: null, prev_cursor: null } }))
  await page.goto('/settings/profiles')
  await expect(page.getByRole('heading', { name: 'Model profiles' })).toBeVisible()
  await expect(page.getByText('Account inactive', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Team account', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/settings/llm-accounts/${sid}$`))
  await page.goto('/settings/profiles')
  await page.getByRole('cell', { name: 'gpt-test', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/settings/profiles/${rid}$`))
})
