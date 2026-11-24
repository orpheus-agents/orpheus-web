import { expect, test } from '@playwright/test'
import { mockAPI } from './fixtures'
import { sid, rid, limits, llmAccount, run, session, timestamp } from '../src/test/fixtures'
import { HookResultName, HookResultStatus, HookResultOutput_completeness, AccountLimitItemState, RunStatus, SandboxEventType, SandboxStateState, PathsApiV1AnalyticsOverviewGetParametersQueryWindow as Window, type Event } from '../src/api/generated'

test.beforeEach(async ({ page }) => { await mockAPI(page) })

for (const locale of ['en', 'ru'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`service codes and delivered ENV names in ${locale}, ${theme}`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('orpheus_locale', value), locale)
      await page.emulateMedia({ colorScheme: theme })
      const saved = session()
      saved.configuration.sandbox.services = ['removed-service']
      const harnessNames = [
        'ARTIFACTS_ACCESS_KEY_ID', 'ARTIFACTS_BUCKET', 'ARTIFACTS_ENDPOINT_URL', 'ARTIFACTS_PUBLIC_BASE_URL',
        'ARTIFACTS_REGION', 'ARTIFACTS_SECRET_ACCESS_KEY', 'GH_HOST', 'GH_TOKEN', 'GITLAB_HOST', 'GITLAB_TOKEN',
        'HELPDESK_API_KEY', 'HELPDESK_HOST', 'ORPHEUS_LANGFUSE_CHAT_ASSISTANT_PUBLIC_KEY', 'REDMINE_API_KEY', 'REDMINE_HOST',
      ]
      await page.route(`**/api/v1/sessions/${sid}`, (route) => route.fulfill({ json: saved }))
      const currentRun = run({
        status: RunStatus.completed, finished_at: '2026-09-25T06:02:14Z',
        services: ['registry'], harness_env_names: harnessNames, hooks: [{
          id: rid, name: HookResultName.before_run, status: HookResultStatus.completed, env_names: ['HOOK_TOKEN'],
          started_at: timestamp, deadline_at: null, finished_at: timestamp, exit_code: 0, signal: null,
          output: null, output_completeness: HookResultOutput_completeness.complete, truncation_reason: null, error: null,
        }],
      })
      const previousId = '44444444-4444-4444-8444-444444444444'
      const previousRun = run({
        id: previousId, number: 2, harness_env_names: ['PREVIOUS_HOST'],
        hooks: [{ ...currentRun.hooks[0], id: previousId, env_names: ['PREVIOUS_TOKEN'] }],
      })
      for (const item of [currentRun, previousRun]) {
        await page.route(`**/api/v1/sessions/${sid}/runs/${item.id}`, (route) => route.fulfill({ json: item }))
      }
      await page.route('**/api/v1/services', () => { throw new Error('History requested the current catalog') })
      await page.goto(`/sessions/${sid}/runs/${rid}`)
      const sessionCard = page.locator('section').filter({ has: page.getByRole('heading', { name: locale === 'en' ? 'Configuration' : 'Конфигурация', exact: true }) })
      const runCard = page.locator('aside section').filter({ has: page.getByRole('heading', { name: locale === 'en' ? 'Run #3' : 'Запуск №3', exact: true }) })
      const hint = locale === 'en' ? 'These services are available to before_run and after_run hooks only.' : 'Эти сервисы доступны только хукам before_run и after_run.'
      const hooks = locale === 'en' ? 'Hook services' : 'Сервисы хуков'
      await expect(sessionCard.getByText('removed-service', { exact: true })).toBeVisible()
      await expect(sessionCard.getByText('registry', { exact: true })).toHaveCount(0)
      await expect(runCard.getByText('registry', { exact: true })).toBeVisible()
      const harnessSummary = runCard.locator('summary', { hasText: locale === 'en' ? 'Harness environment' : 'ENV харнеса' })
      const harnessName = runCard.getByText('REDMINE_HOST', { exact: true })
      await expect(harnessSummary).toContainText(String(harnessNames.length))
      await expect(harnessName).toBeHidden()
      await runCard.screenshot({ path: `test-results/run-env-collapsed-${locale}-${theme}.png` })
      await harnessSummary.press('Enter')
      await expect(harnessName).toBeVisible()
      await harnessSummary.blur()
      await runCard.screenshot({ path: `test-results/run-env-expanded-${locale}-${theme}.png` })
      await runCard.locator('summary').filter({ hasText: 'before_run' }).click()
      const hookSummary = runCard.locator('summary', { hasText: locale === 'en' ? 'Environment variables' : 'Переменные окружения' })
      await expect(hookSummary).toContainText('1')
      await expect(runCard.getByText('HOOK_TOKEN', { exact: true })).toBeHidden()
      await hookSummary.click()
      await expect(runCard.getByText('HOOK_TOKEN', { exact: true })).toBeVisible()
      await expect(harnessName).toBeVisible()
      await runCard.getByRole('button', { name: hooks, exact: true }).focus()
      await expect(page.getByRole('tooltip')).toHaveText(hint)
      await page.keyboard.press('Escape')
      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await harnessSummary.click()
      await expect(harnessName).toBeHidden()
      await expect(runCard.getByText('HOOK_TOKEN', { exact: true })).toBeVisible()
      await harnessSummary.click()
      await page.getByRole('link', { name: locale === 'en' ? /Run #2/ : /Запуск №2/ }).click()
      await expect(page.getByRole('heading', { name: locale === 'en' ? 'Run #2' : 'Запуск №2', exact: true })).toBeVisible()
      await expect(page.getByText('REDMINE_HOST', { exact: true })).toHaveCount(0)
      await expect(page.getByText('HOOK_TOKEN', { exact: true })).toHaveCount(0)
      const previousName = page.getByText('PREVIOUS_HOST', { exact: true })
      await expect(previousName).toBeAttached()
      await expect(previousName).toBeHidden()
      await page.locator('summary', { hasText: 'before_run' }).click()
      const previousToken = page.getByText('PREVIOUS_TOKEN', { exact: true })
      await expect(previousToken).toBeAttached()
      await expect(previousToken).toBeHidden()
    })
  }
}

for (const theme of ['light', 'dark'] as const) {
  test(`semantic styles, focus and code typography work in ${theme}`, async ({ page }) => {
    const dark = theme === 'dark'
    const ink = dark ? 'rgb(237, 237, 235)' : 'rgb(14, 14, 16)'
    const line = dark ? 'rgb(44, 44, 48)' : 'rgb(224, 219, 211)'
    const accent = dark ? 'rgb(78, 242, 170)' : 'rgb(0, 173, 113)'
    await page.emulateMedia({ colorScheme: theme })
    await page.goto('/')
    await expect(page.locator('body')).toHaveCSS('background-color', dark ? 'rgb(14, 14, 16)' : 'rgb(247, 246, 243)')
    await expect(page.locator('.panel').first()).toHaveCSS('background-color', dark ? 'rgb(23, 23, 26)' : 'rgb(255, 255, 255)')
    await expect(page.locator('.panel').first()).toHaveCSS('color', ink)
    await expect(page.locator('svg line[stroke-dasharray]').first()).toHaveCSS('stroke', line)
    await expect(page.locator('.nav-link.selected')).toHaveCSS('border-bottom-color', accent)
    const apply = page.getByRole('button', { name: 'Apply', exact: true })
    await apply.focus()
    await expect(apply).toHaveCSS('outline-width', '2px')
    await expect(apply).toHaveCSS('outline-style', 'solid')
    await expect(apply).toHaveCSS('cursor', 'pointer')
    await apply.hover()
    await expect(apply).toHaveCSS('background-color', dark ? 'rgb(28, 28, 31)' : 'rgb(241, 238, 233)')

    await page.goto(`/sessions/${sid}`)
    const config = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Configuration', exact: true }) })
    await expect(config.locator('.field-label').first()).toHaveCSS('line-height', '16px')
    await config.locator('summary').click()
    const code = config.locator('pre')
    await expect(code).toHaveCSS('font-family', /JetBrains Mono/)
    await expect(code).toHaveCSS('border-radius', '10px')
    await expect(code).toHaveCSS('background-color', 'rgb(11, 11, 13)')
    await expect(code).toHaveCSS('color', 'rgb(216, 216, 212)')
    await expect(code).toHaveCSS('overflow-wrap', 'break-word')
    await expect(page.locator(`header img[src="/orpheus-logo${dark ? '' : '-light'}.svg"]`)).toBeVisible()
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator('header img').first()).toBeVisible()
    await expect(page.locator(`header img[src="/orpheus-logo${dark ? '' : '-light'}.svg"]`)).toBeHidden()
  })
}

test('analytics has metrics, chart and namespaces; periods and section filters are independent', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Analytics', exact: true })).toBeVisible()
  await expect(page.getByText('14.8M', { exact: true })).toBeVisible()
  const tokens = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Run tokens' }) })
  await expect(tokens.getByText('Cached', { exact: true })).toBeVisible()
  await expect(tokens.getByText('4.1M', { exact: true })).toBeVisible()
  await expect(tokens.getByText('Reasoning', { exact: true })).toBeVisible()
  await expect(tokens.getByText('760K', { exact: true })).toBeVisible()
  const runs = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Runs', exact: true }) })
  await expect(runs.getByText('In progress', { exact: true })).toBeVisible()
  await expect(runs.getByText('224', { exact: true })).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show only support', exact: true })).toHaveCount(3)
  await expect(page.getByText('No namespace', { exact: true })).toHaveCount(3)
  await expect(page.getByText('10.3M', { exact: true })).toBeVisible()
  await expect(page.getByText('1 day 9 hr', { exact: true })).toBeVisible()
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

test('long analytics periods use daily buckets and restore grouping for short periods', async ({ page }) => {
  await page.goto('/')
  const period = page.getByLabel('Period', { exact: true })
  const grouping = page.getByLabel('Group by', { exact: true })
  for (const [value, label] of [[Window.Value3m, 'Last 3 months'], [Window.Value6m, 'Last 6 months'], [Window.Value1y, 'Last year']] as const) {
    const request = page.waitForRequest((r) => new URL(r.url()).searchParams.get('window') === value)
    await period.selectOption({ label })
    expect(new URL((await request).url()).searchParams.get('bucket')).toBe('day')
    await expect(grouping).toHaveValue('day')
    await expect(grouping).toBeDisabled()
  }
  await page.reload()
  await expect(period).toHaveValue(Window.Value1y)
  await period.selectOption(Window.Value24h)
  await expect(grouping).toBeEnabled()
  await expect(grouping).toHaveValue('hour')
})

test('session filters use catalog profiles and pass partial matches to the API', async ({ page }) => {
  await page.goto('/sessions')
  const profile = page.getByLabel('Profile', { exact: true })
  await expect(profile.getByRole('option', { name: 'deep', exact: true })).toBeAttached()
  await page.getByLabel('Namespace', { exact: true }).fill('GINEER')
  await page.getByLabel('Model', { exact: true }).fill('GPT')
  const filtered = page.waitForRequest((r) => {
    const url = new URL(r.url())
    return url.pathname.endsWith('/sessions') && url.searchParams.has('profile')
  })
  await profile.selectOption('deep')
  const filters = new URL((await filtered).url()).searchParams
  expect(filters.get('profile')).toBe('deep')
  expect(filters.get('namespace_contains')).toBe('GINEER')
  expect(filters.get('model_contains')).toBe('GPT')
  expect(filters.has('namespace')).toBe(false)
  expect(filters.has('model')).toBe(false)
  await page.reload()
  await expect(profile).toHaveValue('deep')
  await expect(page.getByLabel('Namespace', { exact: true })).toHaveValue('GINEER')
  await expect(page.getByLabel('Model', { exact: true })).toHaveValue('GPT')
})

test('a namespace in the widgets filters the analytics page and hides the widgets', async ({ page }) => {
  await page.goto('/')
  const filtered = page.waitForRequest((r) => r.url().includes('analytics/overview') && r.url().includes('namespace=support'))
  await page.getByRole('button', { name: 'Show only support', exact: true }).first().click()
  await filtered
  await expect(page.getByLabel('Namespace', { exact: true })).toHaveValue('support')
  await expect(page).toHaveURL(/namespace=support/)
  await expect(page.getByRole('button', { name: 'Show only support', exact: true })).toHaveCount(0)
  await page.getByLabel('Namespace', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Show only support', exact: true })).toHaveCount(3)
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
  const runDetails = page.locator('aside section').filter({ has: page.getByRole('heading', { name: 'Run #3' }) })
  await expect(runDetails.getByText('Cached', { exact: true })).toBeVisible()
  await expect(runDetails.getByText('1,800', { exact: true })).toBeVisible()
  await expect(runDetails.getByText('Reasoning', { exact: true })).toBeVisible()
  await expect(runDetails.getByText('400', { exact: true })).toBeVisible()
})

test('quota states and values above 100% remain explicit', async ({ page }) => {
  const data = limits()
  data.items[0].state = AccountLimitItemState.stale
  data.items[0].buckets[0].primary!.used_percent = 120
  data.items[0].buckets[0].primary!.remaining_percent = 0
  data.items.push({ account_id: 'new-account', profiles: ['new'], state: AccountLimitItemState.unknown, observed_at: null, last_attempt_at: null, error_code: null, reset_credits_available: null, buckets: [] })
  await page.route('**/api/v1/llm-accounts?**', (route) => route.fulfill({ json: { items: data.items.map((item) => llmAccount({ id: item.account_id, name: item.account_id, profiles: item.profiles })), next_cursor: null, prev_cursor: null } }))
  await page.route('**/api/v1/accounts/limits*', (route) => route.fulfill({ json: data }))
  await page.goto('/settings/llm-accounts')
  await expect(page.getByText('120% used', { exact: true })).toBeVisible()
  await expect(page.getByRole('meter').first()).toHaveAttribute('aria-valuenow', '0')
  await expect(page.getByText('No observation yet', { exact: true })).toBeVisible()
  await expect(page.getByText('No observation yet', { exact: true })).toHaveAttribute('title', 'No observation yet. This does not mean the quota is unused.')
  await expect(page.getByText('Stale', { exact: false })).toBeVisible()
  await expect(page.getByText('2 resets available', { exact: true })).toBeVisible()
  await expect(page.locator('article p[title]:has(.marker) + p')).toHaveText('2 resets available')
  await expect(page.locator('article').filter({ has: page.getByRole('heading', { name: 'new-account', exact: true }) }).getByText(/resets? available/)).toHaveCount(0)
})

for (const locale of ['en', 'ru'] as const) {
  test(`session mode follows the API policy in ${locale}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('orpheus_locale', value), locale)
    let data = session()
    await page.route(`**/api/v1/sessions/${sid}`, (route) => route.fulfill({ json: data }))
    for (const multiple of [false, true]) {
      data = session({ allow_multiple_runs: multiple })
      await page.emulateMedia({ colorScheme: multiple ? 'dark' : 'light' })
      await page.setViewportSize(multiple ? { width: 390, height: 844 } : { width: 1440, height: 1000 })
      await page.goto(`/sessions/${sid}`)
      const panel = page.locator('section').filter({ has: page.getByRole('heading', { name: locale === 'ru' ? 'Конфигурация' : 'Configuration', exact: true }) })
      await expect(panel.getByText(locale === 'ru' ? 'Режим сессии' : 'Session mode', { exact: true })).toBeVisible()
      const label = locale === 'ru'
        ? multiple ? 'Можно продолжать' : 'Один запуск'
        : multiple ? 'Can continue' : 'Single run'
      await expect(panel.getByText(label, { exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await panel.screenshot({ path: `test-results/session-mode-${locale}-${multiple ? 'multiple' : 'single'}.png`, animations: 'disabled' })
    }
  })
}

test('sandbox deletion updates through SSE without changing a completed run or its session mode', async ({ page }) => {
  const data = session({ allow_multiple_runs: false, status: RunStatus.completed, active_run_id: null })
  data.sandbox.state = SandboxStateState.deleting
  data.sandbox.error = { code: 'sandbox_delete_failed', message: 'Deletion will be retried', phase: null, details: [] }
  await page.route(`**/api/v1/sessions/${sid}`, (route) => route.fulfill({ json: data }))
  await page.route(`**/api/v1/sessions/${sid}/runs/${rid}`, (route) => route.fulfill({ json: run({ status: RunStatus.completed, finished_at: timestamp }) }))
  let publish: (() => Promise<void>) | undefined
  await page.route('**/events/stream**', (route) => {
    publish = async () => {
      const event: Event = { type: SandboxEventType.sandbox_updated, id: '11', session_id: sid, created_at: timestamp, data: data.sandbox }
      await route.fulfill({ contentType: 'text/event-stream', body: `id: 11\nevent: sandbox.updated\ndata: ${JSON.stringify(event)}\n\n` })
    }
  })
  await page.goto(`/sessions/${sid}`)
  const config = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Configuration', exact: true }) })
  const result = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Run #3', exact: true }) })
  await expect(config.getByText('Single run', { exact: true })).toBeVisible()
  await expect(config.getByText('Deleting', { exact: true })).toBeVisible()
  await expect(config.getByRole('alert')).toContainText('Deletion will be retried')
  await expect(result.getByText('Completed', { exact: true })).toBeVisible()
  await expect(result.getByRole('alert')).toHaveCount(0)
  await expect.poll(() => !!publish).toBe(true)
  data.sandbox = { ...data.sandbox, state: SandboxStateState.deleted, error: null }
  await publish!()
  await expect(config.getByText('Deleted', { exact: true })).toBeVisible()
  await expect(config.getByRole('alert')).toHaveCount(0)
  await expect(config.getByText('Single run', { exact: true })).toBeVisible()
  await expect(result.getByText('Completed', { exact: true })).toBeVisible()
})

for (const locale of ['en', 'ru'] as const) {
  test(`reset counts update through polling in ${locale}, light and dark layouts`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('orpheus_locale', value), locale)
    await page.clock.install()
    const data = limits()
    await page.route('**/api/v1/accounts/limits*', (route) => route.fulfill({ json: data }))
    await page.goto('/settings/llm-accounts')
    const twoResets = locale === 'ru' ? 'Доступно 2 сброса' : '2 resets available'
    await expect(page.getByText(twoResets, { exact: true })).toBeVisible()
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme })
      await page.setViewportSize(theme === 'light' ? { width: 1440, height: 1000 } : { width: 390, height: 844 })
      await expect(page.getByText(twoResets, { exact: true })).toBeVisible()
      await expect(page.locator('article p[title]:has(.marker) + p')).toHaveText(twoResets)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.screenshot({ path: `test-results/resets-${locale}-${theme}.png`, fullPage: true, animations: 'disabled' })
    }
    data.items[0].reset_credits_available = 0
    await page.clock.fastForward(30_000)
    await expect(page.getByText(locale === 'ru' ? 'Доступно 0 сбросов' : '0 resets available', { exact: true })).toBeVisible()
    data.items[0].reset_credits_available = null
    await page.clock.fastForward(30_000)
    await expect(page.getByText(locale === 'ru' ? /Доступ(?:ен|но) \d+ сброс/ : /\d+ resets? available/)).toHaveCount(0)
    await expect(page.locator('article p[title]:has(.marker) + p')).toHaveCount(0)
  })
}

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
  await page.getByRole('link', { name: 'Settings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'LLM accounts' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Settings' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/limits-mobile.png', fullPage: true, animations: 'disabled' })
})

for (const theme of ['light', 'dark'] as const) {
  test(`the settings menu marks its item in ink and returns to the last subsection in ${theme}`, async ({ page }) => {
    const ink = theme === 'dark' ? 'rgb(237, 237, 235)' : 'rgb(14, 14, 16)'
    await page.emulateMedia({ colorScheme: theme })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings\/llm-accounts$/)
    await expect(page).toHaveTitle('LLM accounts / Settings / Orpheus')
    const menu = page.getByRole('navigation', { name: 'Settings' })
    await expect(menu.getByRole('link', { name: 'LLM accounts', exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(page.locator('.subnav-link.selected')).toHaveCSS('border-bottom-color', ink)
    await expect(page.locator('.nav-link.selected')).toHaveText('Settings')
    await page.screenshot({ path: `test-results/settings-${theme}.png`, animations: 'disabled' })
    await page.goto('/settings/llm-accounts?view=all')
    await page.getByRole('link', { name: 'Sessions', exact: true }).click()
    await expect(menu).toHaveCount(0)
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await expect(page).toHaveURL(/\/settings\/llm-accounts\?view=all$/)
  })
}

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
  await expect(page.getByRole('heading', { name: 'Аналитика', exact: true })).toBeVisible()
  await expect(page.getByText('Из кеша', { exact: true })).toBeVisible()
  await expect(page).toHaveTitle('Аналитика / Orpheus')
  await page.screenshot({ path: 'test-results/analytics-ru.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('link', { name: 'Сессии', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await page.screenshot({ path: 'test-results/sessions-ru.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('link', { name: '11111111', exact: true }).click()
  await expect(page.getByText('All tests pass.', { exact: false })).toBeVisible()
  await page.screenshot({ path: 'test-results/session-ru.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('link', { name: 'Настройки', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Настройки' }).getByRole('link', { name: 'LLM-аккаунты', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('meter').first()).toHaveAttribute('aria-valuenow', '66')
  await expect(page).toHaveTitle('LLM-аккаунты / Настройки / Orpheus')
  await page.screenshot({ path: 'test-results/limits-ru.png', fullPage: true, animations: 'disabled' })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'LLM-аккаунты' })).toBeVisible()
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

test('profile and template descriptions support hover and keyboard without opening rows', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (['/api/v1/profiles', '/api/v1/templates'].includes(new URL(request.url()).pathname)) requests.push(new URL(request.url()).pathname)
  })
  await page.goto('/sessions')
  const profile = page.getByRole('button', { name: 'default', exact: true }).first()
  await profile.hover()
  await expect(page.getByRole('tooltip')).toHaveText('General research profile')
  await profile.click()
  await expect(page).toHaveURL(/\/sessions$/)
  await page.getByRole('button', { name: 'default', exact: true }).nth(1).hover()
  await expect(page.getByRole('tooltip')).toHaveCount(1)
  await expect(profile).not.toHaveAttribute('aria-describedby')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  expect(requests.filter((path) => path.endsWith('/profiles'))).toHaveLength(1)
  // The list loads profiles only; template descriptions are read per session by exact name.
  expect(requests.filter((path) => path.endsWith('/templates'))).toHaveLength(0)
  await page.getByRole('link', { name: sid.slice(0, 8), exact: true }).click()
  await expect(page.getByRole('button', { name: 'codex', exact: true })).toBeVisible()
  expect(requests.filter((path) => path.endsWith('/templates'))).toHaveLength(1)
  await page.getByRole('button', { name: 'codex', exact: true }).focus()
  await expect(page.getByRole('tooltip')).toHaveText('Sandbox with development tools')
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'codex', exact: true }).scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'codex', exact: true }).click()
    await expect(page.getByRole('tooltip')).toBeVisible()
    const box = await page.getByRole('tooltip').boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    expect(box!.y + box!.height).toBeLessThanOrEqual(844)
    await page.screenshot({ path: 'test-results/catalog-' + colorScheme + '.png' })
  }
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'deep', exact: true }).focus()
  await expect(page.getByRole('tooltip')).toHaveText('Detailed research')
})

test('missing or unavailable catalog entries never hide stored names', async ({ page }) => {
  await page.route('**/api/v1/profiles*', (route) => route.fulfill({ status: 503, json: { error: { code: 'storage_unavailable', message: 'Unavailable', details: [], phase: null } } }))
  await page.route('**/api/v1/templates', (route) => route.fulfill({ json: { items: [] } }))
  await page.goto('/sessions/' + sid)
  await expect(page.getByText('default', { exact: true })).toBeVisible()
  await expect(page.getByText('codex', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'default', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Back to sessions', exact: true }).locator('..').getByText('Reconnecting…')).toBeVisible()
})
