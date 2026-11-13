# Sandbox templates

Open **Settings → Templates** to manage the Orpheus catalog. Each record has an
AgentBox alias, optional tag, description and active state. New records are active
by default. Registration checks that the alias and tag exist in the configured
AgentBox project; a blank tag requires its `default` tag without pinning a build.
Names accept both a short alias and `team/alias`. The API normalizes their case.

The list defaults to active records. Activity and name-substring filters run on
the server. Back/Next navigate cursor pages; the URL stores the filters, page size,
cursor and page counter. The counter counts navigation steps rather than a fixed
page offset. An invalid cursor offers an explicit return to the first page.

Open a row to edit its description or activity, or delete it with confirmation.
Deletion removes only the Orpheus catalog record. Back to templates returns to
the last list address in the current application session, just as session cards
do. Reloading a card resets that remembered address to the default list.

SAML users and local anonymous users can manage records. Browser writes use the
same-origin cookie session and CSRF header; configure `ORPHEUS_PUBLIC_URL` to the
exact browser origin. No API key is stored in the browser.

Space requires an active catalog record for creation, editing and resume of a
schedule. During the current rollout, Orpheus session admission and workers still
use TOML: keep the runtime template entries until the separate runtime migration.
