# LLM accounts and model profiles

Settings → LLM accounts keeps the quota cards, including reset windows, freshness
and available resets. Filter by activity or name and use the page controls. Click
a card to edit its name, authorization or activity. API-key accounts have no
provider quota observations.

An account's harness and authorization mode are fixed at creation. Choose an
existing credential store for file authorization. Orpheus generates the object
name. “Edit authorization” loads the current JSON file; all fields and numbers
are preserved. A concurrent update rejects the save and keeps your draft. Reloading
explicitly discards the draft and reads the current version. API keys are masked
and can only be replaced, never revealed.

Settings → Profiles manages model profiles. Each has a unique immutable name,
account, required model, description, instructions and optional Codex settings.
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
