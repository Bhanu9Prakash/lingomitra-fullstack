# Validation record — 9 September 2026

Software checks completed for the learning foundation implementation. These are synthetic tests and source/build inspection, not participant results.

| Check | Result and scope |
|---|---|
| Test suite | 35 passed, 0 failed, 0 skipped; Node test runner with actual SQLite SQL and a D1 transport adapter |
| Legacy regression | All eight original tests still pass; stable identity, account isolation, progress, conversation/admin authorization, concurrency, deletion, no-model fallback and service-worker exclusions |
| Populated-data migration | Apply the first two migrations, insert an existing account and progress, then apply 0002; account key, serialized progress and version remain unchanged |
| Three complete authored lessons | Every teaching/attempt/finish transition exercised; at least two independent combinations each; required target words appear in preceding supplied words/examples |
| Assessment integrity | Wrong meaning/order/form do not pass; natural bounded variants accepted; baseline, reveal and assisted recognition excluded from new independent evidence; keys absent from public step |
| Review | Immediate repetition remains open without delayed credit; back-to-back review does not masquerade as delayed retrieval; support retains one-day interval; new-context evidence requires no support |
| Saved work | Separate authenticated requests resume saved state; stale saves rejected; concurrent replay returns the newest checkpoint; retry preserves newer typing; recovery records retain step identity; hidden time excluded |
| Ownership/deletion | New session, event, draft and usage rows cascade on account deletion; another account remains intact; language reset scoped correctly |
| Optional AI and speech | Stubbed 20-call daily boundary; core starter still available; transcript endpoint sends no tutor message; oversized headerless audio rejected before quota/provider use |
| Preferences | Concurrent independent updates preserve one another; explanation language is restricted to actually supported English |
| TypeScript | `tsc --noEmit` succeeded after final product changes |
| Production build | Required Sites build helper succeeded; Vite static assets and compatible Worker generated; no build errors |
| Compiled Worker | In-memory requests to six public and seven protected representative routes return HTML/appropriate sign-in redirects; compiled starter endpoint and 39-lesson German catalog respond correctly |
| Catalog preservation | All 209 lesson IDs, language codes and order indices match the earlier inventory exactly; original lesson files retained |
| Original assets/configuration | Git object hashes match baseline for all five original mascot PNGs, hosting manifest and the first two migration files |
| Client bundle boundary | No `correctOption`, held-out review step keys or OpenAI/Gemini credential variable names in built client JavaScript; assessment module remains server-only. This is a focused check, not a security audit |
| Selected contrast calculations | Light primary 6.67:1; dark primary 8.17:1; light muted text 6.14:1; dark muted text 9.86:1. Specified solid-color pairs only, not all rendered states |
| Whitespace | `git diff --check` passed |

The build warns that the existing Browserslist dataset is old and npm's existing proxy environment option is deprecated. Neither failed the build. No dependency refresh was added solely to silence these warnings.

An initial asset hash check exceeded a child-process output buffer; it was rerun using Git object hashes and passed. This was a verification-script problem, not an application failure.

Browser access remains unavailable under the previously reported environment policy. Real mobile rendering, focus/keyboard behavior, screen readers, 200% text, microphone consent/cleanup, actual IME input and production synchronization require device validation. API simulations do not replace those checks. Qualified teacher review and beginner studies, including 24-hour/seven-day follow-ups, have not been performed. The application displays pending human-review status.

No production deployment, database mutation, external provider billing test, human-review certification or learning-gain claim is recorded here. See implementation-status.md for rollout, failure recovery, cost assumptions and the remaining roadmap; see pilot-teaching-and-evaluation.md and german-pilot-script.md for the teaching/evaluation details.
