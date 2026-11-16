import { afterEach, expect, it, vi } from 'vitest'
import { createFileAccount, readAuthFile, writeAuthFile } from './accountAuth'
import { CreateLLMAccountAuth_mode, CreateLLMAccountHarness } from './generated'

afterEach(() => vi.unstubAllGlobals())
it('preserves raw authorization JSON and uses its ETag for a conditional write', async () => {
  const raw = '{"unknown":9007199254740993123,"tokens":{"access_token":"private"}}'
  const fetcher = vi.fn().mockResolvedValueOnce(new Response(raw, { headers: { ETag: '"version-1"' } })).mockResolvedValueOnce(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetcher)
  const signal = new AbortController().signal
  const result = await readAuthFile('a/b', signal)
  expect(result).toEqual({ text: raw, etag: '"version-1"' })
  await writeAuthFile('a/b', result.text, result.etag, signal)
  expect(fetcher.mock.calls[1]).toEqual(['/api/v1/llm-accounts/a%2Fb/auth-file', {
    method: 'PUT', credentials: 'same-origin', signal,
    headers: { 'Content-Type': 'application/json', 'X-Orpheus-CSRF': '1', 'If-Match': '"version-1"' }, body: raw,
  }])
})
it('does not retry a conflict or a response without a file version', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ error: { code: 'credential_conflict' } }, { status: 409 })).mockResolvedValueOnce(new Response('{}'))
  vi.stubGlobal('fetch', fetcher)
  const signal = new AbortController().signal
  await expect(writeAuthFile('id', '{}', '"old"', signal)).rejects.toMatchObject({ status: 409 })
  expect(fetcher).toHaveBeenCalledTimes(1)
  await expect(readAuthFile('id', signal)).rejects.toThrow('ETag')
})
it('creates an account without rounding unknown authorization numbers or interpolating metadata as JSON', async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ id: 'created' }, { status: 201 }))
  vi.stubGlobal('fetch', fetcher)
  await createFileAccount({ name: 'Name " quoted', active: true, harness: CreateLLMAccountHarness.codex, auth_mode: CreateLLMAccountAuth_mode.account, credential_store: 'main' }, '{"unknown":9007199254740993123}', new AbortController().signal)
  expect(fetcher.mock.calls[0][1].body).toBe('{"name":"Name \\" quoted","active":true,"harness":"codex","auth_mode":"account","credential_store":"main","auth_file":{"unknown":9007199254740993123}}'.replace('\\\\"', '\\"'))
})
