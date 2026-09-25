import { expect, it } from 'vitest'
import * as api from '../api/generated'
import en from './locales/en.json'
import ru from './locales/ru.json'

it('covers generated enum values used by dynamic translation keys in both languages', () => {
  const groups = [
    ['status', [api.RunStatus, api.HookResultStatus, api.ToolCallStatus, api.AccountLimitItemState, api.SandboxStateState, api.RunAgent_statusAnyOf0]],
    ['phase', [api.RunPhaseAnyOf0, api.SessionPhaseAnyOf0, api.ErrorPhaseAnyOf0]],
    ['observation', [api.RunObservationAnyOf0]],
    ['history', [api.MessageRole, api.MessageKindAnyOf0]],
    ['delivery', [api.MessageDelivery_statusAnyOf0]],
    ['completeness', [api.ToolCallOutput_completeness, api.HookResultOutput_completeness]],
    ['stop', [api.RunStop_reasonAnyOf0]],
    ['stopMethod', [api.RunStop_methodAnyOf0]],
    ['limits.errors', [api.AccountLimitItemError_codeAnyOf0]],
  ] as const
  for (const messages of [en, ru]) {
    for (const [prefix, enums] of groups) {
      for (const value of enums.flatMap(Object.values)) {
        const key = `${prefix}.${value}`
        const label = key.split('.').reduce<unknown>((object, part) => (object as Record<string, unknown>)[part], messages)
        expect(label, key).toBeTypeOf('string')
      }
    }
  }
})
