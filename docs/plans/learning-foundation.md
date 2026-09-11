# LingoMitra implementation, 9 September 2026

Approved scope: improve the complete existing site, implement the inspected design and German pilot. Source baseline: 5de326a. The detailed design and site inventory were delivered before implementation.

## Global constraints

Preserve all 209 lesson IDs, saved completion, ChatGPT identity, D1/R2 bindings, admin/contact/blog functionality, free unlocked access and the existing fox assets. No subscriptions. No claim of human review, fluency, validated pronunciation or measured learning gains. Only the Site owner edits the checkout. This retained checkout and feature branch are the implementation surface. No deployment without authorization.

## Task 1: Learning foundation

Add versioned, authored German starter activities linked to existing lessons 01, 06, 09. Server-side validators distinguish target success, meaning, order, form, spelling and valid alternative uncertainty. Hide model answers until help or attempt. Save account-scoped drafts, immutable attempts, exposures and assistance; derive ability without reclassifying old completion. Use additive generated migrations. Review combines retrieval with the same taught ingredients. Avoid requiring AI or microphone. Validate ownership, migration preservation, retry idempotency, concurrent drafts, assisted vs independent evidence, prerequisite warnings and answer variants using real SQLite and domain tests.

## Task 2: Learning interface and navigation

Implement the three scripted lessons, quiet optional fox, typed practice, optional listening, progressive help, immediate answer reveal, retry and a new task. Record arrival and active foreground time separately without timers. Preserve partial answers across tutor toggles, reloads and devices. Add Today with resume/review and ability summary; keep Learn as unrestricted catalog. Existing notes and all lessons remain accessible. Replace generic unvalidated success claims with honest self-practice and saved drafts. Explain English as the teaching language, allow known-language preferences without pretending translated curricula exist.

## Task 3: Site-wide repairs

Fix unsupported public claims and broken About CTA, duplicate footer, blog theme, install interruption, health diagnostics, IME submission, microphone consent/transcript uncertainty. Bound optional AI use and explain failure with a usable core fallback. Correct verified starter content defects in French, Mandarin, Hindi and Japanese with explicit supplied prerequisites; record pending teacher review. Keep global controls mobile-friendly and respect reduced motion. Ensure progress errors are not shown as zero achievement.

## Task 4: Validation and handoff

Run meaningful new tests and the eight baseline tests, TypeScript and production build. Review generated migrations and curriculum dependencies, verify client answer-key exclusion. Browser QA was blocked by environment security during inspection; do not bypass. Separate static/software checks from outstanding real-browser and human learning validation. Save implementation in the existing Site source repository and a saved version; do not publish unless asked. Record final evidence and rollout instructions in docs/implementation-status.md.

## Decisions and progress

- The Sites ownership requirement takes precedence over delegated implementation. A bounded independent review may be delegated; source changes stay with the owner.
- Existing courses become honest self-practice immediately; they are not automatically recertified by AI. The German pilot supplies the initial authored assessment.
- A public first taste can be device-local practice; account ability requires a fresh authenticated assessment. No anonymous claim becomes verified account evidence.
- Human German and other-language review, formative learners, delayed follow-ups and production cross-device checks remain real validation work, never invented results.

## Shared interfaces / consistency check

| Tasks | Interface | Resolution |
|---|---|---|
| 1 / 2 | Authored step JSON and session API | Server owns progression, hints and grading; client renders the current step only. |
| 1 / 3 | Preferences, limits, deletion | Additive user settings; account deletion cascades all new rows. |
| 2 / 3 | Layout, mascot, navigation | One shared companion preference; preserve essential instruction when hidden. |
| 1 / 4 | Migrations and API tests | Generate schema-only migration; run legacy plus new SQLite tests. |
| 2 / 4 | UI and mobile QA | Compile and inspect responsive code; report browser limitation honestly. |
| 3 / 4 | Content and claims | Correct only evidenced defects; pending human review remains explicit. |

Tasks 1–3: implemented. Task 4: 35 software tests, TypeScript, compiled Worker checks and production build passed. Browser and human teaching validation remain outstanding. Implementation, exact pilot scripts, schema example and validation results are in the accompanying docs. Save the tested source and build before handoff; publishing remains a separate authorized step.
