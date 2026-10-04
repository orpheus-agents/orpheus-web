import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestI18n } from '../test/i18n'
import ServiceList from './ServiceList.vue'

let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount() })

it.each([
  { locale: 'en', empty: 'Not selected', environment: 'Environment variables' },
  { locale: 'ru', empty: 'Не выбраны', environment: 'Переменные окружения' },
] as const)('lists service snapshots by name and shows their details on demand in $locale', async ({ locale, empty, environment }) => {
  wrapper = mount(ServiceList, { props: { services: [] }, global: { plugins: [createTestI18n(locale)] }, attachTo: document.body })
  expect(wrapper.text()).toBe(empty)
  expect(wrapper.find('ul').exists()).toBe(false)
  await wrapper.setProps({ services: [
    { code: 'removed-service', name: '<b>Saved name</b>', description: '<script>Saved description</script>', env_from: ['TOKEN', 'HOST'] },
    { code: 'second', name: 'Another service', description: 'Another description', env_from: ['TOKEN'] },
  ] })
  expect(wrapper.findAll('li').map((item) => item.text())).toEqual(['<b>Saved name</b>,', 'Another service'])
  expect(wrapper.find('b, script').exists()).toBe(false)
  // Descriptions and ENV names take no room in the card until a name is focused or hovered.
  expect(document.body.textContent).not.toContain('Saved description')
  expect(document.body.textContent).not.toContain('TOKEN')
  const [first, second] = wrapper.findAll('button')
  await first!.trigger('focus')
  await flushPromises()
  const tooltip = document.querySelector('[role=tooltip]')!
  expect(tooltip.querySelector('p')!.textContent).toBe('<script>Saved description</script>')
  expect(tooltip.querySelector('script')).toBeNull()
  expect(tooltip.querySelector('ul')!.getAttribute('aria-label')).toBe(environment)
  expect([...tooltip.querySelectorAll('li')].map((item) => item.textContent)).toEqual(['TOKEN', 'HOST'])
  await second!.trigger('mouseenter')
  await flushPromises()
  expect(document.querySelectorAll('[role=tooltip]')).toHaveLength(1)
  expect(document.querySelector('[role=tooltip] p')!.textContent).toBe('Another description')
  expect([...document.querySelectorAll('[role=tooltip] li')].map((item) => item.textContent)).toEqual(['TOKEN'])
})
