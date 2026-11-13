import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AppHeader from './AppHeader.vue'
import { router } from '../router'

let wrapper: ReturnType<typeof mount>
// jsdom does not implement scrolling, which the router performs after each navigation.
beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined) })
afterEach(() => wrapper?.unmount())

async function header(path: string, ready = true) {
  await router.push(path)
  await flushPromises()
  wrapper = mount(AppHeader, { props: { session: null, ready, pending: false }, global: { plugins: [router] } })
  return wrapper
}
const menu = (label: string) => wrapper.find(`nav[aria-label="${label}"]`)

it('selects the section of the current screen and shows its menu', async () => {
  await header('/settings/limits?view=all')
  const items = menu('Main navigation').findAll('a')
  expect(items.map((item) => item.text())).toEqual(['Analytics', 'Sessions', 'Settings'])
  expect(items[2].classes()).toContain('selected')
  expect(items[2].attributes('href')).toBe('/settings/limits?view=all')
  const sub = menu('Settings').findAll('a')
  expect(sub.map((item) => item.text())).toEqual(['Limits', 'Templates'])
  expect(sub[1].classes()).not.toContain('selected')
  expect(sub[1].attributes('aria-current')).toBeUndefined()
  expect(sub[0].classes()).toContain('selected')
  expect(sub[0].attributes('aria-current')).toBe('page')
  expect(sub[0].attributes('href')).toBe('/settings/limits?view=all')
})

it('keeps the menu item selected on a template card', async () => {
  await header('/settings/templates/11111111-1111-4111-8111-111111111111')
  const sub = menu('Settings').findAll('a')
  expect(sub.filter((item) => item.classes('selected')).map((item) => item.text())).toEqual(['Templates'])
  expect(sub[1].attributes('aria-current')).toBe('page')
})

it('keeps the section selected on a detail screen and hides the menu of a section without items', async () => {
  await header('/sessions/11111111-1111-4111-8111-111111111111')
  const items = menu('Main navigation').findAll('a')
  expect(items.filter((item) => item.classes('selected')).map((item) => item.text())).toEqual(['Sessions'])
  expect(wrapper.findAll('nav')).toHaveLength(1)
})

it('shows no navigation until the session is ready', async () => {
  await header('/settings/limits', false)
  expect(wrapper.find('nav').exists()).toBe(false)
})
