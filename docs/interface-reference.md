# nuxt-interaction-fixture interface reference

Use the [usage guide](getting-started.md) for the first steps. This reference preserves the current interface details and operational limits. Run command examples from the repository root, after preparing the exact declared dependencies and registered configuration.

## Ownership and execution

The Rust handler owns fixture records, revision checks and persisted retry
receipts. It consumes zixcel-interaction from a private Cargo registry archive.
The Nuxt host only declares a route, resolves a fixture scope and wires the
Crowsi Web Request adapter to the installed handler executable. NuxtJP owns
rendering, SSR snapshots, form drafts and subscription lifecycle. No embedded V8.

All private NPM dependencies are SHA-256-addressed archives, resolved through
package-manager overrides and locked integrity values. No sibling source imports.

1. Build handler/Cargo.toml with the verified zixcel-private Cargo configuration,
   using --offline and --locked. Explicitly regenerate its lock after a deliberate
   0.10.0 archive replacement; do not add a source-path fallback.
2. pnpm install --offline --frozen-lockfile --ignore-scripts
3. node tools/check.mjs build
4. node tools/check.mjs browser

The browser checker requires Linux `xvfb-run` / `Xvfb` and the installed Playwright
Chromium binary. It owns a private virtual display and temporary browser profile.
The visibility portion attaches with Playwright's public `noDefaults` CDP option:
ordinary Playwright contexts force visibility and cannot certify this behavior.
It never attaches to an existing personal browser or changes `document.hidden`.

The checker saves logs and warning-sensitive reports in .results. Browser tests
create isolated temporary state, launch production Node output and a Rust worker,
then close processes and remove test state. No user data, real credentials,
Windows automation or Hatter release switch is performed.

## Scenarios currently exercised

- Real SSR initial values, exact declaration/resource attributes, no initial
  mutation, no duplicate initial read after hydration.
- Input -> typed invoke -> exact persisted value -> live display; repeat save.
- Add field, collection, action and page to the running build through declaration
  data; an installed Nuxt module adds a renderer capability.
- Preserve unsaved edits during declaration updates and reject a stale contract.
- Multiple users and roles see distinct records. Invalid required input does not
  mutate either user's records. Boolean false remains valid.
- 390px viewport does not overflow; page changes and browser console are checked.

- Operation input schemas differ from resource schemas; `replacement` updates
  `name` without submitting unrelated resource fields, and false stays false.
- Six typed read failures preserve status/reason/field issues through SSR and
  live UI. The HTTP page stays 200 and stale private values are no longer rendered.
- Grant revocation rejects replay of a previously successful request before
  exposing its saved receipt, without changing its resource revision.
- Runtime executable declarations produce typed unavailable; no script executes.
- Real browser hidden/visible state stops/resumes subscription traffic. The
  underlying Rust server is interrupted and a new request reconnects without
  replaying uncertain writes or losing persisted values.

These two combined browser scenarios pass with warnings/errors rejected. This is
not Hatter release acceptance. Shared Rust/JavaScript schema-algebra conformance
and the separate Hatter role/inference/memory/lifecycle migration remain distinct
work. See docs/migration.md and sem-lang/docs/feedback-integration.md; product
gates are not satisfied by these fixture tests.
