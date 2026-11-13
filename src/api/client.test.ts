import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, get, logout, onAccessFailure, send } from './client'
import { PathsApiV1SessionsGetParametersQueryActivity as Activity } from './generated'
afterEach(() => vi.unstubAllGlobals())
describe('API transport', () => {
  it('encodes opaque keys and passes the abort signal and same-origin credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ items: [], next_cursor: null }))
    vi.stubGlobal('fetch', fetcher)
    const signal = new AbortController().signal
    await get('/api/v1/sessions', { signal, query: { namespace: 'team / A', external_key: 'a&b', activity: Activity.active } })
    const [url, options] = fetcher.mock.calls[0]
    expect(new URL(url, 'http://example.test').searchParams.get('external_key')).toBe('a&b')
    expect(options).toMatchObject({ signal, credentials: 'same-origin' })
    expect(options.headers).not.toHaveProperty('Authorization')
  })
  it('reports auth failures centrally, preserving status and structured error', async () => {
    const failed = vi.fn()
    const remove = onAccessFailure(failed)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { code: 'unauthorized', message: 'Sign in', details: [], phase: null } }, { status: 401 })))
    await expect(get('/api/v1/accounts/limits', { signal: new AbortController().signal })).rejects.toMatchObject({ status: 401, problem: { code: 'unauthorized' } })
    expect(failed).toHaveBeenCalledWith(401)
    remove()
  })
  it('reports non-JSON proxy errors without treating HTML as API data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })))
    await expect(get('/api/v1/accounts/limits', { signal: new AbortController().signal })).rejects.toBeInstanceOf(ApiError)
  })
  it('sends browser writes as same-origin JSON with the CSRF header', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: 'a/b' }, { status: 201 }))
    vi.stubGlobal('fetch', fetcher)
    const signal = new AbortController().signal
    await expect(send('patch', '/api/v1/templates/{id}', { signal, path: { id: 'a/b' }, body: { description: null } })).resolves.toEqual({ id: 'a/b' })
    expect(fetcher.mock.calls[0]).toEqual(['/api/v1/templates/a%2Fb', {
      method: 'PATCH', credentials: 'same-origin', signal, body: '{"description":null}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Orpheus-CSRF': '1' },
    }])
    fetcher.mockResolvedValue(new Response(null, { status: 204 }))
    await expect(send('delete', '/api/v1/templates/{id}', { signal, path: { id: 'x' } })).resolves.toBeUndefined()
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: 'DELETE', body: undefined, headers: { 'X-Orpheus-CSRF': '1' } })
    expect(fetcher.mock.calls[1][1].headers).not.toHaveProperty('Content-Type')
  })
  it('keeps read access after a rejected write but still asks to sign in when the session expired', async () => {
    const failed = vi.fn()
    const remove = onAccessFailure(failed)
    const signal = new AbortController().signal
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { code: 'invalid_origin', message: 'Origin', details: [], phase: null } }, { status: 403 })))
    await expect(send('delete', '/api/v1/templates/{id}', { signal, path: { id: 'x' } })).rejects.toMatchObject({ status: 403, problem: { code: 'invalid_origin' } })
    expect(failed).not.toHaveBeenCalled()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { code: 'unauthorized', message: 'Sign in', details: [], phase: null } }, { status: 401 })))
    await expect(send('delete', '/api/v1/templates/{id}', { signal, path: { id: 'x' } })).rejects.toMatchObject({ status: 401 })
    expect(failed).toHaveBeenCalledWith(401)
    remove()
  })
  it('sends the required logout CSRF header', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetcher)
    await logout(new AbortController().signal)
    expect(fetcher.mock.calls[0]).toMatchObject(['/auth/logout', { method: 'POST', headers: { 'X-Orpheus-CSRF': '1' } }])
  })
  it('does not invalidate read access when logout is rejected', async () => {
    const failed = vi.fn()
    const remove = onAccessFailure(failed)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { code: 'forbidden', message: 'Invalid origin' } }, { status: 403 })))
    await expect(logout(new AbortController().signal)).rejects.toMatchObject({ status: 403 })
    expect(failed).not.toHaveBeenCalled()
    remove()
  })
})
