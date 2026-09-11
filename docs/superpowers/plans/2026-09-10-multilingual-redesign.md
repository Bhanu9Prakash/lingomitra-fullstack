# LingoMitra multilingual redesign implementation plan

> Execute inline as the sole Site editor. The Sites workflow requires one owner for source edits. The user approved the design, requested a quieter visual treatment, and has not authorized publication.

**Goal:** Deliver the approved opening curriculum for all seven languages with honest production evidence, saved progress, and a restrained visual system that supports the existing fox.

**Architecture:** Extend the existing React/Worker/D1 lesson engine. Keep authored keys on the Worker, language-specific validators separate from interactions, and all historical lesson versions readable. Add exposure and request records without rewriting legacy progress.

**Tech stack:** React, TypeScript, Vite, Cloudflare Worker, D1 SQLite, existing account integration.

**Spec:** Approved `LingoMitra_All_Language_Design.md` and the seven language appendices from the 2026-09-10 audit. The neutral visual correction supersedes the warm wireframe palette.

## Global constraints

- Seven targets: de, es, fr, hi, zh, ja, kn. English explanations and interface.
- Keep all 209 legacy lesson IDs and saved account data; every lesson remains unlocked and free.
- Preserve all five fox images and the logo. No mascot speech or motion during sentence entry.
- Never ship answer keys in assessment responses. Hints, reveals, corrections and external help count as assistance.
- Separate novel production, supported work, repeated work, delayed retrieval and script modality. No fluency promises.
- Human content review and learner pilots remain outstanding. Software checks do not replace them.
- Save an unpublished version; do not deploy.

## Task 1: Representative visual slice

Files: `client/src/components/Hero.tsx`, `client/src/learning-workspace.css`, `client/src/taste-refresh.css`.

- [x] Replace the brown paper palette with neutral white/gray surfaces and charcoal type; reserve orange for a small brand accent. Reduce border radii, shadows and ornament.
- [x] Replace the floating mascot diagram with a simple welcome composition and language entry. Reuse the fox image at a smaller size.
- [x] Start the supported supervised preview for the requested visual/browser QA. Inspect the representative page before expanding changes. Infrastructure failure is documented, not hidden.

## Task 2: Seven authored pathways

Files: `worker/curriculum/*`, `worker/learning-content.ts`, `worker/learning-validator.ts`, `shared/learning.ts`; tests `tests/multilingual.test.ts`.

- [x] Add a failing test asserting three current activities per target, legacy links unchanged, a complete start/attempt/review sequence, and no answer keys in `publicStep`.
- [x] Preserve German 1.0.0 and adapt the approved original scripts into 21 authored activities with separate prompts, hints, accepted variants, misconceptions and review tasks.
- [x] Implement normalization per language, native/romanized modality reporting, meaningful short answers, uncertain judgments, and semantic keys that ignore politeness/punctuation variants.
- [x] Verify positive variants, plausible misconceptions, help branches and different tasks after correction for all seven targets.

## Task 3: Learning evidence and persistence

Files: `worker/learning.ts`, `worker/index.ts`, `worker/progress.ts`, `db/migrations/*`, `shared/learning-client.ts`; tests `tests/learning.test.ts`, `tests/migration.test.ts`.

- [x] Add regression tests for selected-language summaries, completed prerequisites during review, support before the first session, duplicate events, account boundaries, and historical versions.
- [x] Store language/material exposure independently of a session; classify unsupported or uncertain exposure conservatively. Keep curriculum versions separate from historical events.
- [x] Preserve completion history when opening review; use language-scoped recommendation/resumption and tolerate missing archived content in summary.
- [x] Add an idempotent atomic legacy finish operation and recovery-safe mutations. Keep migrations additive.

## Task 4: Public and signed-in learning flow

Files: `client/src/pages/TryLanguage.tsx`, `GuidedLesson.tsx`, `Today.tsx`, `LanguageSelection.tsx`, `LanguageDetail.tsx`, `LessonView.tsx`, `client/src/components/Hero.tsx`, `LessonContent.tsx`, `LessonAudio.tsx`, `client/src/App.tsx`, `worker/public-learning.ts`.

- [x] Serve bounded, stateless public starter interactions for each language, with no account or AI dependency. Record local practice separately from saved evidence; carry exposure on sign-in conservatively.
- [x] Generalize course navigation, input language, audio locales, romanization support, and first-session entry. All seven use the same complete interaction components, with language-specific content.
- [x] Keep the mascot still/silent on attempt screens. Provide optional help and reveal, explicit uncertain feedback, and a different next task after correction.
- [x] Implement IME composition guards, focus after transitions, wrapping, keyboard-open layout rules, screen-reader status, reduced motion, and audio failure routes. Actual assistive-technology and device validation is outstanding.

## Task 5: Remaining content and operational safeguards

Files: affected legacy lesson Markdown, `worker/ai.ts`, `worker/chat.ts`, `worker/conversations.ts`, `worker/usage.ts`, `client/src/pages/Settings.tsx`, `docs/*`.

- [x] Apply the audit's demonstrated content corrections without changing identity/order keys or claiming human review.
- [x] Make service failures leave the core learning path usable. Prevent duplicate provider requests where retries would cause duplicate cost; retain existing quotas and account isolation.
- [x] Document the remaining curriculum improvement queue, per-language human review, formative evaluation, cost assumptions and release checks.

## Task 6: Verification and unpublished handoff

- [x] Run `npm run check`, `npm test`, and the supported Sites build script. Confirm legacy IDs against the inspected inventory.
- [ ] Actual browser/device QA remains blocked: the supervised preview ran, but the supported browser address returned `net::ERR_BLOCKED_BY_CLIENT`. No alternate browser route was attempted. Synthetic account checks passed; real account and device checks remain required.
- [ ] Save the reviewed source and an unpublished Site version, then hand off the revised visual and validation limitations. Stop before publishing.

## Checkpoint notes

See `docs/approved-design/implementation-status.md` for actual scope, all seven pathway statuses, migration/rollback safeguards, remaining work and validation limits. All new content remains awaiting qualified human review.

## Approved visual revision

- [x] Carry the approved standalone HTML direction into the actual welcome, all seven language choices, public and saved lessons, and return screen.
- [x] Reuse one lesson presentation component while keeping server-authored validation and account history intact.
- [x] Apply readable light/dark tokens, script-aware type, stronger input boundaries, and mobile layouts without fixed controls covering entry.
- [x] Keep theme selection usable before sign-in, correct the dark account avatar, and retain public language entry when switching as a guest.
- [x] Verify the TypeScript check, 48 existing tests and production build. No additional runtime dependency is needed.
- [ ] Actual browser/device and human pedagogical validation remain outstanding under the documented access limitation. They are not replaced by passing software tests.

The previously saved foundation and visual contract are Site versions 3 and 4. Save this source as the next unpublished version; publication remains separately authorized.
