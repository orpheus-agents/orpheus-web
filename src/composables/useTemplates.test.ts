import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { ApiError, get } from '../api/client'
import type { operations } from '../api/generated'
import { template } from '../test/fixtures'
import { templateList, useTemplates } from './useTemplates'

vi.mock('../api/client', async (original) => ({ ...await original<typeof import('../api/client')>(), get: vi.fn() }))
let wrapper: ReturnType<typeof mount>
let state: ReturnType<typeof useTemplates>
const screen = defineComponent({ setup() { state = useTemplates(); return () => null } })
async function start(url: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/settings/templates', name: 'templates', component: screen },
    { path: '/elsewhere', name: 'elsewhere', component: { render: () => null } },
  ] })
  await router.push(url)
  await flushPromises()
  wrapper = mount(defineComponent({ render: () => h(RouterView) }), { global: { plugins: [router] } })
  await flushPromises()
  return router
}
type Query = NonNullable<operations['get_templates']['parameters']['query']>
const query = () => vi.mocked(get).mock.calls.at(-1)![1].query as Query
const page = (prev: string | null, next: string | null) => ({ items: [template()], prev_cursor: prev, next_cursor: next })
beforeEach(() => {
  Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  vi.mocked(get).mockResolvedValue(page(null, 'n1'))
})
afterEach(() => { wrapper?.unmount(); vi.useRealTimers(); vi.resetAllMocks() })

it('reads active templates by default and keeps every filter in the URL', () => {
  expect(templateList({})).toMatchObject({ activity: 'true', limit: 50, page: 1, request: { active: true, limit: 50 } })
  expect(templateList({ active: 'all', name_contains: 'Codex', limit: '100', cursor: 'c', page: '3' })).toEqual({
    activity: 'all', search: 'Codex', limit: 100, cursor: 'c', page: 3,
    request: { active: undefined, name_contains: 'Codex', limit: 100, cursor: 'c' },
  })
  expect(templateList({ active: 'false', limit: '7', page: '4' })).toMatchObject({ limit: 50, page: 1, request: { active: false } })
  expect(templateList({ name_contains: '   ', cursor: 'c', page: '-2' })).toMatchObject({ page: 1, request: { name_contains: undefined } })
})

it('restarts from the first page when a filter or the page size changes', async () => {
  const router = await start('/settings/templates?active=all&name_contains=co&cursor=c&page=4')
  expect(query()).toEqual({ active: undefined, name_contains: 'co', limit: 50, cursor: 'c' })
  vi.mocked(get).mockImplementation(() => new Promise(() => undefined))
  await state.changeActivity('false')
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({ active: 'false', name_contains: 'co' })
  const slow = vi.mocked(get).mock.calls.at(-1)![1].signal
  await state.changeLimit(200)
  await flushPromises()
  expect(slow.aborted).toBe(true)
  expect(router.currentRoute.value.query).toEqual({ active: 'false', name_contains: 'co', limit: '200' })
  state.filters.search = 'heavy'
  await state.search()
  await flushPromises()
  expect(query()).toEqual({ active: false, name_contains: 'heavy', limit: 200, cursor: undefined })
  await state.changeActivity('true')
  expect(router.currentRoute.value.query).toEqual({ name_contains: 'heavy', limit: '200' })
})

it('counts pages forward and back, and resets the counter where the catalog begins without reloading', async () => {
  const router = await start('/settings/templates')
  await state.next('n1')
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({ cursor: 'n1', page: '2' })
  vi.mocked(get).mockResolvedValue(page('p2', 'n2'))
  await state.next('n2')
  await flushPromises()
  expect(state.state.value.page).toBe(3)
  // Records were deleted before this page: going back reaches the start one step early.
  vi.mocked(get).mockResolvedValue(page(null, 'n1'))
  await state.previous('p2')
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({ cursor: 'p2' })
  expect(state.state.value.page).toBe(1)
  expect(get).toHaveBeenCalledTimes(4)
  await state.previous('p1')
  expect(router.currentRoute.value.query).toEqual({ cursor: 'p1' })
})

it('reports an outdated cursor and opens the first page with the same filters on request', async () => {
  vi.mocked(get).mockRejectedValue(new ApiError(422, { code: 'invalid_cursor', message: 'Invalid cursor', details: [], phase: null }))
  const router = await start('/settings/templates?active=false&limit=25&cursor=old&page=5')
  expect(state.invalidCursor.value).toBe(true)
  expect(router.currentRoute.value.query.cursor).toBe('old')
  vi.mocked(get).mockResolvedValue(page(null, null))
  await state.firstPage()
  await flushPromises()
  expect(router.currentRoute.value.query).toEqual({ active: 'false', limit: '25' })
  expect(state.invalidCursor.value).toBe(false)
})

it('stops loading when the list is left', async () => {
  const router = await start('/settings/templates')
  const signal = vi.mocked(get).mock.calls.at(-1)![1].signal
  vi.useFakeTimers()
  await router.push('/elsewhere')
  await vi.advanceTimersByTimeAsync(60_000)
  expect(get).toHaveBeenCalledTimes(1)
  expect(signal.aborted).toBe(true)
})
