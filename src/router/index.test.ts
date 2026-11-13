import { beforeEach, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { navigation, router, sectionLinks } from './index'

const at = (name: string, sid?: string) => ({ name, params: sid ? { sid } : {}, query: {}, fullPath: '' }) as unknown as RouteLocationNormalized
const behaviour = router.options.scrollBehavior!
const sid = '11111111-1111-4111-8111-111111111111'
// jsdom does not implement scrolling, which the router performs after each navigation.
beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined) })

it('keeps the scroll position within a screen and starts a new screen at the top', () => {
  expect(behaviour(at('sessions'), at('sessions'), null)).toBe(false)
  expect(behaviour(at('run', 'a'), at('session', 'a'), null)).toBe(false)
  expect(behaviour(at('session', 'b'), at('session', 'a'), null)).toEqual({ top: 0 })
  expect(behaviour(at('sessions'), at('analytics'), null)).toEqual({ top: 0 })
  expect(behaviour(at('analytics'), at('sessions'), { left: 0, top: 120 })).toEqual({ left: 0, top: 120 })
})

it('builds the header and section menus from the routes', () => {
  expect(navigation).toEqual([
    { name: 'analytics', children: [] },
    { name: 'sessions', children: [] },
    { name: 'settings', children: ['limits', 'templates'] },
  ])
})

it('opens limits under settings and drops the old address', async () => {
  await router.push('/settings')
  expect(router.currentRoute.value.fullPath).toBe('/settings/limits')
  expect(router.currentRoute.value.meta).toMatchObject({ section: 'settings', subsection: 'limits' })
  expect(router.resolve('/limits').name).toBe('missing')
})

it('remembers the last address of a menu item and of its section, not of a detail screen', async () => {
  await router.push('/settings/limits?view=all')
  expect(sectionLinks.limits).toBe('/settings/limits?view=all')
  expect(sectionLinks.settings).toBe('/settings/limits?view=all')
  await router.push('/sessions?activity=inactive')
  await router.push(`/sessions/${sid}`)
  expect(sectionLinks.sessions).toBe('/sessions?activity=inactive')
  expect(sectionLinks.settings).toBe('/settings/limits?view=all')
})

it('keeps template cards and the new template form under the templates menu item', async () => {
  await router.push('/settings/templates?active=all')
  expect(sectionLinks.templates).toBe('/settings/templates?active=all')
  expect(sectionLinks.settings).toBe('/settings/templates?active=all')
  await router.push('/settings/templates/new')
  expect(router.currentRoute.value.name).toBe('newTemplate')
  expect(router.currentRoute.value.meta).toMatchObject({ section: 'settings', subsection: 'templates' })
  await router.push(`/settings/templates/${sid}`)
  expect(router.currentRoute.value).toMatchObject({ name: 'template', params: { id: sid } })
  expect(sectionLinks.templates).toBe('/settings/templates?active=all')
})

it('scrolls to the top when another template card opens', () => {
  const card = (id: string) => ({ name: 'template', params: { id }, query: {}, fullPath: '' }) as unknown as RouteLocationNormalized
  expect(behaviour(card('b'), card('a'), null)).toEqual({ top: 0 })
  expect(behaviour(card('a'), card('a'), null)).toBe(false)
})

it('titles a page with reverse breadcrumbs through its section', async () => {
  await router.push('/settings/templates/new')
  expect(document.title).toBe('New template / Templates / Settings / Orpheus')
  await router.push(`/settings/templates/${sid}`)
  expect(document.title).toBe('11111111 / Templates / Settings / Orpheus')
  await router.push('/settings/limits')
  expect(document.title).toBe('Limits / Settings / Orpheus')
  await router.push(`/sessions/${sid}`)
  expect(document.title).toBe('11111111 / Sessions / Orpheus')
  await router.push('/limits')
  expect(document.title).toBe('Page not found / Orpheus')
})
