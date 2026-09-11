# Learning Studio: unpublished implementation review

Direction A was approved on 11 September 2026. This is the first integrated implementation slice from the approved design package, not completion of the entire exercise roadmap. The production baseline is version 7, commit c6a1e72ea6448b19526f5cf1020a892939a0106e. Publication and live-data changes are not authorized by this slice.

## What is implemented

Today has the approved warm-paper composition: one saved lesson or next lesson, the original still fox, a compact review invitation and a next idea. The sentence workspace is centered at 680px and removes the old orientation rail. Examples disappear before entry, draft saves do not remount the input, and help is voluntary. The main destinations are Today, Learn, Practice and Words; progress and settings remain in the account menu and conversation remains available from Practice.

Words includes search, encountered/saved/due/all filters, account-saved bookmarks, source lessons, available forms, a source-linked example and specific evidence. Practice offers the same due sessions used by Today, open lesson review, word-to-sentence practice and the existing conversation feature. Word recall uses the existing lesson renderer and persistence pipeline. It is not a separate flashcard score or a second progress account.

English remains the interface and explanation language. All seven target languages retain their existing scripts, input paths, course content and free access. The first structured vocabulary collection is drawn from the 21 guided openings, not an asserted extraction of every word in all 209 lessons.

| Target | Existing lessons | Structured senses | Word-to-sentence sequences |
|---|---:|---:|---:|
| German | 39 | 19 | 5 |
| Spanish | 25 | 15 | 4 |
| French | 25 | 20 | 6 |
| Hindi | 25 | 15 | 6 |
| Mandarin | 30 | 15 | 5 |
| Japanese | 35 | 17 | 4 |
| Kannada | 30 | 17 | 6 |
| Total | 209 | 118 | 36 |

Each new sequence is word and example → meaning recognition → word recall with cues closed → source-linked sentence → feedback → saved evidence → scheduled return. Return sessions begin with recall before an example. The word is connected to a taught use; opening the source lesson remains possible throughout. The other proposed exercise families and richer practice banks remain subsequent implementation work.

## Shared evidence and answer handling

The Worker owns accepted answers, variant matching, session advancement and evidence. Public steps still use an explicit allowlist. The only new public assessment discriminator is `responseMode: 'word'`; it does not expose private variants, hints or target keys.

Existing recognition, supported sentence construction, new independent combinations and later pattern retrieval remain separate. New `word-recalled` and `word-retrieved` events never set sentence independence. Words also reports contextual use from successful newly recorded lesson sentences. Past completion is not converted into lexical mastery. Historic events without the new target tagging remain intact; their lexical use is not backfilled as an invented fact.

The word collection records delivery before rendering answer-bearing rows. Opening an example records its semantic exposure before returning it. Opening Words during an active exercise records support for that language. Unrecognized alternatives remain unassessed; revealing a word cannot earn unaided lexical-recall credit. Native-script and romanized input retain their existing modality record. Tone accuracy, pronunciation, handwriting and spontaneous conversation are not measured by these checks.

Word review shares the existing reminder policy: at least 24 hours must separate the relevant prior exposure and a delayed attempt; both word recall and sentence retrieval must succeed without support before a word sequence advances to the 3/7/14-day stages. Immediate practice remains open and does not extend the interval. The current conservative policy schedules a one-day reminder after supported or immediate rounds. This is a provisional combined sequence reminder, not the proposed fully calibrated scheduler with independent intervals for every sense, form and modality.

The German checker no longer accepts an indefinite article before a language name in the taught learning pattern, such as “Ich möchte ein Englisch lernen.” New German activities are version 2.0.1. Versions 1.0.0 and 2.0.0 remain readable. The correction applies to future checks; historical attempts are not rewritten. New events record the checker revision.

## Contracts and safeguards

| Boundary | Behavior |
|---|---|
| `GET /api/words?language=de` | Owner/language-scoped read projection, no mastery or exposure write |
| `POST /api/words/exposure` | Bounded known sense IDs; records word delivery and, if requested, example exposure; example returned only after save |
| `POST /api/words/:senseId/bookmark` | Atomic owner-scoped JSON addition/removal; duplicate save does not duplicate a bookmark or replace other settings |
| `POST /api/learning/start` | Existing route; new stable `word-<senseId>` IDs use the same owned session and version contract |
| Session event route | Existing UUID retry, optimistic version checks and atomic event/session updates; assessed saved text is recorded even when the request omits a redundant answer |
| Successful client save | Invalidates Today/Practice summary and Words projections after acknowledgement |

No SQL migrations, schema edits, backfills, production writes or deployment occur in this phase. The existing D1 session/event/exposure tables and the existing preferences JSON field are used. Account deletion continues to remove owner data through the existing model. Language progress reset removes that language's sessions and exposures; a bookmark is a preference, not a claim of learning.

The 36 delivered word sequences are frozen in `worker/curriculum/word-practice-v1.json`. The generator in `worker/word-content.ts` provides source mappings and future authoring candidates; it must not silently replace the delivered bank. Future revisions must add a versioned bank and retain lookup of previous content versions. German 2.0.0 has a retained source module. Unknown saved versions continue to preserve the draft and report a restoration requirement.

Source changes are isolated from the deployed application. The dependency manifest and lockfile, hosting identity, all nine existing migration files and all 28 tracked public files, including the fox assets, are unchanged. No new animation runtime, paywall, streak penalty or practice limit is added. Authored word practice makes no paid-model request.

## Component provenance and visual rules

All matching controls reuse the existing pinned components. The 19 source hashes in `component-sources.json` were verified unchanged. No imported component file or upstream license text was modified. Product-specific composition and state remain application code.

| Use | Existing source |
|---|---|
| Today and practice surfaces | Watermelon Card/Header/Content/Footer and Button |
| Word search and filters | Watermelon Input, Label and Select |
| Word detail | Watermelon Dialog; explicit restoration to the row opener |
| Recognition and typed recall | Watermelon Radio Group and Textarea |
| Help and feedback | Watermelon Alert; existing support classification |
| Navigation | Watermelon Navigation Menu and Motion Primitives Animated Background |
| Theme and retained welcome action | Existing Kokonut components |

Direction A uses #F6F2E9 paper, #FFFEFA surfaces, #243C36 ink and #994325 primary actions. English display headings use the system serif stack; instructions and target scripts retain system sans text and generous script leading. Decorative borders use #C8CDC2; essential control borders use #768176. Large surfaces use about 20px corners and controls about 10px. The single final stylesheet is updated rather than adding another theme layer.

Selected solid-pair calculations: ink/paper 10.59:1, muted text/paper 5.21:1, action text/terracotta 6.54:1, control border/surface 4.02:1; dark muted text/surface 7.74:1 and dark action text/action 6.58:1. These are token calculations, not a rendered accessibility audit. Responsive rules cover compact word rows, stacked actions and normal-flow sentence entry. They require device verification.

## Verification and remaining gates

The automated suite passes 55 tests, including the 48 retained tests and new word-collection, bookmark, seven-language flow, delayed-review, reveal/unknown and saved-answer evidence regressions. TypeScript and the production client/Worker build pass. These are synthetic API tests over real SQLite and source/build checks, not a live learner or cross-device login trial.

The supported preview started, but the browser reported `net::ERR_BLOCKED_BY_CLIENT` before loading it. No alternate browser route or production URL was used to bypass the block. Actual desktop/mobile composition, 200% text scaling, phone keyboard occlusion, live IME composition, dialog focus, screen-reader announcements and reduced-motion behavior remain unverified. This revision must not be called visually validated or ready for publication on the strength of its build alone.

All new vocabulary records and word sequences remain awaiting qualified language review. That includes lexical sense/form tagging, naturalness, register, romanization, distractors and context appropriateness. The remaining proposed exercise families, audio assets, broader lesson-bank mapping, detailed form/modality scheduling, learner evaluation and clean held-out transfer assessment are not complete. The primary-research rationale and evaluation safeguards in the approved design package remain in force; vocabulary recall and engagement are not evidence of spontaneous proficiency.

Next review gate: inspect Today, an active sentence task, Words/detail and Practice on desktop and mobile in both themes; then obtain language/content review. Publication requires a separate user instruction. No live data migration is necessary for the current slice.
