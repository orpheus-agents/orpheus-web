<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const text = defineModel<string>({ required: true })
const props = defineProps<{ label: string; error?: string }>()
const id = useId()
const root = ref<HTMLElement>()
const attributes = new Compartment()
let editor: EditorView | undefined
const contentAttributes = () => EditorView.contentAttributes.of({
  'aria-labelledby': `${id}-label`, 'aria-describedby': `${id}-error`,
  'aria-invalid': String(!!props.error), 'aria-multiline': 'true',
  spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off',
})
const highlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.propertyName, class: 'text-accent-ink' },
  { tag: tags.string, class: 'text-ink' },
  { tag: tags.number, class: 'text-danger-ink' },
  { tag: [tags.bool, tags.null], class: 'text-accent-ink' },
]))
function state(value: string) {
  return EditorState.create({
    doc: value,
    extensions: [
      json(), highlighting, history(), keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping, attributes.of(contentAttributes()),
      EditorView.theme({
        '&': { height: '18rem', minHeight: '6rem', resize: 'vertical', overflow: 'hidden' },
        '&.cm-focused': { outline: '2px solid var(--color-ink)' },
        '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-code)', fontSize: '12px', lineHeight: '20px' },
        '.cm-content': { padding: '8px 12px', caretColor: 'var(--color-ink)' },
        '.cm-line': { padding: '0' },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) text.value = update.state.sliceDoc()
      }),
    ],
  })
}
onMounted(() => { editor = new EditorView({ parent: root.value, state: state(text.value) }) })
watch(text, (value) => {
  // An explicit reload replaces both the document and its undo history. Never parse/stringify JSON.
  if (editor && value !== editor.state.sliceDoc()) editor.setState(state(value))
})
watch(() => [props.label, props.error], () => { editor?.dispatch({ effects: attributes.reconfigure(contentAttributes()) }) })
onBeforeUnmount(() => { editor?.destroy(); editor = undefined })
</script>
<template>
  <div class="min-w-0">
    <span :id="`${id}-label`" class="field-label" @click="editor?.focus()">{{ label }}</span>
    <div ref="root" class="json-field" />
    <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
  </div>
</template>
