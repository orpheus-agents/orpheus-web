import type { ErrorResponse, paths } from './generated'

type JSONGet<P> = P extends { get: { responses: { 200: { content: { 'application/json': unknown } } } } } ? P : never
type GetPath = { [P in keyof paths]: JSONGet<paths[P]> extends never ? never : P }[keyof paths]
type Operation<P extends GetPath> = paths[P]['get']
type Params<P extends GetPath> = Operation<P> extends { parameters: infer T } ? T : never
type Query<P extends GetPath> = Params<P> extends { query?: infer Q } ? Q : never
type PathParams<P extends GetPath> = Params<P> extends { path?: infer R } ? R : never
type Response<P extends GetPath> = Operation<P> extends { responses: { 200: { content: { 'application/json': infer R } } } } ? R : never

export class ApiError extends Error {
  constructor(readonly status: number, readonly problem?: ErrorResponse['error']) {
    super(problem?.message ?? `HTTP ${status}`)
  }
}

let accessFailure: ((status: number) => void) | undefined
export function onAccessFailure(handler: (status: number) => void) {
  accessFailure = handler
  return () => { if (accessFailure === handler) accessFailure = undefined }
}

export async function checkResponse(response: globalThis.Response, reportAccessFailure = true) {
  if (response.ok) return
  if (reportAccessFailure && (response.status === 401 || response.status === 403)) accessFailure?.(response.status)
  const payload: ErrorResponse | null = await response.json().catch(() => null)
  throw new ApiError(response.status, payload?.error)
}

export async function get<P extends GetPath>(path: P, options: {
  signal: AbortSignal
  query?: Query<P>
} & (PathParams<P> extends undefined ? { path?: never } : { path: PathParams<P> })): Promise<Response<P>> {
  let url: string = path
  for (const [name, value] of Object.entries(options.path ?? {})) url = url.replace(`{${name}}`, encodeURIComponent(String(value)))
  const query = new URLSearchParams()
  for (const [name, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null) query.set(name, String(value))
  }
  const response = await fetch(url + (query.size ? `?${query}` : ''), {
    credentials: 'same-origin', headers: { Accept: 'application/json' }, signal: options.signal,
  })
  await checkResponse(response)
  return response.json() as Promise<Response<P>>
}

type WriteMethod = 'post' | 'patch' | 'delete'
type WriteOperation<P extends keyof paths, M extends WriteMethod> = NonNullable<paths[P][M]>
type WritePath<M extends WriteMethod> = { [P in keyof paths]: [paths[P][M]] extends [never | undefined] ? never : P }[keyof paths]
type Body<O> = O extends { requestBody: { content: { 'application/json': infer B } } } ? B : never
type WritePathParams<O> = O extends { parameters: { path: infer R } } ? R : never
type WriteResult<O> = O extends { responses: { 200: { content: { 'application/json': infer R } } } } ? R
  : O extends { responses: { 201: { content: { 'application/json': infer R } } } } ? R : undefined

/** A browser write: same-origin cookies plus the CSRF header the API requires for browser sessions. */
export async function send<M extends WriteMethod, P extends WritePath<M>, O = WriteOperation<P, M>>(method: M, path: P, options: {
  signal: AbortSignal
} & ([Body<O>] extends [never] ? { body?: never } : { body: Body<O> })
  & ([WritePathParams<O>] extends [never] ? { path?: never } : { path: WritePathParams<O> })): Promise<WriteResult<O>> {
  let url: string = path
  for (const [name, value] of Object.entries((options.path ?? {}) as Record<string, unknown>)) url = url.replace(`{${name}}`, encodeURIComponent(String(value)))
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Orpheus-CSRF': '1' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(url, {
    method: method.toUpperCase(), credentials: 'same-origin', signal: options.signal, headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  // A rejected write (403 invalid origin) must not revoke read access; an expired session still asks to sign in.
  await checkResponse(response, response.status === 401)
  return (response.status === 204 ? undefined : await response.json()) as WriteResult<O>
}

export async function logout(signal: AbortSignal) {
  const response = await fetch('/auth/logout', {
    method: 'POST', credentials: 'same-origin', signal, headers: { 'X-Orpheus-CSRF': '1' },
  })
  await checkResponse(response, false)
}
