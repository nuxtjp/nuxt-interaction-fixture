# @nuxtjp/interaction-fixture

Rustの処理、通信、Nuxtの画面を通した操作を、検証用アプリで確認できます。

## 利用前の確認

実装済みの範囲、必要な依存関係、検証コマンドを以下の英語説明に併記しています。操作・配備・公開は、それぞれの権限と設定を確認してから実施してください。

現在の依存設定にはGit対象外のローカル成果物が含まれます。配布経路が整うまでは、cloneだけで依存を導入できません。

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

The manifest currently requires locally supplied package archives: `@nuxtjp/declarative-ui`, `@crowsi/interaction-transport`. These archives are excluded from Git. Obtain the exact approved dependency artifacts before installing; a fresh clone alone is not sufficient. Registry distribution remains pending.

Use the package manager matching the checked-in lockfile and the Node.js version declared in `package.json` or the development configuration. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

## Examples and interface details

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

## Documentation and source

[Interface reference](docs/interface-reference.md)

[Usage guide](docs/getting-started.md)

[Detailed documentation](docs) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
