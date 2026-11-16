import { checkResponse } from './client'
import type { CreateLlmAccount, LlmAccountDetails } from './generated'

/** Preserve the raw JSON, including unknown fields and numbers beyond JS precision. */
export async function readAuthFile(id: string, signal: AbortSignal) {
  const response = await fetch(`/api/v1/llm-accounts/${encodeURIComponent(id)}/auth-file`, {
    credentials: 'same-origin', headers: { Accept: 'application/json' }, signal,
  })
  await checkResponse(response)
  const etag = response.headers.get('ETag')
  if (!etag) throw new Error('Missing authorization file ETag')
  return { text: await response.text(), etag }
}

export async function writeAuthFile(id: string, text: string, etag: string, signal: AbortSignal) {
  const response = await fetch(`/api/v1/llm-accounts/${encodeURIComponent(id)}/auth-file`, {
    method: 'PUT', credentials: 'same-origin', signal,
    headers: { 'Content-Type': 'application/json', 'X-Orpheus-CSRF': '1', 'If-Match': etag }, body: text,
  })
  await checkResponse(response, response.status === 401)
}

export async function createFileAccount(body: Omit<CreateLlmAccount, 'auth_file' | 'api_key'>, text: string, signal: AbortSignal): Promise<LlmAccountDetails> {
  const response = await fetch('/api/v1/llm-accounts', {
    method: 'POST', credentials: 'same-origin', signal,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Orpheus-CSRF': '1' },
    body: `${JSON.stringify(body).slice(0, -1)},"auth_file":${text}}`,
  })
  await checkResponse(response, response.status === 401)
  return response.json() as Promise<LlmAccountDetails>
}
