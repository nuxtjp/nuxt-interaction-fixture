# @nuxtjp/interaction-fixture

Rustの処理、通信、Nuxtの画面を通した操作を、検証用アプリで確認できます。

## 利用前の確認

実装済みの範囲、必要な依存関係、検証コマンドを以下の英語説明に併記しています。操作・配備・公開は、それぞれの権限と設定を確認してから実施してください。

通信と操作契約の依存ライブラリは公式npmレジストリから取得します。UI自体の公開状況と、検証用fixtureのソース配置は以下に記載しています。

## 使い方

リポジトリ内のサンプル・スキーマ・実装を確認し、用途に必要な入力を明示して利用します。下記のGetting startedに、現行設定に対応する検証コマンドを示しています。

検証結果は実行した範囲だけを示します。未実装の機能、未設定の接続、配備環境の確認を合格扱いにしないでください。

## English

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
Cargo target directory. CI pins the UI revision. Production applications supply
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
