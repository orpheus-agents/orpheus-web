import { expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { router } from './index'

const at = (name: string, sid?: string) => ({ name, params: sid ? { sid } : {}, query: {}, fullPath: '' }) as unknown as RouteLocationNormalized
const behaviour = router.options.scrollBehavior!

it('keeps the scroll position within a screen and starts a new screen at the top', () => {
  expect(behaviour(at('sessions'), at('sessions'), null)).toBe(false)
  expect(behaviour(at('run', 'a'), at('session', 'a'), null)).toBe(false)
  expect(behaviour(at('session', 'b'), at('session', 'a'), null)).toEqual({ top: 0 })
  expect(behaviour(at('sessions'), at('analytics'), null)).toEqual({ top: 0 })
  expect(behaviour(at('analytics'), at('sessions'), { left: 0, top: 120 })).toEqual({ left: 0, top: 120 })
})
