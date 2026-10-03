import { afterEach, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '../test/i18n'
import ServiceList from './ServiceList.vue'

let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount() })

it.each([
  { locale: 'en', title: 'Services', empty: 'Not selected', environment: 'Environment variables' },
  { locale: 'ru', title: 'Сервисы', empty: 'Не выбраны', environment: 'Переменные окружения' },
] as const)('renders service snapshots and the empty state in $locale', async ({ locale, title, empty, environment }) => {
  wrapper = mount(ServiceList, {
    props: { services: [], hint: 'Scope description' },
    global: { plugins: [createTestI18n(locale)] },
  })
  expect(wrapper.text()).toContain(title)
  expect(wrapper.text()).toContain(empty)
  expect(wrapper.text()).toContain('Scope description')
  expect(wrapper.find('details').exists()).toBe(false)
  await wrapper.setProps({ services: [
    { code: 'removed-service', name: '<b>Saved name</b>', description: '<script>Saved description</script>', env_from: ['TOKEN', 'HOST'] },
    { code: 'second', name: 'Another service', description: 'Another description', env_from: ['TOKEN'] },
  ] })
  expect(wrapper.text()).not.toContain(empty)
  expect(wrapper.text()).toContain('<b>Saved name</b>')
  expect(wrapper.text()).toContain('<script>Saved description</script>')
  expect(wrapper.find('b, script').exists()).toBe(false)
  expect(wrapper.findAll('summary').map((item) => item.text())).toEqual([environment, environment])
  expect(wrapper.findAll('details[open]')).toHaveLength(0)
  expect(wrapper.findAll('code').map((item) => item.text())).toEqual(['TOKEN', 'HOST', 'TOKEN'])
})
