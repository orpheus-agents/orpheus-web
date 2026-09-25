import type { Page } from '@playwright/test'
import { overview, session, run, history, limits, rid, message, sid, timestamp } from '../src/test/fixtures'
import { BrowserAuthSessionMode, MessageEventType, RunStatus } from '../src/api/generated'

export async function mockAPI(page: Page) {
  await page.addInitScript(() => { if (!localStorage.getItem('orpheus_locale')) localStorage.setItem('orpheus_locale', 'en') })
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    let data: unknown
    if (url.pathname.endsWith('/auth/session')) data = { mode: BrowserAuthSessionMode.anonymous, authenticated: false, read_access: true, user: null, expires_at: null }
    else if (url.pathname.endsWith('/analytics/overview')) data = { ...overview(), timezone: url.searchParams.get('timezone') ?? 'UTC' }
    else if (url.pathname.endsWith('/accounts/limits')) data = limits()
    else if (url.pathname.endsWith('/events/stream')) {
      const event = { type: MessageEventType.message_updated, id: '11', session_id: sid, created_at: timestamp, data: message({ text: 'The pagination fix is ready. **All tests pass.**' }) }
      await route.fulfill({ contentType: 'text/event-stream', body: `id: 11\nevent: message.updated\ndata: ${JSON.stringify(event)}\n\n` })
      return
    } else if (url.pathname.endsWith('/history')) data = history()
    else if (url.pathname.endsWith('/events')) data = { items: [], has_more: false, next_cursor: '0' }
    else if (url.pathname.endsWith('/runs')) data = { items: [run(), run({ id: '44444444-4444-4444-8444-444444444444', number: 2, status: RunStatus.completed, finished_at: timestamp })], next_cursor: null }
    else if (url.pathname.includes('/runs/')) data = run({ id: url.pathname.split('/').at(-1) ?? rid })
    else if (url.pathname.endsWith('/sessions')) data = { items: [session(), session({ id: '55555555-5555-4555-8555-555555555555', namespace: 'support', external_key: 'thread:192', status: RunStatus.finalizing, usage: { input_tokens: 28840, output_tokens: 7600, total_tokens: 36440 } })], next_cursor: url.searchParams.has('cursor') ? null : 'next-page' }
    else data = session()
    await route.fulfill({ json: data })
  })
}
