# LingoMitra: implemented learning foundation

9 September 2026. This follows the delivered evidence-based audit, complete-site inventory and German pilot design. The user approved implementation across the existing site. Publication is a separate action; this document does not report a deployment.

## What was inspected

The source baseline was `5de326a97cb71492af1484ac716993c51cad273e`, matching the existing saved Site. Inspection covered all 18 original route patterns, shared learning and account flows, Worker APIs, schema, hosting manifest, catalog generation, mascot components/assets, the complete text of the first lesson in each language, deeper selected German lessons, and the structural inventory of all 209 lessons. The earlier audit records exact research sources and inspection depth.

The public web reader could not retrieve the supplied site. Browser inspection was blocked by environment policy; it was not bypassed. Production learner rows, actual provider credentials/overrides, invoices, support-mailbox operation, live blog records, microphone behavior on real devices and real cross-device synchronization were not inspected. Source-supported changes below are not browser observations. No teacher review, participant study or comparative learning gain is fabricated.

## Implemented scope and evidence

| Area / observed learning problem | Implemented change | Rationale | Effort | Success measure / status |
|---|---|---|---|---|
| Shared generic prompts counted nonempty text as success across all courses | All original courses now offer saved, language-aware self-practice without an accuracy score. Three authored German activities have bounded sentence assessment | Completion cannot establish meaningful production | L | Original 209 IDs preserved; wrong meaning cannot earn pilot evidence; tests pass |
| German opening combined too many prerequisites | Narrow request → action at end → polite question pilot, linked to existing lessons 01, 06 and 09 | Recombine a small set before adding a contrast | L | Three full scripts complete in API tests; every required target word supplied before use; human review pending |
| Models, hints, prior knowledge and retries could contaminate independence | Server-owned current step, exposure keys, baseline check and assistance log; no future keys in client response | Reserve independent evidence for a new unassisted combination of taught elements | L | Baseline, reveal, recognition, feedback and retry tests pass |
| Today and Learn opened the same catalog | Today resumes drafts and suggests reviews; Learn retains every unlocked course | Shorten return-to-use without blocking exploration | M | All-course overview and Japanese-draft resume tests pass; browser task test pending |
| Tutor switching discarded local work | Guided tutor panel preserves runner; legacy lesson stays mounted; account drafts and conservative assistance logging | Asking for help must not erase work or create false independence | M | Draft/version/replay tests pass; real modal/keyboard testing pending |
| Review relied on self-rating; immediate repeats could overstate retention | German review grades constructions; delayed evidence requires at least 24 hours since previous relevant practice; original review remains labelled self-practice | Retrieval and confidence are different observations | M | Immediate/back-to-back/delayed/support-sensitive spacing tests pass |
| Profile equated percentage with language level | Specific ability evidence above readable completion rows; remove “Nearly fluent” and “Multilingual Master” labels | Avoid claiming proficiency from activity | S–M | Source labels corrected; no fluency inference remains in this component |
| Voice immediately sent uncertain transcripts to the model | Consent → record → editable transcript → explicit Send; typed path preserved; no pronunciation grade | ASR error is not necessarily learner error | M | Transcript-only API and bounded-upload tests pass; real microphones pending |
| Optional model use was unbounded per account | Daily limits: 20 chat calls, 5 voice clips, 10 cloud speech calls; token monitoring; shorter context history | Keep authored learning independent of variable AI spending | M | Provider stub called exactly 20 times before limit; authored lesson still works |
| Inconsistent copy and support pages | Repair About/FAQ claims, About CTA, duplicate blog footer/theme, obsolete WebSocket health check and intrusive install offer | Trust and discoverability support learning | S–M | Source and compilation checks; device checks pending |
| Multilingual starter defects and input limitations | Correct evidenced French, Hindi, Mandarin and Japanese examples/prerequisites; guard IME composition in chat and roleplay | Avoid requiring unexplained forms or submitting unfinished characters | M | Catalog regeneration passes; qualified review and real IME testing pending |
| Repeated mascot motion / inconsistent guidance | Keep the five original PNG poses and logo; static lesson use, optional commentary, specific feedback | A cue should help the learner think without taking over | S–M | No new artwork or identity; reduced-motion and quiet-state source rules present |
| Errors could look like an empty/reset account | Explicit retry and unsaved/conflict states; shared progress overview; recovery buffer | Retain learner work and communicate actual persistence | M | Ownership, idempotency, concurrent settings and conflicting writes tested |

All 209 original lessons remain: German 39, Spanish 25, French 25, Hindi 25, Chinese 30, Japanese 35, Kannada 30. Original Markdown is retained, with only the documented starter corrections. The complete site uses the new common experience; the remaining 206 lessons have not been rewritten into human-reviewed assessment scripts.

## Architecture and preservation

The existing React/Vite SPA and Cloudflare-compatible Worker remain. Existing Sites `DB` (D1) and `BUCKET` (R2) bindings remain. The Worker uses the dispatcher's trusted stable ChatGPT identity; neither email nor browser-supplied identity replaces the account key. Existing blog, admin role checks, contact storage, chats, conversation history, uploads, resets and deletion remain.

| Responsibility | Source / behavior |
|---|---|
| Authored curriculum and explanations | `worker/learning-content.ts`, activity/version IDs and `awaiting-human-review`; reference courses remain in `server/courses` |
| Sequencing and current checkpoint | `worker/learning.ts`; server validates permitted transitions and keeps assistance/exposures |
| Validation and targeted feedback | `worker/learning-validator.ts`; bounded semantic slots and accepted surface variants; unknown answers are unassessed |
| Client interface contract | `shared/learning.ts`; excludes assessment targets, answers, hints and exposure keys from initial teaching payload |
| Resume and review | `learning_sessions`, `learning_events`, `lesson_drafts`; existing `user_progress` retains legacy interpretation |
| Optional AI | Existing chat/roleplay APIs with exposed teaching context, explicit new-item instruction and daily allowance |
| Operations | Admin-only learning operations endpoint and panel: attempts, current content status, request/token counts |

No unrestricted chatbot owns the curriculum or mastery decision. Authored content and deterministic feedback require no model key. The optional tutor is instructed to stay within exposed teaching, but prompt instructions are not a guarantee: its output remains unassessed help and records support. Free roleplay can introduce at most one explicitly explained item before use. Any future generated assessed exercise needs schema validation against known vocabulary/structures and an author-approved target before display.

`drizzle/0002_powerful_ted_forrester.sql` adds user preferences and four new tables. It does not drop, rename, renumber or reinterpret original lesson/account rows. Tests apply this migration to populated legacy accounts and verify unchanged progress JSON, account identity and row version. New tables cascade on account deletion; a language reset clears that language's learning sessions/evidence/drafts and preserves other languages/accounts.

An event UUID makes a successful retry idempotent. Compare-and-swap versions reject stale saves; conditional event inserts and session updates execute as a batch. A replay re-reads the latest checkpoint. Unsent guided text has a separate account/activity/step-scoped device recovery record, expiring after 24 hours; it is not silently discarded on the next load. Server-saved drafts resume on a separate authenticated request. This simulates the persistence contract, not production device testing. Unsaved legacy self-practice text remains in the mounted page during a failure, with a leave-page warning; a forced reload before saving can still lose that unsaved legacy text.

## Rollout and recovery

1. Before production publication, confirm the hosting platform's database backup/restore capability and take a recoverable snapshot through its supported controls. No production data was changed during implementation.
2. Deploy the saved source/build with the additive generated migration. Preserve both existing logical bindings and runtime configuration. No new external service is required for core learning.
3. Check the existing account on two actual devices: preserve an old completion; save half a German sentence; resume the same step/answer elsewhere; request a hint; reload; confirm support survives; finish; reopen a review. Check another account cannot read it.
4. Test cancellation, no model key, exhausted allowance, missing audio voice, microphone denial, transcript failure, session expiration and a stale concurrent save. The useful recovery route is typed authored learning or original course self-practice.
5. If application rollout fails, return to the previously verified application build while retaining the additive schema and new data. Do not reverse/drop the new tables as an automatic rollback. Export relevant diagnostic status without learner answers or credentials.
6. Content changes must get a new version. Retain old authored versions in the activity registry while any saved session references them. The current release has only version 1.0.0; the lookup fails safely if a required version is absent. Do not simply edit a published version in place.

## Free operation and data

No subscription, paywall, checkout or upgrade flow was added. The legacy subscription URL still redirects to the free catalog. All authored hints, sentence checks, typed practice and saved learning work without paid model calls. Optional voice playback falls back to device speech; text is always available. Device voice quality/language availability varies and is not a validated pronunciation reference.

Provider prices were verified in the earlier audit on 9 September 2026. At the [GPT-4.1 mini rates](https://developers.openai.com/api/docs/models/gpt-4.1-mini), four calls of 1,500 input / 150 output tokens cost `4 × (1500 × $0.40 + 150 × $1.60) / 1,000,000 = $0.00336`. Adding two minutes at the documented `gpt-transcribe` estimate of $0.0045/min gives $0.01236; see [provider pricing](https://developers.openai.com/api/docs/pricing). These are scenarios, not measured LingoMitra bills. Actual prompts can be larger. Core learning has zero per-session model calls, not zero total operating cost.

Use `(all paid calls, including retries and abandoned starts + hosting/storage + amortized content/review cost) / completed sessions` for operational cost. No hosting invoice, allowance or human-review quote was verified. Admin request and text-token totals support cost checks; actual transcription/audio token costs still require provider usage/invoices. Set provider-side budget alerts/limits through the real provider account. Those external settings were not changed. Per-account limits reduce abuse but do not alone bound total site spending; model failures can consume a reserved allowance. No silent larger-model fallback is introduced.

Authored content is bundled once; device teaching audio uses no provider call; replay of a returned audio clip is cached only in memory. Do not put private chats/answers in shared caches. No raw voice recording is persisted by LingoMitra: it stays in page memory until discarded/submitted, and submitted audio is sent to the configured provider. Provider retention terms were not audited. Learners see consent and transcript uncertainty before recording/sending. Account deletion removes stored answers, sessions, chats, preferences and usage rows. No third-party analytics collection was connected; saved learning events are first-party operational records. Research participation and data export need separate informed consent.

## Software validation versus learning validation

- 35 automated tests passed: the eight original regression checks, populated-data migration, server/SQLite learning behavior and client recovery/timing helpers. AI responses use stubs, not paid provider calls or fake learner results.
- TypeScript and the production build are checked separately. Final build/package checks are recorded in `validation-record.md`.
- Source checks cover mobile layout rules, minimum sizes for essential lesson controls, accessible names, focus movement, IME guards, static mascot behavior and reduced motion. This is not a WCAG conformance claim.
- Still required: browser rendering at 320/375/768 px, keyboard/screen reader use, 200% text, mobile keyboard obstruction, touch/audio consent, actual cross-device persistence, qualified German and other-language review, formative beginner observations and delayed follow-ups.

The earlier bounded static review identified eight problems in retry recovery, baseline credit, delayed review, assisted recognition, recovery lifetime, time accounting, answer variants and concurrent replay. These were corrected with focused regression coverage. No fresh independent review verdict is claimed.

## Remaining prioritized work

| Priority | Work | Effort | Acceptance |
|---|---|---|---|
| P0, before claiming validated teaching | Teacher/proficient-speaker review of the three scripts, prompts, accepted variants, register and optional voices | M | Named reviewer, date and version; resolve errors before changing review status |
| P0, rollout verification | Actual mobile, keyboard, screen-reader, IME, voice denial and two-device tests | M | Record devices and results, including failures; preserve legacy records |
| P1, formative | 6–8 true beginners; instrumented start and delayed tasks; optional companion comparison | M | Fix confusion without claiming superiority |
| P1, next curriculum slice | Authored German lessons 4–10; reuse existing content under stable linked IDs | L | Prerequisite audit, held-out taught combinations, human review before scale |
| P1, each other language | Prioritize frequently reached lessons and reported issues; redesign explanations for the language pair | L | Teacher checks and language-specific validators; English remains actual teaching language |
| P2, research comparison | Randomized equivalent-content comparison, 24-hour and seven-day follow-up | L | Prespecified outcomes, power/precision rationale and transparent attrition |
| P2, operations | Real cost/session analysis, provider budget settings, generic reviewed audio reuse when justified | M | No lesson gate; total and marginal cost estimates based on actual usage |

The central acceptance question remains: can the learner produce a meaningful new combination with progressively less support? Completion counts and this software release cannot answer it by themselves.
