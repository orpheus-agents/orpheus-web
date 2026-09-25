import { expect, it } from 'vitest'
import { HistoryWindow, commandLine, entity } from './history'
import { MessageEventType, MessageItemType, MessageRole, type MessageEvent, type HistoryPage } from '../api/generated'
import { message, rid, sid, timestamp } from '../test/fixtures'
const event = (id: string, text: string, objectId = 'message'): MessageEvent => ({
  id,
  type: MessageEventType.message_updated,
  session_id: sid,
  created_at: timestamp,
  data: message({
    id: objectId,
    text,
    registered_sequence: id,
    position: { run_number: 3, item_index: Number(id.slice(-2)) },
  }),
})
it('late snapshot pages cannot overwrite events; duplicates and unrelated runs are ignored', () => {
  const state = new HistoryWindow(sid, rid)
  state.page({ items: [], next_cursor: 'page2', event_cursor: '9007199254740992' }, true)
  state.event(event('9007199254740994', 'live'))
  state.event(event('9007199254740993', 'old duplicate'))
  const page: HistoryPage = {
    items: [{ type: MessageItemType.message, message: message({ id: 'message', text: 'old snapshot' }) }],
    event_cursor: '9007199254740992',
    next_cursor: null,
  }
  state.page(page)
  expect(state.sorted[0]).toMatchObject({ message: { text: 'live' } })
  expect(state.cursor).toBe('9007199254740994')
  state.event({ ...event('9007199254740995', 'other'), data: message({ run_id: 'another' }) })
  expect(state.items.size).toBe(1)
  expect(state.cursor).toBe('9007199254740995')
})
it('orders positioned objects before unknown positions and compares decimal sequences exactly', () => {
  const state = new HistoryWindow(sid, rid)
  const a = message({ id: 'a', position: null, registered_sequence: '9007199254740993' })
  const b = message({ id: 'b', position: null, registered_sequence: '9007199254740992' })
  const c = message({ id: 'c', registered_sequence: '9007199254740994' })
  state.page(
    {
      items: [a, b, c].map((message) => ({ type: MessageItemType.message, message })),
      event_cursor: '0',
      next_cursor: null,
    },
    true,
  )
  expect(state.sorted.map((item) => entity(item).id)).toEqual(['c', 'b', 'a'])
})
it('keeps injected batch input before the turn and leaves later unpositioned steer after it', () => {
  const state = new HistoryWindow(sid, rid)
  const injected = message({ id: 'scrumer', role: MessageRole.user, position: null, registered_sequence: '42' })
  const start = message({ id: 'question', role: MessageRole.user, position: { run_number: 3, item_index: 0 }, registered_sequence: '43' })
  const progress = message({ id: 'progress', position: { run_number: 3, item_index: 2 }, registered_sequence: '57' })
  const steer = message({ id: 'steer', role: MessageRole.user, position: null, registered_sequence: '58' })
  state.page({
    items: [injected, start, progress, steer].map((message) => ({ type: MessageItemType.message, message })),
    event_cursor: '59',
    next_cursor: null,
  }, true)
  expect(state.sorted.map((item) => entity(item).id)).toEqual(['scrumer', 'question', 'progress', 'steer'])
  state.event(event('60', 'answer', 'answer'))
  expect(state.sorted.map((item) => entity(item).id)).toEqual(['scrumer', 'question', 'progress', 'answer', 'steer'])
})
it('bounds the window and does not reinsert evicted older items', () => {
  const state = new HistoryWindow(sid, rid, 3)
  for (let i = 1; i <= 10; i++) state.event(event(String(i), String(i), `item-${i}`))
  expect(state.items.size).toBe(3)
  expect(state.trimmed).toBe(true)
  state.event({
    ...event('11', 'old', 'item-1'),
    data: message({ id: 'item-1', position: { run_number: 3, item_index: 1 } }),
  })
  expect(state.items.has('item-1')).toBe(false)
})

it('bounds a long paginated run while retaining live updates to not-yet-loaded items', () => {
  const state = new HistoryWindow(sid, rid)
  function page(start: number, next: string | null): HistoryPage {
    return { event_cursor: '300', next_cursor: next, items: Array.from({ length: 50 }, (_, offset) => ({
      type: MessageItemType.message,
      message: message({ id: `message-${start + offset}`, registered_sequence: String(start + offset + 1), position: { run_number: 3, item_index: start + offset } }),
    })) }
  }
  state.page(page(0, '50'), true)
  state.event({ ...event('301', 'fresh late-page item'), data: message({ id: 'message-240', text: 'fresh', position: { run_number: 3, item_index: 240 } }) })
  for (const start of [50, 100, 150, 200]) state.page(page(start, start === 200 ? null : String(start + 50)))
  expect(state.sorted).toHaveLength(200)
  expect(entity(state.sorted[0]).id).toBe('message-50')
  expect(state.items.get('message-240')).toMatchObject({ message: { text: 'fresh' } })
  expect(state.trimmed).toBe(true)
})

it('evicts an initially unpositioned item when its resolved position precedes the displayed window', () => {
  const state = new HistoryWindow(sid, rid, 3)
  state.page({ items: [{ type: MessageItemType.message, message: message({ id: 'pending', position: null }) }], next_cursor: null, event_cursor: '0' }, true)
  for (let i = 1; i <= 5; i++) state.event(event(String(i), String(i), `item-${i}`))
  expect(state.items.has('pending')).toBe(true)
  state.event({ ...event('6', 'resolved'), data: message({ id: 'pending', position: { run_number: 3, item_index: 0 } }) })
  expect(state.items.has('pending')).toBe(false)
  expect(state.cursor).toBe('6')
})

it('extracts a command line from string, object and argv tool inputs', () => {
  expect(commandLine({ command: 'npm test' })).toBe('npm test')
  expect(commandLine({ cmd: ['git', 'log', '--oneline'] })).toBe('git log --oneline')
  expect(commandLine(['/bin/bash', '-lc', 'npm test && git status'])).toBe('npm test && git status')
  expect(commandLine(['sh', '-c', 'ls'])).toBe('ls')
  expect(commandLine(['rg', '-n', 'advisory lock', 'internal/'])).toBe('rg -n "advisory lock" internal/')
  expect(commandLine({ path: '/tmp' })).toBeNull()
  expect(commandLine('plain')).toBeNull()
  expect(commandLine([1, 2])).toBeNull()
})
