# Using @nuxtjp/interaction-fixture

Test a complete declared interaction across a Rust handler, transport and Nuxt browser view.

## Before you start

This is a test-only fixture. Its identity and configuration stubs must not be deployed as production authentication.

## First steps

Make the exact declared dependency artifacts available before installation. Local archives are excluded from Git; registry publication remains pending.

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

## How to assess the result

- Observe exact revisions and retry receipts.
- Run browser scenarios against the fixture product.

A passing source-level check establishes only what that check observes. Keep missing configuration, unavailable services and unverified deployment paths visible.

## Continue reading

[Repository overview](../README.md)
