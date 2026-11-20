import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '../test/i18n'
import ServiceList from './ServiceList.vue'
import EnvironmentNames from './EnvironmentNames.vue'

it.each([
  ['en', 'Not selected', 'No data', 'None supplied'],
  ['ru', 'Не выбраны', 'Нет данных', 'Не переданы'],
] as const)('shows stored selections and confirmed environment names in %s', async (locale, empty, unknown, none) => {
  const global = { plugins: [createTestI18n(locale)] }
  const selection = mount(ServiceList, { props: { services: [] }, global })
  expect(selection.text()).toBe(empty)
  await selection.setProps({ services: ['removed-service', 'registry'] })
  expect(selection.findAll('li').map(item => item.text())).toEqual(['removed-service,', 'registry'])
  const env = mount(EnvironmentNames, { props: { names: null }, global })
  expect(env.text()).toBe(unknown)
  await env.setProps({ names: [] })
  expect(env.text()).toBe(none)
  await env.setProps({ names: ['REGISTRY_HOST', 'REGISTRY_TOKEN'] })
  expect(env.text()).toBe('REGISTRY_HOST, REGISTRY_TOKEN')
})
