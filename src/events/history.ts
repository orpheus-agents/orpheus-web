import {
  MessageEventType,
  MessageItemType,
  MessageRole,
  ToolCallEventType,
  ToolItemType,
  type Event,
  type HistoryPage,
} from '../api/generated'

export type HistoryItem = HistoryPage['items'][number]
export class HistorySnapshotExpired extends Error {
  constructor() { super('History snapshot needs renewal') }
}
const SHELLS = /(^|\/)(ba|z|da|fi|k)?sh$/
/** The command line of a shell-like tool call, if its input carries one: `{command}`, `{cmd}` or argv. */
export function commandLine(input: unknown): string | null {
  const value = Array.isArray(input) ? input : input && typeof input === 'object' ? ((input as Record<string, unknown>).command ?? (input as Record<string, unknown>).cmd) : null
  if (typeof value === 'string') return value
  if (!Array.isArray(value) || !value.length || !value.every((part) => typeof part === 'string')) return null
  const [shell, flag, script] = value as string[]
  if (value.length === 3 && SHELLS.test(shell) && /^-l?c$/.test(flag)) return script
  return value.map((part) => (/[\s"']/.test(part) ? JSON.stringify(part) : part)).join(' ')
}
export function entity(item: HistoryItem) {
  return item.type === MessageItemType.message ? item.message : item.tool_call
}
function compareItems(a: HistoryItem, b: HistoryItem, startSequence: bigint | null) {
  const x = entity(a),
    y = entity(b)
  // Codex injects earlier batch inputs outside the native turn, so they have
  // no position. The API places those user messages before the turn's input.
  const group = (item: HistoryItem) => {
    const value = entity(item)
    if (item.type === MessageItemType.message && item.message.role === MessageRole.user &&
      !value.position && startSequence !== null && BigInt(value.registered_sequence) < startSequence) return 0
    return value.position ? 1 : 2
  }
  const order = group(a) - group(b)
  if (order) return order
  if (x.position && y.position) {
    const position = x.position.run_number - y.position.run_number || x.position.item_index - y.position.item_index
    if (position) return position
  }
  const delta = BigInt(x.registered_sequence) - BigInt(y.registered_sequence)
  return delta < 0n ? -1 : delta > 0n ? 1 : 0
}

/** A bounded window of a single run; late snapshot pages never replace newer events. */
export class HistoryWindow {
  cursor = '0'
  next: string | null = null
  trimmed = false
  readonly items = new Map<string, HistoryItem>()
  private updates = new Map<string, HistoryItem>()
  private floor: HistoryItem | undefined
  private startSequence: bigint | null = null
  constructor(
    readonly sid: string,
    readonly rid: string,
    private readonly limit = 200,
  ) {}
  get sorted() {
    return [...this.items.values()].sort((a, b) => compareItems(a, b, this.startSequence))
  }
  page(page: HistoryPage, first = false) {
    if (first) this.cursor = page.event_cursor
    this.next = page.next_cursor
    for (const item of page.items) {
      const id = entity(item).id
      this.put(this.updates.get(id) ?? this.items.get(id) ?? item)
    }
    if (!this.next) {
      for (const item of this.updates.values()) this.put(item)
      this.updates.clear()
    }
    this.bound()
  }
  event(event: Event) {
    if (event.session_id !== this.sid || BigInt(event.id) <= BigInt(this.cursor)) return false
    let item: HistoryItem | undefined
    if (event.type === MessageEventType.message_updated && event.data.run_id === this.rid)
      item = { type: MessageItemType.message, message: event.data }
    if (event.type === ToolCallEventType.tool_call_updated && event.data.run_id === this.rid)
      item = { type: ToolItemType.tool_call, tool_call: event.data }
    if (item) {
      const id = entity(item).id
      this.observeStart(item)
      if (this.floor && compareItems(item, this.floor, this.startSequence) < 0) {
        this.items.delete(id)
        this.updates.delete(id)
      } else {
        if (this.next) this.updates.set(id, item)
        if (!this.next || this.items.has(id)) this.items.set(id, item)
      }
      if (this.updates.size > this.limit * 2) throw new HistorySnapshotExpired()
      this.bound()
    }
    this.cursor = event.id
    return true
  }
  private put(item: HistoryItem) {
    this.observeStart(item)
    const id = entity(item).id
    if (this.floor && compareItems(item, this.floor, this.startSequence) < 0) this.items.delete(id)
    else this.items.set(id, item)
  }
  private observeStart(item: HistoryItem) {
    if (item.type !== MessageItemType.message || item.message.role !== MessageRole.user || item.message.position?.item_index !== 0) return
    const sequence = BigInt(item.message.registered_sequence)
    if (this.startSequence === null || sequence < this.startSequence) this.startSequence = sequence
  }
  private bound() {
    const sorted = this.sorted
    if (sorted.length <= this.limit) return
    const removed = sorted.slice(0, sorted.length - this.limit)
    for (const item of removed) {
      this.items.delete(entity(item).id)
      this.updates.delete(entity(item).id)
    }
    this.floor = sorted[sorted.length - this.limit]
    this.trimmed = true
  }
}
