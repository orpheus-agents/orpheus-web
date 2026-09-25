// Generated from api/upstream.yaml by npm run generate:api. Do not edit.
export type paths = {
    "/api/v1/accounts/limits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Current provider limits by configured account
         * @description Read-only snapshot from worker observations. Does not contact the provider or refresh credentials. Responses use Cache-Control no-store.
         */
        get: operations["get_account_limits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/analytics/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Dashboard analytics snapshot
         * @description Counts and usage of runs accepted during [from,to), plus current active sessions. All timestamps are UTC.
         */
        get: operations["get_analytics_overview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read browser authentication state
         * @description Public browser state; Authorization is ignored. Invalid cookies are cleared. All responses use Cache-Control no-store.
         */
        get: operations["auth_session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Start SP-initiated SAML login
         * @description SAML mode only; otherwise 404 auth_not_enabled. next must be a local absolute path (not auth routes); default /api/v1/auth/session. No Host or proxy header trust.
         */
        get: operations["browser_login"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Consume a signed SAML HTTP-POST response
         * @description SAML mode only. Body is application/x-www-form-urlencoded with exactly one SAMLResponse and RelayState, at most 1 MiB. One-time request and browser nonce are required. Unsolicited responses are rejected.
         */
        post: operations["browser_callback"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revoke the local browser session
         * @description Requires the configured Origin and X-Orpheus-CSRF header equal to 1. Idempotent; clears the cookie. Does not terminate the IdP session.
         */
        post: operations["browser_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/saml/metadata": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read service provider metadata */
        get: operations["saml_metadata"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List All Runs
         * @description List All Runs
         */
        get: operations["list_all_runs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Sessions
         * @description List Sessions
         */
        get: operations["list_sessions"];
        put?: never;
        /**
         * Create Session
         * @description Create Session
         */
        post: operations["create_session"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read Session
         * @description Read Session
         */
        get: operations["get_session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Events
         * @description Events
         */
        get: operations["get_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/events/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stream Events
         * @description Stream Events
         */
        get: operations["stream_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * History
         * @description History
         */
        get: operations["get_history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Runs
         * @description List Runs
         */
        get: operations["list_runs"];
        put?: never;
        /**
         * Create Run
         * @description Create Run
         */
        post: operations["create_run"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/runs/{rid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read Run
         * @description Read Run
         */
        get: operations["get_run"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/runs/{rid}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cancel Run
         * @description Cancel Run
         */
        post: operations["cancel_run"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sessions/{sid}/runs/{rid}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send Message
         * @description Send Message
         */
        post: operations["send_message"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health
         * @description Health
         */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ready
         * @description Ready
         */
        get: operations["ready"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        AccountLimitWindow: {
            /** Format: double */
            used_percent: number;
            /** Format: double */
            remaining_percent: number;
            window_minutes: number | null;
            /** Format: date-time */
            resets_at: string | null;
        };
        AccountLimitBucket: {
            limit_id: string;
            limit_name: string | null;
            plan_type: string | null;
            rate_limit_reached_type: string | null;
            primary: components["schemas"]["AccountLimitWindow"] | null;
            secondary: components["schemas"]["AccountLimitWindow"] | null;
        };
        AccountLimitItem: {
            account_id: string;
            profiles: string[];
            /** @enum {string} */
            state: AccountLimitItemState;
            /** Format: date-time */
            observed_at: string | null;
            /** Format: date-time */
            last_attempt_at: string | null;
            error_code: AccountLimitItemError_codeAnyOf0 | null;
            buckets: components["schemas"]["AccountLimitBucket"][];
        };
        AccountLimits: {
            /** Format: date-time */
            as_of: string;
            stale_after_seconds: number;
            items: components["schemas"]["AccountLimitItem"][];
        };
        StatusCounts: {
            /** Format: int64 */
            accepted: number;
            /** Format: int64 */
            starting: number;
            /** Format: int64 */
            running: number;
            /** Format: int64 */
            cancelling: number;
            /** Format: int64 */
            finalizing: number;
            /** Format: int64 */
            completed: number;
            /** Format: int64 */
            failed: number;
            /** Format: int64 */
            cancelled: number;
        };
        /** @description Totals for runs accepted in the period. Decimal strings preserve values beyond JavaScript Number precision. */
        AggregateUsage: {
            input_tokens: string;
            output_tokens: string;
            total_tokens: string;
        };
        AnalyticsBucket: {
            /** Format: date-time */
            from: string;
            /** Format: date-time */
            to: string;
            /** Format: int64 */
            runs_count: number;
            by_status: components["schemas"]["StatusCounts"];
        };
        AnalyticsOverview: {
            /** Format: date-time */
            as_of: string;
            /** Format: date-time */
            from: string;
            /** Format: date-time */
            to: string;
            /** @enum {string} */
            bucket: AnalyticsOverviewBucket;
            timezone: string;
            namespace: string | null;
            current: {
                /** Format: int64 */
                active_sessions: number;
            };
            /** @description Runs accepted during [from,to), including their latest recorded usage and full lifetime through as_of. */
            period: {
                /** Format: int64 */
                runs_count: number;
                by_status: components["schemas"]["StatusCounts"];
                usage: components["schemas"]["AggregateUsage"];
                /** Format: double */
                runtime_seconds: number;
            };
            series: components["schemas"]["AnalyticsBucket"][];
        };
        BrowserAuthSession: {
            /** @enum {string} */
            mode: BrowserAuthSessionMode;
            authenticated: boolean;
            read_access: boolean;
            user: {
                display_name: string;
            } | null;
            /** Format: date-time */
            expires_at: string | null;
        };
        /** @enum {string} */
        RunStatus: RunStatus;
        /** Accepted */
        Accepted: {
            /**
             * Message Id
             * Format: uuid
             */
            message_id: string;
            /**
             * Run Id
             * Format: uuid
             */
            run_id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
        };
        /** AgentConfiguration */
        AgentConfiguration: {
            /** Instructions */
            instructions: string;
            /** Model */
            model: string;
            /** Profile */
            profile: string;
        };
        /** AgentInput */
        AgentInput: {
            /**
             * Instructions
             * @default
             */
            instructions: string;
            /** Model */
            model?: string;
            /** Profile */
            profile: string;
        };
        /** Cancelled */
        Cancelled: {
            /**
             * Run Id
             * Format: uuid
             */
            run_id: string;
            status: components["schemas"]["RunStatus"];
        };
        /** Configuration */
        Configuration: {
            agent: components["schemas"]["AgentConfiguration"];
            hooks: components["schemas"]["HooksConfiguration"];
            limits: components["schemas"]["Limits"];
            sandbox: components["schemas"]["SandboxConfiguration"];
        };
        /** ConfigurationInput */
        ConfigurationInput: {
            agent: components["schemas"]["AgentInput"];
            hooks?: components["schemas"]["HooksInput"];
            limits?: components["schemas"]["LimitsInput"];
            sandbox: components["schemas"]["SandboxInput"];
        };
        /** CreateSession */
        CreateSession: {
            /** @description Logical integration or workflow name. Opaque identifier, 1–128 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            namespace?: string;
            /** @description Source-qualified external object key; not unique across sessions. Opaque identifier, 1–512 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            external_key?: string;
            /** @description Opaque input snapshot version for the first run; does not deduplicate requests. Opaque identifier, 1–256 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            input_fingerprint?: string;
            configuration: components["schemas"]["ConfigurationInput"];
            message: components["schemas"]["TextMessage"];
            /** @description Explicit environment variables for the first run's before_run and after_run hooks only. Override session sources with the same names; never passed to the harness, after_create, or before_remove. */
            env?: {
                [key: string]: string;
            };
            /** @description Allowlisted orchestrator environment variable names for the first run's before_run and after_run hooks only. Resolved before each hook; override session sources and are never passed to the harness, after_create, or before_remove. */
            env_from?: string[];
        };
        /** Error */
        Error: {
            /** Code */
            code: string;
            /** Details */
            details: components["schemas"]["ErrorDetail"][];
            /** Message */
            message: string;
            /** Phase */
            phase: ErrorPhaseAnyOf0 | null;
        };
        /**
         * ErrorDetail
         * @description Validation paths start with body, header, query, or path. Hook execution errors identify configuration.hooks.<name>; codes never contain input values or native validator messages.
         */
        ErrorDetail: {
            /**
             * Code
             * @enum {string}
             */
            code: ErrorDetailCode;
            /** Path */
            path: (string | number)[];
        };
        /** ErrorResponse */
        ErrorResponse: {
            error: components["schemas"]["Error"];
        };
        Event: components["schemas"]["RunEvent"] | components["schemas"]["MessageEvent"] | components["schemas"]["ToolCallEvent"] | components["schemas"]["SandboxEvent"];
        /** EventPage */
        EventPage: {
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["Event"][];
            /** Next Cursor */
            next_cursor: string;
        };
        /** HealthResponse */
        HealthResponse: {
            /**
             * Status
             * @default ok
             * @constant
             */
            status: "ok";
        };
        HooksConfiguration: {
            after_create?: string;
            before_run?: string;
            after_run?: string;
            before_remove?: string;
            timeout_seconds: number;
        };
        HooksInput: {
            /** @description Executable script text with a shebang; runs once after workspace creation. */
            after_create?: string;
            /** @description Executable script text with a shebang; runs before every assignment. */
            before_run?: string;
            /** @description Executable script text with a shebang; runs after confirmed agent completion, before pause. */
            after_run?: string;
            /** @description Accepted for future explicit sandbox removal; never called by this API version. */
            before_remove?: string;
            /**
             * @description Timeout for each hook invocation.
             * @default 300
             */
            timeout_seconds: number;
        };
        HookResult: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            name: HookResultName;
            /** @enum {string} */
            status: HookResultStatus;
            started_at: string | null;
            deadline_at: string | null;
            finished_at: string | null;
            exit_code: number | null;
            signal: number | null;
            output: components["schemas"]["TextResult"] | components["schemas"]["TruncatedResult"] | null;
            /** @enum {string} */
            output_completeness: HookResultOutput_completeness;
            truncation_reason: HookResultTruncation_reasonAnyOf0 | null;
            error: components["schemas"]["Error"] | null;
        };
        /** HistoryPage */
        HistoryPage: {
            /** Event Cursor */
            event_cursor: string;
            /** Items */
            items: (components["schemas"]["MessageItem"] | components["schemas"]["ToolItem"])[];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** JSONResult */
        JSONResult: {
            /** Original Bytes */
            original_bytes: number | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: JSONResultType;
            /** Value */
            value: unknown;
        };
        /** LimitsInput */
        LimitsInput: {
            /**
             * Format: int64
             * @description Session-wide input and output token budget. Omission uses DEFAULT_MAX_SESSION_TOKENS (100000000 by default); explicit null is invalid.
             */
            max_session_tokens?: number;
            /**
             * Run Timeout Seconds
             * @description Agent execution deadline, independent of the periodically renewed sandbox timeout. AgentBox plan limits on uninterrupted sandbox lifetime still apply.
             * @default 3600
             */
            run_timeout_seconds: number;
        };
        /** Limits */
        Limits: {
            /**
             * Format: int64
             * @description Session-wide input and output token budget. Omission uses DEFAULT_MAX_SESSION_TOKENS (100000000 by default); explicit null is invalid.
             */
            max_session_tokens: number;
            /**
             * Run Timeout Seconds
             * @description Agent execution deadline, independent of the periodically renewed sandbox timeout. AgentBox plan limits on uninterrupted sandbox lifetime still apply.
             * @default 3600
             */
            run_timeout_seconds: number;
        };
        /** @description Last reported token consumption; missed reports are not reconstructed from history. Cached input and reasoning output are already included. */
        Usage: {
            /** Format: int64 */
            input_tokens: number;
            /** Format: int64 */
            output_tokens: number;
            /** Format: int64 */
            total_tokens: number;
        };
        /** Message */
        Message: {
            /** @description External key supplied for an incoming message; null for agent messages. Opaque identifier, 1–512 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            external_key: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Delivery Status */
            delivery_status: MessageDelivery_statusAnyOf0 | null;
            error: components["schemas"]["Error"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: MessageKindAnyOf0 | null;
            position: components["schemas"]["Position"] | null;
            /** Registered Sequence */
            registered_sequence: string;
            /**
             * Role
             * @enum {string}
             */
            role: MessageRole;
            /**
             * Run Id
             * Format: uuid
             */
            run_id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            /** Text */
            text: string;
        };
        MessageEvent: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            data: components["schemas"]["Message"];
            /** Id */
            id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: MessageEventType;
        };
        /** MessageItem */
        MessageItem: {
            message: components["schemas"]["Message"];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: MessageItemType;
        };
        /** RunPage */
        RunPage: {
            /** Items */
            items: components["schemas"]["Run"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** SessionPage */
        SessionPage: {
            /** Items */
            items: components["schemas"]["Session"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** Position */
        Position: {
            /** Item Index */
            item_index: number;
            /** Run Number */
            run_number: number;
        };
        /** Run */
        Run: {
            usage: components["schemas"]["Usage"];
            phase: RunPhaseAnyOf0 | null;
            agent_status: RunAgent_statusAnyOf0 | null;
            agent_error: components["schemas"]["Error"] | null;
            hooks: components["schemas"]["HookResult"][];
            /** @description Sorted names of explicit variables supplied for this run; values are never returned. */
            env_names: string[];
            /** @description Sorted orchestrator environment variable names supplied for this run. */
            env_from: string[];
            /** @description Input snapshot version supplied when the run was accepted. Opaque identifier, 1–256 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            input_fingerprint: string | null;
            /** Cancel Requested At */
            cancel_requested_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deadline At */
            deadline_at: string | null;
            error: components["schemas"]["Error"] | null;
            /** Execution Started At */
            execution_started_at: string | null;
            final_message: components["schemas"]["Message"] | null;
            /** Finished At */
            finished_at: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Number */
            number: number;
            /** Observation */
            observation: RunObservationAnyOf0 | null;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            status: components["schemas"]["RunStatus"];
            /**
             * Stop Method
             * @description How cancellation stopped agent execution. Null until confirmed, or if the run was cancelled before the first dispatch attempt, including user-requested cancellation.
             */
            stop_method: RunStop_methodAnyOf0 | null;
            /** Stop Reason */
            stop_reason: RunStop_reasonAnyOf0 | null;
        };
        RunEvent: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            data: components["schemas"]["Run"];
            /** Id */
            id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: RunEventType;
        };
        /** SandboxConfiguration */
        SandboxConfiguration: {
            /** Env From */
            env_from: string[];
            /** Env Names */
            env_names: string[];
            /** Template */
            template: string;
        };
        SandboxEvent: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            data: components["schemas"]["SandboxState"];
            /** Id */
            id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: SandboxEventType;
        };
        /** SandboxInput */
        SandboxInput: {
            /** Env */
            env?: {
                [key: string]: string;
            };
            /** Env From */
            env_from?: string[];
            /** Template */
            template: string;
        };
        /** SandboxState */
        SandboxState: {
            error: components["schemas"]["Error"] | null;
            /** @description AgentBox sandbox ID, if known. A retained ID does not guarantee that an unavailable sandbox is accessible. */
            id: string | null;
            /** Last Known State */
            last_known_state: string | null;
            /**
             * State
             * @enum {string}
             */
            state: SandboxStateState;
            /** @description Absolute workspace path resolved during sandbox preparation, if known. */
            workspace: string | null;
        };
        /** CreateRun */
        CreateRun: {
            /** @description Opaque input snapshot version for this run; does not deduplicate requests. Opaque identifier, 1–256 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            input_fingerprint?: string;
            message: components["schemas"]["TextMessage"];
            /** @description Explicit environment variables available only to this run's before_run and after_run hooks. Override session sources with the same names; never passed to the harness, after_create, or before_remove. */
            env?: {
                [key: string]: string;
            };
            /** @description Allowlisted orchestrator environment variable names available only to this run's before_run and after_run hooks. Resolved before each hook; override session sources and are never passed to the harness, after_create, or before_remove. */
            env_from?: string[];
        };
        /** SendMessage */
        SendMessage: {
            message: components["schemas"]["TextMessage"];
        };
        /** Session */
        Session: {
            /**
             * Format: date-time
             * @description Creation time of the latest run, not the last activity time.
             */
            last_run_created_at: string;
            usage: components["schemas"]["Usage"];
            phase: SessionPhaseAnyOf0 | null;
            /** @description Logical integration or workflow name. Opaque identifier, 1–128 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            namespace: string | null;
            /** @description Source-qualified external object key; not unique across sessions. Opaque identifier, 1–512 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            external_key: string | null;
            /** Active Run Id */
            active_run_id: string | null;
            configuration: components["schemas"]["Configuration"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            error: components["schemas"]["Error"] | null;
            final_message: components["schemas"]["Message"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Last Run Id
             * Format: uuid
             */
            last_run_id: string;
            sandbox: components["schemas"]["SandboxState"];
            status: components["schemas"]["RunStatus"];
        };
        /** TextMessage */
        TextMessage: {
            /** @description External message or event key; not unique and not sent to the harness. Opaque identifier, 1–512 UTF-8 bytes; no NUL or whitespace-only value. Compared exactly, without normalization. */
            external_key?: string;
            /** Text */
            text: string;
        };
        /** TextResult */
        TextResult: {
            /** Exit Code */
            exit_code?: number | null;
            /** Original Bytes */
            original_bytes: number | null;
            /** Text */
            text: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: TextResultType;
        };
        /** ToolCall */
        ToolCall: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Input */
            input: unknown;
            /** Name */
            name: string;
            /**
             * Output Completeness
             * @enum {string}
             */
            output_completeness: ToolCallOutput_completeness;
            position: components["schemas"]["Position"] | null;
            /** Registered Sequence */
            registered_sequence: string;
            /** Result */
            result: components["schemas"]["ToolResult"] | null;
            /**
             * Run Id
             * Format: uuid
             */
            run_id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            /**
             * Status
             * @enum {string}
             */
            status: ToolCallStatus;
            /** Truncation Reason */
            truncation_reason: ToolCallTruncation_reasonAnyOf0 | null;
        };
        ToolResult: components["schemas"]["TextResult"] | components["schemas"]["JSONResult"] | components["schemas"]["TruncatedResult"];
        ToolCallEvent: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            data: components["schemas"]["ToolCall"];
            /** Id */
            id: string;
            /**
             * Session Id
             * Format: uuid
             */
            session_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: ToolCallEventType;
        };
        /** ToolItem */
        ToolItem: {
            tool_call: components["schemas"]["ToolCall"];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: ToolItemType;
        };
        /** TruncatedResult */
        TruncatedResult: {
            /** Exit Code */
            exit_code?: number | null;
            /** Head */
            head: string;
            /** Original Bytes */
            original_bytes: number | null;
            /**
             * Source Type
             * @default text
             * @enum {string}
             */
            source_type: TruncatedResultSource_type;
            /** Tail */
            tail: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: TruncatedResultType;
        };
        /** UnavailableResponse */
        UnavailableResponse: {
            /**
             * Status
             * @default unavailable
             * @constant
             */
            status: "unavailable";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type AccountLimitWindow = components['schemas']['AccountLimitWindow'];
export type AccountLimitBucket = components['schemas']['AccountLimitBucket'];
export type AccountLimitItem = components['schemas']['AccountLimitItem'];
export type AccountLimits = components['schemas']['AccountLimits'];
export type StatusCounts = components['schemas']['StatusCounts'];
export type AggregateUsage = components['schemas']['AggregateUsage'];
export type AnalyticsBucket = components['schemas']['AnalyticsBucket'];
export type AnalyticsOverview = components['schemas']['AnalyticsOverview'];
export type BrowserAuthSession = components['schemas']['BrowserAuthSession'];
export type Accepted = components['schemas']['Accepted'];
export type AgentConfiguration = components['schemas']['AgentConfiguration'];
export type AgentInput = components['schemas']['AgentInput'];
export type Cancelled = components['schemas']['Cancelled'];
export type Configuration = components['schemas']['Configuration'];
export type ConfigurationInput = components['schemas']['ConfigurationInput'];
export type CreateSession = components['schemas']['CreateSession'];
export type Error = components['schemas']['Error'];
export type ErrorDetail = components['schemas']['ErrorDetail'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type Event = components['schemas']['Event'];
export type EventPage = components['schemas']['EventPage'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type HooksConfiguration = components['schemas']['HooksConfiguration'];
export type HooksInput = components['schemas']['HooksInput'];
export type HookResult = components['schemas']['HookResult'];
export type HistoryPage = components['schemas']['HistoryPage'];
export type JsonResult = components['schemas']['JSONResult'];
export type LimitsInput = components['schemas']['LimitsInput'];
export type Limits = components['schemas']['Limits'];
export type Usage = components['schemas']['Usage'];
export type Message = components['schemas']['Message'];
export type MessageEvent = components['schemas']['MessageEvent'];
export type MessageItem = components['schemas']['MessageItem'];
export type RunPage = components['schemas']['RunPage'];
export type SessionPage = components['schemas']['SessionPage'];
export type Position = components['schemas']['Position'];
export type Run = components['schemas']['Run'];
export type RunEvent = components['schemas']['RunEvent'];
export type SandboxConfiguration = components['schemas']['SandboxConfiguration'];
export type SandboxEvent = components['schemas']['SandboxEvent'];
export type SandboxInput = components['schemas']['SandboxInput'];
export type SandboxState = components['schemas']['SandboxState'];
export type CreateRun = components['schemas']['CreateRun'];
export type SendMessage = components['schemas']['SendMessage'];
export type Session = components['schemas']['Session'];
export type TextMessage = components['schemas']['TextMessage'];
export type TextResult = components['schemas']['TextResult'];
export type ToolCall = components['schemas']['ToolCall'];
export type ToolResult = components['schemas']['ToolResult'];
export type ToolCallEvent = components['schemas']['ToolCallEvent'];
export type ToolItem = components['schemas']['ToolItem'];
export type TruncatedResult = components['schemas']['TruncatedResult'];
export type UnavailableResponse = components['schemas']['UnavailableResponse'];
export type $defs = Record<string, never>;
export interface operations {
    get_account_limits: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Account limits snapshot */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountLimits"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Account limits unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_analytics_overview: {
        parameters: {
            query?: {
                /** @description Server-relative sliding window. Defaults to 24h; cannot be combined with from/to. */
                window?: PathsApiV1AnalyticsOverviewGetParametersQueryWindow;
                /** @description Inclusive RFC 3339 timestamp with offset; requires to. */
                from?: string;
                /** @description Exclusive RFC 3339 timestamp with offset; requires from and cannot be later than as_of. Range at most 31 days. */
                to?: string;
                /** @description Local calendar hour or day; at most 800 buckets. */
                bucket?: PathsApiV1AnalyticsOverviewGetParametersQueryBucket;
                /** @description IANA timezone for bucket boundaries; timestamps in the response are UTC. */
                timezone?: string;
                /** @description Exact namespace match; omission includes every namespace and null. */
                namespace?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Analytics snapshot */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnalyticsOverview"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Invalid query */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Analytics unavailable or overflow */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    auth_session: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read browser authentication state */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserAuthSession"];
                };
            };
            /** @description Storage unavailable (503). */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    browser_login: {
        parameters: {
            query?: {
                next?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Start SP-initiated SAML login */
            302: {
                headers: {
                    /** @description SAML IdP URL. */
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid return path (400), authentication disabled (404), request validation failed (422), or authentication/storage unavailable (503). */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    browser_callback: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Consume a signed SAML HTTP-POST response */
            303: {
                headers: {
                    /** @description Validated local return path. */
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid login state (400), invalid SAML response (401), authentication disabled (404), oversized form (413), or authentication/storage unavailable (503). */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    browser_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Revoke the local browser session */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid origin or CSRF header (403), or storage unavailable (503). */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    saml_metadata: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Read service provider metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/samlmetadata+xml": string;
                };
            };
            /** @description Authentication disabled (404), or metadata unavailable (503). */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_all_runs: {
        parameters: {
            query?: {
                namespace?: string;
                external_key?: string;
                input_fingerprint?: string;
                status?: components["schemas"]["RunStatus"];
                order?: PathsApiV1RunsGetParametersQueryOrder;
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunPage"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_sessions: {
        parameters: {
            query?: {
                /** @description Whether the latest run is unfinished; combined with status using AND. */
                activity?: PathsApiV1SessionsGetParametersQueryActivity;
                /** @description Timestamp used for order and cursor position. */
                sort?: PathsApiV1SessionsGetParametersQuerySort;
                /** @description Inclusive lower bound for the latest run creation time; requires last_run_created_to. */
                last_run_created_from?: string;
                /** @description Exclusive upper bound for the latest run creation time; requires last_run_created_from. Range at most 31 days. */
                last_run_created_to?: string;
                namespace?: string;
                external_key?: string;
                status?: components["schemas"]["RunStatus"];
                order?: PathsApiV1SessionsGetParametersQueryOrder;
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionPage"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_session: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSession"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description URL of the accepted run. */
                    Location: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Accepted"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Browser sessions allow reading only (read_only_access). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_session: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_events: {
        parameters: {
            query?: {
                after?: string;
                limit?: number;
            };
            header?: never;
            path: {
                sid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EventPage"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    stream_events: {
        parameters: {
            query?: {
                after?: string;
            };
            header?: {
                "last-event-id"?: string | null;
            };
            path: {
                sid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_history: {
        parameters: {
            query?: {
                message_external_key?: string;
                limit?: number;
                cursor?: string | null;
                run_id?: string | null;
            };
            header?: never;
            path: {
                sid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HistoryPage"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_runs: {
        parameters: {
            query?: {
                input_fingerprint?: string;
                status?: components["schemas"]["RunStatus"];
                order?: PathsApiV1SessionsSidRunsGetParametersQueryOrder;
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path: {
                sid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunPage"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_run: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                sid: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateRun"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description URL of the accepted run. */
                    Location: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Accepted"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Browser sessions allow reading only (read_only_access). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_run: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sid: string;
                rid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Run"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    cancel_run: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sid: string;
                rid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cancelled"];
                };
            };
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Cancelled"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Browser sessions allow reading only (read_only_access). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    send_message: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                sid: string;
                rid: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendMessage"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    /** @description URL of the accepted run. */
                    Location: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Accepted"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Browser sessions allow reading only (read_only_access). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unsupported Media Type */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    ready: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UnavailableResponse"];
                };
            };
        };
    };
}
export enum PathsApiV1AnalyticsOverviewGetParametersQueryWindow {
    Value24h = "24h",
    Value7d = "7d",
    Value30d = "30d"
}
export enum PathsApiV1AnalyticsOverviewGetParametersQueryBucket {
    hour = "hour",
    day = "day"
}
export enum PathsApiV1RunsGetParametersQueryOrder {
    asc = "asc",
    desc = "desc"
}
export enum PathsApiV1SessionsGetParametersQueryActivity {
    all = "all",
    active = "active",
    inactive = "inactive"
}
export enum PathsApiV1SessionsGetParametersQuerySort {
    created_at = "created_at",
    last_run_created_at = "last_run_created_at"
}
export enum PathsApiV1SessionsGetParametersQueryOrder {
    asc = "asc",
    desc = "desc"
}
export enum PathsApiV1SessionsSidRunsGetParametersQueryOrder {
    asc = "asc",
    desc = "desc"
}
export enum AccountLimitItemState {
    unknown = "unknown",
    unavailable = "unavailable",
    stale = "stale",
    fresh = "fresh"
}
export enum AccountLimitItemError_codeAnyOf0 {
    AccountLimitItemErrorCodeUnsupported = "unsupported",
    AccountLimitItemErrorCodeTemporarilyUnavailable = "temporarily_unavailable",
    AccountLimitItemErrorCodeInvalidResponse = "invalid_response",
    AccountLimitItemErrorCodeNoData = "no_data",
    AccountLimitItemErrorCodeAuthenticationUnavailable = "authentication_unavailable"
}
export enum AnalyticsOverviewBucket {
    hour = "hour",
    day = "day"
}
export enum BrowserAuthSessionMode {
    api_only = "api_only",
    saml = "saml",
    anonymous = "anonymous"
}
export enum RunStatus {
    accepted = "accepted",
    starting = "starting",
    running = "running",
    cancelling = "cancelling",
    finalizing = "finalizing",
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled"
}
export enum ErrorPhaseAnyOf0 {
    preparation = "preparation",
    execution = "execution",
    finalization = "finalization",
    recovery = "recovery"
}
export enum ErrorDetailCode {
    required = "required",
    invalid_type = "invalid_type",
    invalid_value = "invalid_value",
    unknown_field = "unknown_field"
}
export enum HookResultName {
    after_create = "after_create",
    before_run = "before_run",
    after_run = "after_run",
    before_remove = "before_remove"
}
export enum HookResultStatus {
    pending = "pending",
    running = "running",
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled",
    skipped = "skipped"
}
export enum HookResultOutput_completeness {
    complete = "complete",
    truncated = "truncated",
    unavailable = "unavailable",
    unknown = "unknown"
}
export enum HookResultTruncation_reasonAnyOf0 {
    orpheus_limit = "orpheus_limit"
}
export enum JSONResultType {
    json = "json"
}
export enum MessageDelivery_statusAnyOf0 {
    pending = "pending",
    sending = "sending",
    delivered = "delivered",
    uncertain = "uncertain",
    rejected = "rejected"
}
export enum MessageKindAnyOf0 {
    progress = "progress",
    answer = "answer"
}
export enum MessageRole {
    user = "user",
    assistant = "assistant"
}
export enum MessageEventType {
    message_updated = "message.updated"
}
export enum MessageItemType {
    message = "message"
}
export enum RunPhaseAnyOf0 {
    preparation = "preparation",
    after_create = "after_create",
    before_run = "before_run",
    agent = "agent",
    after_run = "after_run"
}
export enum RunAgent_statusAnyOf0 {
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled"
}
export enum RunObservationAnyOf0 {
    attached = "attached",
    reconnecting = "reconnecting",
    uncertain = "uncertain"
}
export enum RunStop_methodAnyOf0 {
    graceful = "graceful",
    forced = "forced"
}
export enum RunStop_reasonAnyOf0 {
    user_request = "user_request",
    run_timeout = "run_timeout",
    token_limit = "token_limit"
}
export enum RunEventType {
    run_updated = "run.updated"
}
export enum SandboxEventType {
    sandbox_updated = "sandbox.updated"
}
export enum SandboxStateState {
    not_created = "not_created",
    provisioning = "provisioning",
    ready = "ready",
    pausing = "pausing",
    paused = "paused",
    resuming = "resuming",
    unavailable = "unavailable"
}
export enum SessionPhaseAnyOf0 {
    preparation = "preparation",
    after_create = "after_create",
    before_run = "before_run",
    agent = "agent",
    after_run = "after_run"
}
export enum TextResultType {
    text = "text"
}
export enum ToolCallOutput_completeness {
    complete = "complete",
    truncated = "truncated",
    unavailable = "unavailable",
    unknown = "unknown"
}
export enum ToolCallStatus {
    running = "running",
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled",
    unknown = "unknown"
}
export enum ToolCallTruncation_reasonAnyOf0 {
    orpheus_limit = "orpheus_limit",
    harness_limit = "harness_limit"
}
export enum ToolCallEventType {
    tool_call_updated = "tool_call.updated"
}
export enum ToolItemType {
    tool_call = "tool_call"
}
export enum TruncatedResultSource_type {
    text = "text",
    json = "json"
}
export enum TruncatedResultType {
    truncated_text = "truncated_text"
}
