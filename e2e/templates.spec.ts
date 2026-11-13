import { expect, test, type Page, type Route } from '@playwright/test'
import { mockAPI } from './fixtures'

// A two-page catalog: the first page holds every record, the second is empty but walkable in both directions.
const makeCatalog = () => [
  { id: '33333333-3333-4333-8333-333333333333', name: 'orpheus-codex', template_name: 'orpheus-codex', tag: null, description: 'Corporate Codex environment', active: true },
  { id: '44444444-4444-4444-8444-444444444444', name: 'orpheus-codex:v0.0.2', template_name: 'orpheus-codex', tag: 'v0.0.2', description: null, active: false },
  { id: '55555555-5555-4555-8555-555555555555', name: 'team/orpheus-codex-heavy', template_name: 'team/orpheus-codex-heavy', tag: null, description: 'Heavy build', active: true },
]
let catalog = makeCatalog()
const page2 = 'cursor-2'
// Glob patterns do not match query strings, and the catalog is always requested with filters.
const listUrl = /\/api\/v1\/templates(\?.*)?$/
const cardUrl = /\/api\/v1\/templates\/[^/?]+$/

function templates(route: Route) {
  const url = new URL(route.request().url())
  const active = url.searchParams.get('active')
  const contains = url.searchParams.get('name_contains')
  const cursor = url.searchParams.get('cursor')
  const name = url.searchParams.get('name')
  const items = catalog
    .filter((item) => name ? item.name === name : (active === null || item.active === (active === 'true')) && (!contains || item.name.toLowerCase().includes(contains.toLowerCase())))
  return route.fulfill({ json: { items, next_cursor: cursor ? null : page2, prev_cursor: cursor === page2 ? 'cursor-1' : null } })
}

test.beforeEach(async ({ page }) => {
  catalog = makeCatalog()
  await mockAPI(page)
  await page.route(listUrl, templates)
  await page.route(cardUrl, (route) => {
    const id = new URL(route.request().url()).pathname.split('/').at(-1)!
    const item = catalog.find((entry) => entry.id === id)
    if (item) return route.fulfill({ json: item })
    return route.fulfill({ status: 422, json: { error: { code: 'validation_error', message: 'Invalid', details: [], phase: null } } })
  })
})

/** The list links records by template name; the row link is addressed by the record it opens. */
const record = (page: Page, id: string) => page.locator(`a[href="/settings/templates/${id}"]`)

async function listRequests(page: Page) {
  const queries: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname === '/api/v1/templates') queries.push(url.searchParams.toString())
  })
  return queries
}

test('activity filters drive the API and survive a reload in the URL', async ({ page }) => {
  const queries = await listRequests(page)
  await page.goto('/settings/templates')
  await expect(page.getByRole('heading', { name: 'Sandbox templates' })).toBeVisible()
  await expect(record(page, '33333333-3333-4333-8333-333333333333')).toBeVisible()
  await expect(record(page, '44444444-4444-4444-8444-444444444444')).toHaveCount(0)
  expect(queries.at(-1)).toBe('active=true&limit=50')
  await page.getByRole('group', { name: 'Activity' }).getByRole('button', { name: 'Inactive' }).click()
  await expect(record(page, '44444444-4444-4444-8444-444444444444')).toBeVisible()
  await expect(record(page, '55555555-5555-4555-8555-555555555555')).toHaveCount(0)
  await expect(page).toHaveURL(/active=false$/)
  expect(queries.at(-1)).toBe('active=false&limit=50')
  await page.getByRole('group', { name: 'Activity' }).getByRole('button', { name: 'All' }).click()
  await expect(record(page, '44444444-4444-4444-8444-444444444444')).toBeVisible()
  await expect(page).toHaveURL(/active=all$/)
  expect(queries.at(-1)).toBe('limit=50')
  await page.reload()
  await expect(record(page, '44444444-4444-4444-8444-444444444444')).toBeVisible()
  expect(queries.at(-1)).toBe('limit=50')
})

test('the pager walks cursors and normalises the counter where the catalog begins', async ({ page }) => {
  const queries = await listRequests(page)
  await page.goto('/settings/templates')
  const group = page.getByRole('navigation', { name: 'Template pages' })
  await expect(group.getByRole('button', { name: 'Back' })).toBeDisabled()
  await expect(group.getByText('Page 1')).toBeVisible()
  await group.getByRole('button', { name: 'Next' }).click()
  await expect(page).toHaveURL(new RegExp(`cursor=${page2}&page=2$`))
  expect(queries.at(-1)).toContain(`cursor=${page2}`)
  await expect(group.getByRole('button', { name: 'Next' })).toBeDisabled()
  await expect(group.getByText('Page 2')).toBeVisible()
  await group.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/cursor=cursor-1$/)
  // Back at the only page there is nothing to walk to: the pager itself steps aside.
  await expect(group).toHaveCount(0)
  // A stale page counter above a page that turns out to be the first is dropped without a second request.
  await page.route(listUrl, (route) => route.fulfill({ json: { items: catalog.slice(0, 1), prev_cursor: null, next_cursor: null } }))
  const before = queries.length
  await page.goto(`/settings/templates?cursor=${page2}&page=4`)
  await expect(page).not.toHaveURL(/page=/)
  expect(queries).toHaveLength(before + 1)
})

test('an outdated cursor offers the first page but keeps the filters', async ({ page }) => {
  await page.route(listUrl, (route) => {
    const url = new URL(route.request().url())
    if (url.searchParams.get('cursor')) return route.fulfill({ status: 422, json: { error: { code: 'invalid_cursor', message: 'Outdated', details: [], phase: null } } })
    return templates(route)
  })
  const queries = await listRequests(page)
  await page.goto(`/settings/templates?active=all&name_contains=codex&cursor=${page2}&page=2`)
  await expect(page.getByRole('alert').getByText('This page link is out of date')).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open first page' }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page).toHaveURL(/active=all&name_contains=codex$/)
  expect(queries.at(-1)).toBe('name_contains=codex&limit=50')
})

test('a row opens the card and the stored list address returns to its filters', async ({ page }) => {
  await page.goto('/settings/templates?active=all')
  await record(page, '55555555-5555-4555-8555-555555555555').click()
  await expect(page.getByRole('heading', { name: 'team/orpheus-codex-heavy' })).toBeVisible()
  await expect(page.getByLabel('Description')).toHaveValue('Heavy build')
  await expect(page.getByRole('link', { name: 'Back to templates' })).toHaveAttribute('href', '/settings/templates?active=all')
  // The Settings item follows the same remembered address of its subsection.
  await page.getByRole('link', { name: 'Settings', exact: true }).click()
  await expect(page).toHaveURL(/\/settings\/templates\?active=all$/)
  // A reloaded card cannot know the previous list address and returns to default filters.
  await page.goto('/settings/templates/44444444-4444-4444-8444-444444444444')
  await page.getByRole('link', { name: 'Back to templates' }).click()
  await expect(page).toHaveURL(/\/settings\/templates$/)
})

test('a deleted record and a malformed address explain themselves and lead back', async ({ page }) => {
  await page.route(cardUrl, (route) => {
    if (new URL(route.request().url()).pathname.endsWith('33333333-3333-4333-8333-333333333333')) {
      return route.fulfill({ status: 404, json: { error: { code: 'not_found', message: 'Gone', details: [], phase: null } } })
    }
    return route.fallback()
  })
  await page.goto('/settings/templates/33333333-3333-4333-8333-333333333333')
  await expect(page.getByRole('alert').getByText('Template not found')).toBeVisible()
  await page.getByRole('alert').getByRole('link', { name: 'Back to templates' }).click()
  await expect(page).toHaveURL(/\/settings\/templates$/)
  await page.goto('/settings/templates/not-a-uuid')
  await expect(page.getByRole('alert').getByText('Invalid template address')).toBeVisible()
})

test('toggling activity sends the write and the active filter drops the record', async ({ page }) => {
  const writes: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'PATCH') writes.push(request.url())
  })
  await page.route(cardUrl, (route) => {
    if (route.request().method() === 'PATCH') {
      const id = new URL(route.request().url()).pathname.split('/').at(-1)!
      const saved = Object.assign(catalog.find((entry) => entry.id === id)!, route.request().postDataJSON() as object)
      return route.fulfill({ json: { ...saved } })
    }
    return route.fallback()
  })
  await page.goto('/settings/templates')
  // The box shows the stored state until the server confirms, so the row leaving the filter is the signal.
  await page.getByRole('checkbox', { name: 'Active: orpheus-codex' }).click()
  await expect(record(page, '33333333-3333-4333-8333-333333333333')).toHaveCount(0)
  expect(writes.at(-1)).toContain('/api/v1/templates/33333333-3333-4333-8333-333333333333')
})

test('adding a template checks AgentBox and opens the created record', async ({ page }) => {
  await page.goto('/settings/templates')
  await page.getByRole('link', { name: 'Add template' }).click()
  await expect(page).toHaveURL(/\/settings\/templates\/new$/)
  await expect(page.getByRole('heading', { name: 'New template' })).toBeVisible()
  await page.getByRole('button', { name: 'Add template' }).click()
  await expect(page.getByText('Required.')).toBeVisible()
  let body: Record<string, unknown> = {}
  let headers: Record<string, string> = {}
  const created = { id: '66666666-6666-4666-8666-666666666666', name: 'orpheus-codex:nightly', template_name: 'orpheus-codex', tag: 'nightly', description: null, active: true }
  await page.route(listUrl, (route) => {
    if (route.request().method() !== 'POST') return templates(route)
    body = route.request().postDataJSON()
    headers = route.request().headers()
    return route.fulfill({ status: 201, json: created })
  })
  await page.route(cardUrl, (route) => {
    if (new URL(route.request().url()).pathname.endsWith(created.id)) return route.fulfill({ json: created })
    return route.fallback()
  })
  await page.getByLabel('AgentBox template').fill('orpheus-codex')
  await page.getByLabel('Tag').fill('nightly')
  await page.getByRole('button', { name: 'Add template' }).click()
  await expect(page.getByRole('heading', { name: 'orpheus-codex:nightly' })).toBeVisible()
  expect(body).toEqual({ template_name: 'orpheus-codex', tag: 'nightly', description: null, active: true })
  expect(headers['x-orpheus-csrf']).toBe('1')
})

test('a rejected AgentBox check explains the field and keeps the form', async ({ page }) => {
  await page.route(listUrl, (route) => {
    if (route.request().method() !== 'POST') return templates(route)
    return route.fulfill({ status: 422, json: { error: { code: 'validation_error', message: 'Invalid', details: [{ path: ['body', 'template_name'], code: 'template_not_found' }], phase: null } } })
  })
  await page.goto('/settings/templates/new')
  await page.getByLabel('AgentBox template').fill('missing-template')
  await page.getByRole('button', { name: 'Add template' }).click()
  await expect(page.getByText('This AgentBox project has no such template.')).toBeVisible()
  await expect(page).toHaveURL(/\/settings\/templates\/new$/)
})

test('deleting from the card confirms once and returns to the list', async ({ page }) => {
  const deletes: string[] = []
  await page.route(cardUrl, (route) => {
    if (route.request().method() === 'DELETE') {
      deletes.push(route.request().url())
      return route.fulfill({ status: 204 })
    }
    return route.fallback()
  })
  await page.goto('/settings/templates?active=all')
  await record(page, '33333333-3333-4333-8333-333333333333').click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('alertdialog').getByText('Delete this catalog record?')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(deletes).toHaveLength(0)
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete record' }).click()
  await expect(page).toHaveURL(/\/settings\/templates\?active=all$/)
  expect(deletes.at(-1)).toContain('/api/v1/templates/33333333-3333-4333-8333-333333333333')
})
