import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { useCatalogOptions } from './useCatalogOptions'

let wrapper: ReturnType<typeof mount>
afterEach(() => { wrapper?.unmount(); vi.useRealTimers() })
it('cancels an old search and never mixes its late result with the new pages', async () => {
  vi.useFakeTimers()
  let complete!: (value: { items: string[]; next_cursor: null }) => void
  const request = vi.fn().mockImplementationOnce(() => new Promise((resolve) => { complete = resolve }))
    .mockResolvedValueOnce({ items: ['new'], next_cursor: 'next' }).mockResolvedValueOnce({ items: ['more'], next_cursor: null })
  let options!: ReturnType<typeof useCatalogOptions<string>>
  wrapper = mount(defineComponent({ setup() { options = useCatalogOptions(request); return () => null } }))
  const oldSignal = request.mock.calls[0][0] as AbortSignal
  options.search('new')
  expect(oldSignal.aborted).toBe(true)
  await vi.advanceTimersByTimeAsync(250)
  complete({ items: ['old'], next_cursor: null }); await flushPromises()
  expect(options.items.value).toEqual(['new'])
  await options.more()
  expect(request).toHaveBeenLastCalledWith(expect.any(AbortSignal), 'new', 'next')
  expect(options.items.value).toEqual(['new', 'more'])
  expect(options.next.value).toBeNull()
})
it('retries the same next page after failure, without dropping existing choices', async () => {
  const request = vi.fn().mockResolvedValueOnce({ items: ['first'], next_cursor: 'next' })
    .mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ items: ['second'], next_cursor: null })
  let options!: ReturnType<typeof useCatalogOptions<string>>
  wrapper = mount(defineComponent({ setup() { options = useCatalogOptions(request); return () => null } }))
  await flushPromises(); await options.more()
  expect(options.items.value).toEqual(['first'])
  expect(options.moreError.value).toBeInstanceOf(Error)
  expect(options.next.value).toBe('next')
  await options.more()
  expect(options.items.value).toEqual(['first', 'second'])
  expect(options.moreError.value).toBeNull()
})
