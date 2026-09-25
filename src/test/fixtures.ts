import { AccountLimitItemState, AnalyticsOverviewBucket, RunStatus, SandboxStateState, MessageRole, MessageItemType, ToolItemType, ToolCallStatus, ToolCallOutput_completeness, TextResultType, type Session, type Run, type AnalyticsOverview, type StatusCounts, type HistoryPage, type Message, type AccountLimits } from '../api/generated'

export const sid = '11111111-1111-4111-8111-111111111111'
export const rid = '22222222-2222-4222-8222-222222222222'
export const timestamp = '2026-09-25T06:00:00Z'
export function counts(overrides: Partial<StatusCounts> = {}): StatusCounts {
  return { accepted: 0, starting: 0, running: 0, cancelling: 0, finalizing: 0, completed: 0, failed: 0, cancelled: 0, ...overrides }
}
export function overview(): AnalyticsOverview {
  return { as_of: timestamp, from: '2026-09-24T06:00:00Z', to: timestamp, bucket: AnalyticsOverviewBucket.hour, timezone: 'UTC', namespace: null,
    current: { active_sessions: 12 }, period: { runs_count: 248, by_status: counts({ completed: 224, failed: 9, cancelled: 3, running: 12 }), usage: { input_tokens: '12840220', output_tokens: '1940280', total_tokens: '14780500' }, runtime_seconds: 176460 },
    series: Array.from({ length: 24 }, (_, index) => {
      const completed = [2, 1, 0, 1, 3, 6, 8, 12, 15, 19, 16, 11, 7, 9, 14, 17, 10, 8, 13, 16, 7, 9, 12, 8][index]
      const failed = index % 5 === 0 ? 2 : 0
      return { from: new Date(Date.parse('2026-09-24T06:00:00Z') + index * 3600_000).toISOString(), to: new Date(Date.parse('2026-09-24T06:00:00Z') + (index + 1) * 3600_000).toISOString(), runs_count: completed + failed, by_status: counts({ completed, failed }) }
    }),
  }
}
export function session(overrides: Partial<Session> = {}): Session {
  return { id: sid, namespace: 'engineering', external_key: 'issue:482', last_run_created_at: timestamp, created_at: timestamp, usage: { input_tokens: 52180, output_tokens: 8400, total_tokens: 60580 }, phase: null, active_run_id: rid, last_run_id: rid, status: RunStatus.running, error: null, final_message: null,
    configuration: { agent: { profile: 'default', model: 'example-model', instructions: 'Work on the requested task.' }, sandbox: { template: 'codex', env_names: [], env_from: [] }, hooks: { timeout_seconds: 60 }, limits: { max_session_tokens: 100000000, run_timeout_seconds: 3600 } },
    sandbox: { id: 'sandbox-example', workspace: '/workspace/project', state: SandboxStateState.ready, last_known_state: null, error: null }, ...overrides }
}
export function run(overrides: Partial<Run> = {}): Run {
  return { id: rid, session_id: sid, number: 3, status: RunStatus.running, phase: null, usage: { input_tokens: 3200, output_tokens: 1200, total_tokens: 4400 }, agent_status: null, agent_error: null, hooks: [], env_names: [], env_from: [], input_fingerprint: null, cancel_requested_at: null, created_at: timestamp, execution_started_at: timestamp, deadline_at: null, error: null, final_message: null, finished_at: null, observation: null, stop_method: null, stop_reason: null, ...overrides }
}
export function message(overrides: Partial<Message> = {}): Message {
  return { id: '33333333-3333-4333-8333-333333333333', run_id: rid, session_id: sid, created_at: timestamp, role: MessageRole.assistant, text: 'I have checked the API contract and am updating the client types.', kind: null, external_key: null, error: null, delivery_status: null, registered_sequence: '2', position: { run_number: 3, item_index: 1 }, ...overrides }
}
export function history(): HistoryPage {
  return { event_cursor: '10', next_cursor: null, items: [
    { type: MessageItemType.message, message: message({ id: 'user-message', role: MessageRole.user, text: 'Please check the pagination issue and add a regression test.', registered_sequence: '1', position: { run_number: 3, item_index: 0 } }) },
    { type: MessageItemType.message, message: message() },
    { type: ToolItemType.tool_call, tool_call: { id: 'tool-1', session_id: sid, run_id: rid, created_at: timestamp, name: 'exec_command', input: { command: 'npm test' }, result: { type: TextResultType.text, text: 'All 24 tests passed.', original_bytes: 20, exit_code: 0 }, status: ToolCallStatus.completed, position: { run_number: 3, item_index: 2 }, registered_sequence: '3', output_completeness: ToolCallOutput_completeness.complete, truncation_reason: null } },
  ] }
}
export function limits(): AccountLimits {
  return { as_of: timestamp, stale_after_seconds: 300, items: [{ account_id: 'team-main', profiles: ['default', 'deep'], state: AccountLimitItemState.fresh, observed_at: timestamp, last_attempt_at: timestamp, error_code: null, buckets: [{ limit_id: 'codex', limit_name: 'Codex', plan_type: 'Team', rate_limit_reached_type: null, primary: { used_percent: 34, remaining_percent: 66, window_minutes: 300, resets_at: '2026-09-25T10:00:00Z' }, secondary: { used_percent: 62, remaining_percent: 38, window_minutes: 10080, resets_at: '2026-09-28T00:00:00Z' } }] }] }
}
