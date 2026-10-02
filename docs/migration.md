# Declarative interaction reconstruction

Version: 0.10.0. Implementation status is **in progress**, not release eligible.

## Binding authority decision — 2026-09-06

The SemanticBinding instruction supersedes the earlier application-binding plan.
Hatter must NOT introduce ApplicationBinding, a binding repository, a profile
schema authority or a semantic presentation DTO. See sem-lang's
`docs/semantic-binding.md` for the exact reference/adoption contract and gates.
SemanticDefinition, SemanticBinding and Assertion/Memory belong to sem-lang;
provider facts remain with providers. Hatter owns roles, authorization, grants,
capability activation and package lifecycle only. Definition adoption, binding
adoption, installation, activation and authorization are independent decisions.
NuxtJP receives opaque capability references and Zixcel contracts, never sem-lang
storage or sem-lang dependencies. The existing fixture gates still apply before
replacing production profile authorities.

## Authorities and migration inventory

| Owner / current implementation | Decision | Destination / acceptance condition |
| --- | --- | --- |
| sem-lang memory `definitions.rs`, repository CAS, context checkpoint | KEEP | Exact adopted meaning and memory revisions; no UI layouts or Hatter rules |
| Hatter `profile_catalog.rs`, `profile_model.rs` | REPLACE | sem-lang adopted definitions + adopted SemanticBindings; no inferred meanings from field widget types |
| Hatter `semantic_views.rs` and `dictionary/views.json` | REPLACE | Real adopted definition references and unified language revision |
| Hatter `profile_store.rs`, validation and store support | DELETE after replacement | Assertions or provider references, not a second profile JSON authority |
| Hatter management `profile.rs`, `wire.rs`, `profile_cmd.rs` | REPLACE | Same typed application handler for CLI and Web; no nested JSON strings |
| Hatter context / role bindings | KEEP and refine | Stable role/subject IDs referencing memory; no role-local fact copies |
| Hatter HAT catalog, surfaces, installation and grants | REPLACE affected contracts | Installation, definition adoption, SemanticBinding adoption and grants remain separate decisions |
| Console `profile-projection.mjs`, `semantic-views-projection.mjs` | DELETE after replacement | Contract validation by owning package, no new canonical representations |
| Console first-use and profile-onboarding projections | REPLACE | Product scene composition from bindings; not hardcoded identity/residence/language fields |
| Console `ProfileSchemaForm.vue`, `ConsoleDeclarativeForm.vue`, `nuxt-ui-form.mjs` | MOVE / REPLACE | NuxtJP logical declaration renderer using Nuxt UI; product-specific scene declarations stay |
| Console `useConsoleProjection.ts`, generic mutation/error handling | MOVE | NuxtJP snapshot lifecycle and Crowsi transport; business authorization stays in Hatter |
| Console routing, scene, navigation, theme | KEEP | Product-specific presentation, not business persistence or generic SSR infrastructure |
| NuxtJP `nuxt-declarative-ui` | REPLACE current display-only contract | Logical node registry; build-time capability modules and runtime data declarations |
| NuxtJP `nuxt-local-runtime` | KEEP separate pending consumer migration | Its pairing / loopback policy is not the universal interaction contract |
| NuxtJP `rust-v8-local-runtime`, `nuxt-v8-view-worker` | EXCLUDE from this runtime | Existing worker is not Vue SSR; no new embedded V8 or duplicate JavaScript process |
| NuxtJP managed resources / operations / auth renderers | KEEP specialized | Reuse presentation capabilities where suitable, not their product-specific models |
| NuxtJP identity, localized-site, management layout | EXCLUDE from core | OIDC, SEO and Japanese management UI are not requirements of a neutral renderer |
| Zixcel contracts, graph, provider wrappers | KEEP | Connector contracts and graph remain independent of UI and sem-lang |
| Zixcel topology API | KEEP specialized | Not a universal application server; no extra graph authority introduced |
| NEW Zixcel `zixcel-interaction` | ADD | Resource/value/action/change contracts, typed outcomes, revision checks; serde-only runtime dependencies |
| Crowsi telemetry SSE and authority transport | KEEP specialized | Telemetry/authority payloads are not repurposed as application payloads |
| NEW Crowsi interaction transport | ADD | Bounded HTTP/stream/stdio, cancellation, timeout and reconnect; no field/profile/HAT semantics |
| NEW independent fixture | ADD | Rust domain handler + Nuxt SSR + Playwright, no Hatter/sem-lang/profile dependency |

## Confirmed inconsistencies

- UI field representation is currently used to invent meaning identifiers.
- Profile facts have an independent JSON authority and a fixed catalog.
- Rust permits required boolean `false`; Console considers it missing.
- Definition memory is not actually included in the current dictionary projection.
- Current initial client reads do not establish an exact SSR/hydration snapshot.
- Closed four-section NuxtJP declaration cannot represent actions or inputs.
- Existing NuxtJP versions 0.2.0/0.1.0 are not the requested development version.
- Existing successful component tests do not prove the full definition-to-UI path.

## Test-first gates (not optional; unexecuted is incomplete)

| Gate | Combined scenario / exact assertions | Status |
| --- | --- | --- |
| C1 | Schema validation, required false, bounds, enums, nested objects, unknown input rejection | Pending |
| C2 | Invoke operation/target/contract/resource revision, seven outcome variants, retry reference | Pending |
| C3 | Snapshot resource identity + cursor; read-only/unavailable and structured reasons | Pending |
| F1 | Real SSR, exact values/revisions in HTML/payload/hydration, single initial read, no mutation | Pending |
| F2 | Two users/roles concurrent, no shared cache reuse, no cross-scope invoke/change | Pending |
| F3 | New view/field/collection/action on same running build; unknown capability fails explicitly | Pending |
| F4 | Invalid input, conflict, forbidden, unavailable, missing and unmet precondition in browser | Pending |
| F5 | Changes after SSR cursor, hidden/disposed stop, bounded queue, reconnect recovery, no overlap | Pending |
| F6 | Build-time Nuxt Module capability registration; runtime JS/SFC/module injection rejected | Pending |
| P1 | Adopted definitions -> adopted sem-lang binding -> authorized capability -> assertion -> CLI/read/UI exact value and revision | Pending |
| P2 | Role ownership isolation, references instead of copies, short-term explicit promotion | Pending |
| P3 | HAT preview/install/adopt/bind/grant/remove independence; provider data not erased | Pending |
| P4 | Unified language revision, unknown/unavailable information remains visible and typed | Pending |
| P5 | Delete old authorities and generic Console runtime; all production paths use archives | Pending |

## Execution order and release

1. Inventory and failing tests (this document, contract tests, independent Playwright scenarios).
2. Zixcel interaction types / validators; NuxtJP declaration registry and snapshot runtime.
3. Crowsi transport; independent fixture acceptance F1-F6, including production Nuxt build.
4. Only then: Hatter meanings/bindings/assertions/roles, old profile replacement, HAT lifecycle.
5. Console scene migration and physical deletion; full product P1-P5 acceptance.

Each repository owns its tests. Consumers use immutable 0.10.0 Cargo `.crate` / NPM
`.tgz` artifacts through the local registry, with digest-pinned resolution. No
cross-repository source imports, compatibility aliases, silent fallback or dual
writes. Do not treat pending gates as successful or start Hatter replacement
before F1-F6 pass. No release generation is switched before product acceptance.

Memory policy belongs to sem-lang. Presentation documents contain no semantic
definitions. sem-lang SemanticBindings refer to exact adopted definitions but
cannot silently adopt them or grant execution. The fixture's domain records must not become a second
production profile model.

## Implemented and verified in this work

- Added zixcel-interaction 0.10.0: bounded typed values, resource/action/change
  contracts, exact invoke preconditions and seven structured outcome variants.
  Four Rust scenarios and two JavaScript wire-guard scenarios pass. Rust clippy
  with warnings denied and Cargo packaging also pass without warnings.
- Added Crowsi interaction transport 0.10.0: bounded serial JSONL process channel,
  Web Request adapter, HTTP client and sequential cancellable change polling.
  Six transport scenarios pass (timeouts, abort, reaping, queue/byte limits,
  origin rejection and status-independent result preservation).
- Rebuilt NuxtJP's declaration core at 0.10.0. Added logical nodes, resource
  snapshot validation, SSR/hydration surface, Nuxt UI input/table/action/feedback,
  build-time Nuxt Module renderer registration and transient revision-bound drafts.
- Physically deleted eight obsolete display-only files: old types, guards, fixed
  icon vocabulary, renderer, stylesheet, JSON schema and two old test sources.
  Removed unused AJV and module-builder dependencies. The new archive contains
  no legacy renderer/schema. Four combined contract/registry scenarios pass.
- Two combined independent Playwright scenarios pass against production Nuxt and
  a registry-built Rust executable. They cover initial reads, exact stored values,
  live fields/new page/collection/action, module rendering, stale contract rejection,
  distinct users/roles and mobile-width overflow. They are not full product E2E.
- An additional real browser test first exposed an empty newly-added field while
  editing. The renderer now merges new fields without losing edits or upgrading
  the original write preconditions. This regression test passes.
- Warning-sensitive build/browser reports are in ../.results (generated, ignored).
  Production fixture output is approximately 5.6 MiB. This is not Hatter's release
  size. No Hatter release generation or user state was changed.

## Feedback-phase fixture follow-up — verified

The six fixture gaps requested by the feedback phase have executable coverage in
the same two combined browser scenarios, using immutable 0.10.0 archives:
operation-specific input fields, complete typed read-failure variants, actual
hidden-tab traffic stopping/restarting, interrupted Rust backend reconnection,
authorization before receipt replay and executable declaration injection rejection.
The hidden test first failed because Playwright forces visibility; its isolated
native Chromium uses the public CDP `noDefaults` option. It then found missing
hidden notifications with traffic still running. The generic Crowsi watch now
checks a caller-supplied lifecycle predicate before each next request as well as
honoring cancellation; the Nuxt host supplies visibility/disposal/scope conditions.
No Hatter-specific polling or visibility shim was introduced.

Nuxt unit tests (five), type checking, build, Crowsi tests (seven), handler Clippy
and the warning-sensitive production browser run pass. The latest fixture run
completed in approximately 17 seconds; output remains 5.6 MiB. These observations
do not close all C1–C3 algebra combinations or any Hatter product gate.

## Explicitly incomplete — do not report these as completed

1. Shared Rust/JavaScript conformance vectors for the complete bounded schema
   algebra and all resource-level unavailable/read-only combinations. The tests
   above verify concrete action/read failures, not every possible schema.
2. Hatter migration remains: real adopted definitions, exact
   adopted sem-lang bindings, assertions/provider references, stable role ownership,
   HAT adoption/grant lifecycle, unified language revision and Console migration.
3. Hatter profile_catalog, synthetic semantic_views, profile_store authority and
   generic Console logic remain intentionally pending replacement acceptance.
4. Full Hatter product E2E and release switching remain unexecuted. Successful
   fixture/component tests must not be interpreted as satisfying those gates.

These are implementation/verification tasks under the accepted policy, not new
requests to decide ontology categories or retention periods. Do not begin Hatter
data migration until the independent fixture gate is complete.
