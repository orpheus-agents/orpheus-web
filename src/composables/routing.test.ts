import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, toRef } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { useAnalytics } from './useAnalytics'
import { useSessions } from './useSessions'
import { useSession } from './useSession'
import { get } from '../api/client'
import { session, run, overview, sid } from '../test/fixtures'

vi.mock('../api/client', () => ({ get: vi.fn() }))
let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount(); vi.resetAllMocks() })
it('does not request the departing section with parameters from the next route', async () => {
  const calls: { path: string; sid?: string; signal: AbortSignal }[] = []
  vi.mocked(get).mockImplementation(async (path, options) => {
    calls.push({ path, sid: options.path && 'sid' in options.path ? options.path.sid : undefined, signal: options.signal })
    if (path.endsWith('/overview')) return overview()
    if (path.endsWith('/{rid}')) return run()
    if (path.endsWith('/{sid}')) return session()
    return { items: [], next_cursor: null }
  })
  const analytics = defineComponent({ setup() { useAnalytics(); return () => null } })
  const sessions = defineComponent({ setup() { useSessions(); return () => null } })
  const detail = defineComponent({ props: { sid: { type: String, required: true }, rid: { type: String, default: undefined } },
    setup(props) { useSession(toRef(props, 'sid'), toRef(props, 'rid')); return () => null },
  })
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/', name: 'analytics', component: analytics },
    { path: '/sessions', name: 'sessions', component: sessions },
    { path: '/sessions/:sid', name: 'session', props: true, component: detail },
  ] })
  await router.push('/?namespace=analytics')
  await flushPromises()
  wrapper = mount(defineComponent({ render: () => h(RouterView) }), { global: { plugins: [router] } })
  await flushPromises()
  await router.push('/sessions?namespace=sessions')
  await flushPromises()
  await router.push(`/sessions/${sid}`)
  await flushPromises()
  await router.push('/?namespace=other')
  await flushPromises()
  expect(calls.map(({ path }) => path)).toEqual([
    '/api/v1/analytics/overview', '/api/v1/sessions', '/api/v1/sessions/{sid}',
    '/api/v1/sessions/{sid}/runs/{rid}', '/api/v1/analytics/overview',
  ])
  expect(calls[2].sid).toBe(sid)
  expect(calls.slice(0, -1).every(({ signal }) => signal.aborted)).toBe(true)
})
