import { expect, test } from '@playwright/test'
const saml = !!process.env.INTEGRATION_SAML

test('production nginx, pinned core and browser auth work together', async ({ page, request }) => {
  await page.addInitScript(() => localStorage.setItem('orpheus_locale', 'en'))
  const created = await request.post('/api/v1/sessions', {
    headers: { Authorization: 'Bearer integration-only-key', 'Idempotency-Key': crypto.randomUUID() },
    data: { namespace: 'web-integration', external_key: `test:${crypto.randomUUID()}`, configuration: { agent: { profile: 'default' }, sandbox: { template: 'codex' } }, message: { text: 'Browser integration fixture' } },
  })
  expect(created.status()).toBe(202)
  const { session_id: sid, run_id: rid } = await created.json()
  await page.goto(`/sessions/${sid}`)
  if (saml) {
    await expect(page).toHaveURL(/localhost:18444/)
    await page.getByLabel('Username or email').fill('operator')
    await page.getByLabel('Password', { exact: true }).fill('fixture-password')
    const callback = page.waitForResponse((response) => new URL(response.url()).pathname === '/auth/callback')
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    const response = await callback
    const samlXML = Buffer.from(new URLSearchParams(response.request().postData()!).get('SAMLResponse')!, 'base64').toString()
    expect(/<(?:\w+:)?AuthnStatement[\s>]/.test(samlXML), 'Test IdP must emit AuthnStatement').toBe(true)
    expect(response.status()).toBe(303)
  }
  await expect(page.getByRole('heading', { name: 'Conversation', exact: true })).toBeVisible()
  await expect(page.getByText('Browser integration fixture', { exact: true })).toBeVisible()
  await expect(page.getByText('Awaiting delivery', { exact: true })).toBeVisible()
  // No worker is needed: cancelling an accepted run publishes a message delivery update.
  const cancelled = await request.post(`/api/v1/sessions/${sid}/runs/${rid}/cancel`, {
    headers: { Authorization: 'Bearer integration-only-key' },
  })
  expect(cancelled.status()).toBe(200)
  await expect(page.getByText('Rejected', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Browser integration fixture', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Analytics', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Orchestrator activity' })).toBeVisible()
  await page.getByRole('link', { name: 'Limits', exact: true }).click()
  await expect(page.getByText('fixture-account', { exact: true })).toBeVisible()
  const noBearer = await page.request.post('/api/v1/sessions', { data: {} })
  expect([401, 403]).toContain(noBearer.status())
  const missing = await request.get('/api/v1/not-a-route', { headers: { Authorization: 'Bearer integration-only-key' } })
  expect(missing.status()).toBe(404)
  expect(missing.headers()['content-type']).not.toContain('text/html')
  expect((await request.get('/assets/missing.js')).status()).toBe(404)
  const index = await request.get('/index.html')
  expect(index.headers()['cache-control']).toContain('no-store')
  const assets = (await index.text()).match(/\/assets\/[^" ]+\.js/g) ?? []
  expect(assets.length).toBeGreaterThan(0)
  const asset = await request.get(assets[0])
  expect(asset.headers()['cache-control']).toContain('immutable')
  for (const response of [index, asset, await request.get(`/sessions/${sid}/runs/${rid}`), await request.get('/assets/missing.js')]) {
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    expect(response.headers()['referrer-policy']).toBe('no-referrer')
  }
  if (saml) {
    const cookie = (await page.context().cookies()).find((item) => item.name === '__Host-orpheus_session')
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, path: '/' })
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
    expect((await page.request.get('/api/v1/accounts/limits')).status()).toBe(401)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Provider limits' })).toBeVisible()
    await page.getByRole('button', { name: 'Sign out' }).click()
  }
})
