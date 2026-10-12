# @nuxtjp/interaction-fixture

[日本語](README.ja.md)

Test a complete declared interaction across a Rust handler, transport and Nuxt browser view.

## What you can do

- Observe exact revisions and retry receipts.
- Run browser scenarios against the fixture product.

## Current scope

This is a test-only fixture. Its identity and configuration stubs must not be deployed as production authentication.

## Getting started

Fetch the transport and interaction contracts from npm. The unpublished UI module
is a deliberate development dependency, `file:../nuxt-declarative-ui`. Clone its
public source beside this fixture and build it first. This does not constitute
official-registry verification of the UI package. Deleted artifact trees are unused.

```sh
git clone https://github.com/nuxtjp/nuxt-declarative-ui.git ../nuxt-declarative-ui
pnpm --dir ../nuxt-declarative-ui install --frozen-lockfile --ignore-scripts
pnpm --dir ../nuxt-declarative-ui build
pnpm install --frozen-lockfile --ignore-scripts
cargo build --locked --manifest-path handler/Cargo.toml
pnpm test:dependency-security
node tools/check.mjs build
node tools/check.mjs browser
```

Set `INTERACTION_FIXTURE_HANDLER` to an absolute executable path for an external
Cargo target directory. CI pins reviewed public UI source `2b49d3e14a10196d4826c0ce38116b265b9ae9b8`, including the independently verified TGZ/type/SSR candidate and primitive-input correction. Initial npm registration/Trusted Publisher and staged owner approval are D11; only after official publication will this fixture switch to its registry dependency. Production applications supply
real authentication and their own authorized handlers.

## Examples and interface details

## Ownership and execution

The Rust handler owns fixture records, revision checks and persisted retry
receipts. It consumes `zixcel-interaction@0.10.0` from crates.io.
The Nuxt host only declares a route, resolves a fixture scope and wires the
Crowsi Web Request adapter to the installed handler executable. NuxtJP owns
rendering, SSR snapshots, form drafts and subscription lifecycle. No embedded V8.

Registry dependencies and the development-only UI source link are pinned in the
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
