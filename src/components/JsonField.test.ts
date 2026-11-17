import { afterEach, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { EditorView } from '@codemirror/view'
import { undo } from '@codemirror/commands'
import JsonField from './JsonField.vue'

let wrapper: ReturnType<typeof mount>
afterEach(() => wrapper?.unmount())
it('edits raw JSON without coercing large numbers and supports undo', () => {
  const text = '{"token":"fake","unknown":9007199254740993123}'
  wrapper = mount(JsonField, { props: { modelValue: text, label: 'JSON' } })
  const editor = EditorView.findFromDOM(wrapper.get('.cm-editor').element as HTMLElement)!
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  const start = text.indexOf('fake')
  editor.dispatch({ changes: { from: start, to: start + 4, insert: 'edited' } })
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([text.replace('fake', 'edited')])
  undo(editor)
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([text])
})
it('replaces the draft and undo history on reload, and exposes the label and validation error', async () => {
  wrapper = mount(JsonField, { props: { modelValue: '{}', label: 'JSON' } })
  const editor = EditorView.findFromDOM(wrapper.get('.cm-editor').element as HTMLElement)!
  editor.dispatch({ changes: { from: 1, insert: '"draft":true' } })
  await wrapper.setProps({ modelValue: '{"latest":null}', error: 'Invalid JSON' })
  expect(editor.state.sliceDoc()).toBe('{"latest":null}')
  expect(undo(editor)).toBe(false)
  const input = wrapper.get('[role="textbox"]')
  expect(input.attributes('aria-invalid')).toBe('true')
  expect(wrapper.get(`[id="${input.attributes('aria-labelledby')}"]`).text()).toBe('JSON')
  expect(wrapper.get(`[id="${input.attributes('aria-describedby')}"]`).text()).toBe('Invalid JSON')
})
