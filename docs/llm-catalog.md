# LLM accounts and model profiles

Settings → LLM accounts keeps the quota cards, including reset windows, freshness
and available resets. Filter by activity or name and use the page controls. Click
a card to edit its name, authorization or activity. Codex subscription accounts, OpenCode
Console accounts and global Kimi Coding Plan keys show the windows their
provider reports. An OpenCode Console workspace with credits only can report
an observation with no usage windows.

An account's harness, provider and authorization mode are fixed at creation.
For an OpenCode API key, select a built-in provider by its name and integration ID.
For a template-defined provider such as Selectel or Yandex Cloud, select **Other
provider…** and enter the exact integration ID configured in the sandbox template. For a global Kimi Coding Plan key choose
`kimi-code-plan-global`. For OpenCode Console, export credentials with
`opencode auth export opencode` and paste the single active Console record as a
JSON object in the authorization editor. Orpheus reads the provider from that record.

Choose an existing credential store for file authorization. Orpheus generates the
object name. “Edit authorization” loads the current JSON file; all fields and numbers
are preserved. A concurrent update rejects the save and keeps your draft. Reloading
explicitly discards the draft and reads the current version. API keys are masked
and can only be replaced, never revealed.

Settings → Profiles manages model profiles. Each has a unique immutable name,
account, required model, description and instructions. Codex accounts also have
Codex-specific settings. For OpenCode, enter the model ID for the chosen provider.
For an OpenCode Console account, use `opencode-go/<model>` to select the Go
subscription. A bare model ID or `opencode/<model>` selects the Console route.
A session can override the model. Moving a profile to another account of the same
harness affects new sessions. Existing sessions retain their account and execution
settings; resetting a reusable Space session applies the new selection.

Disabling a profile or account blocks new sessions without stopping existing ones.
An inactive account makes all its profiles unavailable. Deletion requires explicit
confirmation. An account referenced by any profile or session cannot be deleted.
Deleting an unreferenced account removes its API key from the database; its S3
file remains in the credential store.

Catalogs are paginated. Session descriptions are resolved by exact visible profile
names independently of the catalog's first page; catalog failures do not block
reading session history.

The [provider list](../src/api/opencode-key-providers.json) comes from OpenCode 2.3.2.
To refresh it, select integrations from `/api/integration` with a key method that
requires no additional form fields. In an isolated instance with dummy keys,
keep providers from `/api/provider` with an enabled chat model in `/api/model`
that can run against a hosted endpoint with the key alone.
