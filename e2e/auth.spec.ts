import { expect, test } from '@playwright/test'
import { mockAPI } from './fixtures'
import { BrowserAuthSessionMode } from '../src/api/generated'

test.beforeEach(async ({ page }) => { await mockAPI(page) })
test('api_only explains the missing browser access without exposing an API-key form', async ({ page }) => {
  await page.route('**/api/v1/auth/session', (route) => route.fulfill({ json: { mode: BrowserAuthSessionMode.api_only, authenticated: false, read_access: false, user: null, expires_at: null } }))
  await page.goto('/')
  await expect(page.getByText('Browser access is not configured')).toBeVisible()
  await expect(page.getByRole('textbox')).toHaveCount(0)
})
test('SAML starts navigation with a local return path', async ({ page }) => {
  await page.route('**/api/v1/auth/session', (route) => route.fulfill({ json: { mode: BrowserAuthSessionMode.saml, authenticated: false, read_access: false, user: null, expires_at: null } }))
  await page.route('**/auth/login**', (route) => route.fulfill({ contentType: 'text/html', body: 'SSO' }))
  await page.goto('/sessions?namespace=engineering')
  await expect(page).toHaveURL(/\/auth\/login/)
  expect(new URL(page.url()).searchParams.get('next')).toBe('/sessions?namespace=engineering')
})
test('logout revokes the local session and waits for explicit sign-in', async ({ page }) => {
  await page.route('**/api/v1/auth/session', (route) => route.fulfill({ json: { mode: BrowserAuthSessionMode.saml, authenticated: true, read_access: true, user: { display_name: 'Operator' }, expires_at: null } }))
  let csrf: string | undefined
  await page.route('**/auth/logout', async (route) => { csrf = route.request().headers()['x-orpheus-csrf']; await route.fulfill({ status: 204 }) })
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  expect(csrf).toBe('1')
  await expect(page).not.toHaveURL(/auth\/login/)
})
test('API 401 closes the current page and prompts for sign-in', async ({ page }) => {
  await page.route('**/api/v1/accounts/limits', (route) => route.fulfill({ status: 401, json: { error: { code: 'unauthorized', message: 'Sign in', details: [], phase: null } } }))
  await page.goto('/limits')
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Provider limits' })).toHaveCount(0)
})

test('API 403 stops the protected screen and shows access denied', async ({ page }) => {
  await page.route('**/api/v1/accounts/limits', (route) => route.fulfill({ status: 403, json: { error: { code: 'forbidden', message: 'Forbidden', details: [], phase: null } } }))
  await page.goto('/limits')
  await expect(page.getByText('Access denied', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Provider limits' })).toHaveCount(0)
})

test('a rejected logout keeps the readable dashboard open and only reports the failure', async ({ page }) => {
  await page.route('**/api/v1/auth/session', (route) => route.fulfill({ json: { mode: BrowserAuthSessionMode.saml, authenticated: true, read_access: true, user: { display_name: 'Operator' }, expires_at: null } }))
  await page.route('**/auth/logout', (route) => route.fulfill({ status: 403, json: { error: { code: 'forbidden', message: 'Invalid origin' } } }))
  await page.goto('/')
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByText('Could not sign out. Try again.')).toBeVisible()
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
  await expect(page.getByText('Access denied', { exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Limits', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Provider limits' })).toBeVisible()
})
