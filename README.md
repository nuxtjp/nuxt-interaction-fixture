# @nuxtjp/interaction-fixture

[日本語](README.ja.md)

Test a complete declared interaction across a Rust handler, transport and Nuxt browser view.

## What you can do

- Observe exact revisions and retry receipts.
- Run browser scenarios against the fixture product.

## Current scope

This is a test-only fixture. Its identity and configuration stubs must not be deployed as production authentication.

## Getting started

Install the UI, transport and interaction contracts from the public npm registry.
The UI uses the official @nuxtjp/declarative-ui 0.10.0 OIDC release; no sibling checkout is required.

```sh
pnpm install --frozen-lockfile --ignore-scripts
cargo build --locked --manifest-path handler/Cargo.toml
pnpm test:dependency-security
node tools/check.mjs build
node tools/check.mjs browser
```

Set `INTERACTION_FIXTURE_HANDLER` to an absolute executable path for an external
Cargo target directory. CI installs the committed official registry dependency graph. Production applications supply
real authentication and their own authorized handlers.

## Examples and interface details

## Ownership and execution

The Rust handler owns fixture records, revision checks and persisted retry
receipts. It consumes `zixcel-interaction@0.10.0` from crates.io.
The Nuxt host only declares a route, resolves a fixture scope and wires the
Crowsi Web Request adapter to the installed handler executable. NuxtJP owns
rendering, SSR snapshots, form drafts and subscription lifecycle. No embedded V8.

Official registry dependency versions and integrity are pinned in the
lockfile. Fixture authentication stubs are never production authorization.


The browser checker requires Linux `xvfb-run` / `Xvfb` and the installed Playwright
Chromium binary. It owns a private virtual display and temporary browser profile.
The visibility portion attaches with Playwright's public `noDefaults` CDP option:
ordinary Playwright contexts force visibility and cannot certify this behavior.
It never attaches to an existing personal browser or changes `document.hidden`.

The checker saves logs and warning-sensitive reports in .results. Browser tests
create isolated temporary state, launch production Node output and a Rust worker,
then close processes and remove test state. No user data, real credentials,
Windows automation or Hatter release switch is performed.

## Documentation and source

[Interface reference](docs/interface-reference.md)

[Usage guide](docs/getting-started.md)

[Detailed documentation](docs) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
