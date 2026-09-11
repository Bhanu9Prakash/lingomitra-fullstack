# Approved multilingual implementation: unpublished checkpoint

Date: 2026-09-10. The user approved the multilingual design and requested a calmer color scheme around the existing mascot. This checkpoint implements the shared foundation and three authored opening lessons for each of the seven targets. It does not deploy the Site or run migrations against the live database.

## Visual correction

The revised interface uses white and cool gray surfaces, charcoal text and controls, a blue focus outline, and small orange accents. The existing fox remains unchanged. The arrival illustration is smaller and still; construction screens omit the mascot and visible examples. Legacy tutoring and roleplay surfaces use the same neutral controls. The previous warm brown/orange proposal is superseded.

The supplied HTML visual review contains labeled illustrations of arrival, teaching and sentence entry for all seven languages, plus a small-screen layout with an illustrative keyboard. It is not a capture of the running application.

### Approved HTML design integrated into the application

The subsequent approved visual revision is now implemented in the actual React screens. The welcome uses the same still fox, shorter copy, and compact method section. All seven languages appear as aligned rows in two columns on desktop and one column on mobile. Both public and account-linked lessons use the shared `LessonWorkspace`, with a desktop orientation rail and a single readable column on small screens. Sentence controls precede requested help and targeted feedback. The optional theme switch works before sign-in and remains usable if browser storage is unavailable.

The return screen shares the same type, surfaces and control hierarchy and continues to show actual language-scoped evidence. The global language selector identifies guided/public routes correctly, and guest language changes lead to the public starter instead of an account-gated course. Account-menu text now remains legible in the dark theme. Site descriptions name all seven targets and avoid an unsupported mastery claim. No new dependency, assessment content, account-data migration or mascot asset was introduced in this visual pass.

The HTML review's toolbar, simulated keyboard, sample answer checker and unscored preview labels are not copied into the product. The real Worker checker, account integration, retry behavior and saved progress remain in use. No raw speech storage or provider call was added. The production build and 48 automated tests pass for this revision; the existing browser/device and human-review limitations still apply.

## Implemented coverage

| Target | Three current opening activities | Legacy lessons retained | Software flow | Language review |
|---|---|---:|---|---|
| German | `de-starter-01`, `de-starter-02`, `de-starter-03` | 39 | Implemented and synthetic flow checked | Required |
| Spanish | `es-starter-01`, `es-starter-02`, `es-starter-03` | 25 | Implemented and synthetic flow checked | Required |
| French | `fr-starter-01`, `fr-starter-02`, `fr-starter-03` | 25 | Implemented and synthetic flow checked | Required |
| Hindi | `hi-checkin-001`, `hi-checkin-repair-002`, `hi-drink-habit-003` | 25 | Implemented and synthetic flow checked | Required |
| Mandarin | `zh.drink-choice`, `zh.drink-questions`, `zh.drink-stock` | 30 | Implemented and synthetic flow checked | Required |
| Japanese | `ja.table-identification`, `ja.confirm-and-correct`, `ja.order-at-table` | 35 | Implemented and synthetic flow checked | Required |
| Kannada | `kn-drink-choice-001`, `kn-small-request-002`, `kn-find-drink-003` | 30 | Implemented and synthetic flow checked | Required |

All teaching and interface text is English. Each activity has authored teaching, supplied ingredients, meaning checks, sentence attempts, targeted hints, voluntary answer reveal, subsequent tasks, and return practice. Hindi, Mandarin, Japanese and Kannada retain real script alongside temporary reading guides and accept scoped romanized variants. Typed script, romanized input and unassessed private speaking remain distinct.

German 1.0.0 remains an archive for existing sessions; current German activities are 2.0.0. Newly introduced activities in the other languages start at 1.0.0. Versions in the design document were proposals rather than deployed historical records. Activity identity remains separate from ordering and historical evidence.

Japanese Lesson 2 was adjusted during validation: its original transfer prompt reused a negative noun combination already practised. The replacement reserves an unseen negative combination and a different identity question. Replacing a topic expression or omitting it does not make an already used combination novel.

## Learning and persistence behavior

- Public entry offers all seven languages without an account. The stateless authored checker needs neither a database nor an AI service. Anonymous practice is not treated as verified account mastery.
- Signed-in learning stores language-specific sessions and evidence. Completed prerequisites remain complete when a learner opens review. Recommendations and resumption use the selected target language.
- Learner language selection is an account preference. Local draft recovery is scoped by account and lesson. Switching languages does not reset the other language's records.
- Accepted variants, misconceptions, assessment keys and hint ladders stay in Worker-authored content. A response sends only the current allowed step. Assessment views omit word banks, examples and unsolicited mascot dialogue.
- Typed answers are checked against finite authored variants. Unknown formulations receive a cautious unassessed response. The checker is not a general grammar judge or pronunciation assessor.
- Completion remains separate from independent production. Previous examples, attempts, answer reveals, recognized spontaneous combinations and in-app help affect evidence. First production is counted only for eligible, previously unseen combinations with no recorded assistance in the relevant run.
- The label says “without an in-app hint”; the product cannot detect off-device help or external exposure. Known-language prior checks reduce, but cannot eliminate, prior-knowledge confounding.
- A genuinely delayed eligible attempt can count as retrieval. An immediate replay cannot become delayed retrieval. New-context application remains a distinct evidence category, only awarded where the authored task explicitly supports it; it is not inferred from completion.
- Public-to-account exposure handoff is conservative. Known activity IDs suppress novelty for that previewed activity; an unknown older preview can suppress novelty more broadly.
- Optional tutor output and legacy reference access are recorded as help. This first implementation uses conservative exposure matching, not a complete delivery-acknowledgment protocol; uncertain help can undercount independent success. It does not establish perfect cross-tab or off-device exposure detection.

## Preservation and migration

All 209 legacy numeric IDs, stable IDs, target assignments and order values were compared with the inspected inventory and match. All five fox PNGs and `mascot.svg` are byte-identical to the deployed baseline. Legacy completion is not converted into mastery.

`drizzle/0003_classy_star_brand.sql` is additive: it adds an account/language exposure ledger, idempotent request receipts, and a draft request identifier. Existing migrations remain unchanged. A test applies the migration to populated legacy data and checks preserved account/progress values.

Legacy self-practice finish now commits the owned draft and legacy completion together, preserving existing completion timestamps and avoiding invented accuracy scores. Session/event mutations use ownership checks, version checks and request identifiers. A duplicate save or tutor retry does not blindly create another operation.

Before any separately authorized deployment, take a database backup and run the migration in the deployment environment. Keep the prior application revision available. Application rollback can leave the additive columns and tables in place; do not delete new evidence or reverse migrations as a routine rollback. Do not overwrite the unrelated stale Express source on GitHub main with the Worker build. The selected Site's canonical source is authoritative for this deployment lineage.

## Optional services and cost controls

The essential authored lessons and checks make no AI, transcription or cloud speech calls. Optional device audio uses a matching language voice; absence or failure leaves a text route. There is no new payment integration or upgrade gate.

Existing per-account UTC daily limits remain: 20 tutor/roleplay calls, 5 transcription clips, 10 cloud speech requests. A new configurable global optional-service request cap defaults to 1,000 requests/day across these three services. This is a request budget, not a dollar guarantee. Concurrency is checked in the database before provider work. Failed/abandoned reserved requests consume allowance rather than allowing unlimited retries. A request receipt prevents duplicate tutor/roleplay provider calls after a lost response; old clients without identifiers retain backward-compatible behavior.

Text token accounting retains existing totals and adds provider/model/language scope. Actual cloud speech duration cost, hosting charges and per-completed-session cost are not established by these counters. Use the approved report's dated pricing assumptions as estimates only; do not describe them as measured bills. No paid service was called as part of the synthetic tests.

There is no verified hosting-level anonymous traffic limiter in this checkpoint. Public authored requests are size-bounded and stateless, but hosting/abuse monitoring remains a release operations task. Optional AI coaching uses a constrained prompt and exposed lesson context; it is unscored practice. It does not yet provide deterministic post-validation that all generated wording uses only taught vocabulary. AI never owns the authored progression or mastery decision.

No new raw voice storage was added. A microphone remains optional and requires learner action; transcription returns editable text separately from message submission. Account-owned learning data and request receipts follow existing account deletion/reset boundaries. A scheduled automatic retention job has not been established; document an explicit retention policy before adding one. Local draft/practice recovery expires after 24 hours and is cleared for the account on sign-out or the relevant language on reset.

## Completed software verification

- TypeScript check passed.
- 48 automated tests passed, including all 21 complete authored activity flows and return entry; natural variants in all seven targets; hidden assessment data; account separation; recovery and duplicate saves; delayed retrieval; migration preservation; optional-service failure and request budgets.
- The multilingual flow check now asserts that every activity retains at least one eligible unseen correct combination after teaching and previous lessons. A synthetic correct response is not a participant learning result.
- The production client and Worker build passed and staged all four migrations.
- Whitespace/diff checks passed. Legacy identities and original mascot bytes were checked against the audited baseline.

## Outstanding release validation

The supervised preview started, but the supported browser address returned `net::ERR_BLOCKED_BY_CLIENT`. This is an environment access failure. No alternate browser/port was used to bypass it. Consequently the following remain outstanding:

1. Actual desktop and mobile rendering, 200% text scaling, focus order, screen-reader announcements, keyboard-open viewport behavior, IME composition and script font coverage on representative devices. Local runtime font availability is not evidence of learner-device coverage.
2. Real sign-in, two-account isolation, two-device resumption, a real interrupted/slow-network save, and live migration checks. Existing automated tests simulate authenticated transport and database behavior; they do not replace these checks.
3. Qualified review of grammar, meaning, naturalness, register, variant coverage and pronunciation guidance for every language. AI-authored content is explicitly awaiting human review.
4. Formative beginner pilots per language, a brief prior-knowledge check, arrival and active-learning timing, unseen held-out tasks, and 24-hour/seven-day follow-ups. No participants or gains are claimed.

## Remaining multilingual curriculum work

The first ten-lesson maps and the remaining lesson strategy in the approved specification remain the roadmap. This checkpoint does not claim that all 209 reference lessons have become authored independent-production pathways. All remain free and available. Demonstrated errors identified in the audit were corrected where the source wording was sufficiently clear, including German agreement/phonetics, Spanish stress, French elision and imperative forms, Hindi number formation, Mandarin tone spelling/negation, Japanese vowel and conditional forms, and Kannada lexical/script contamination. The rest require systematic lesson-by-lesson review and conversion.

| Target | Next content work, without changing existing lesson IDs |
|---|---|
| German | Continue the approved lessons 4–10; validate noun/article/case dependencies and verb placement; convert later reference exercises into meaning-based production and mixed return tasks. |
| Spanish | Continue the approved sequence; review person/number and adjective agreement, negation and question variants, regional pronunciation and request register. |
| French | Continue the approved sequence; review noun/article dependencies, liaison and elision, negation/register variants and contractions, separating spelling from meaning. |
| Hindi | Continue the approved sequence; review person/register forms and gender-dependent agreement, oblique/postpositional dependencies, and Devanagari support fading. |
| Mandarin | Continue the approved sequence; review count/classifier dependencies, aspect and negation, natural subject omission, tone listening and simplified-character support. |
| Japanese | Continue the approved sequence; review topic/subject contrasts, omitted arguments, verb/adjective endings and register, kana/kanji readings and mora/vowel length support. |
| Kannada | Continue the approved sequence; review natural spoken register, dative experience patterns, suffix joining and place/person forms, vowel length and Kannada script progression. |

Advance each target through the approved ten-lesson map while keeping the complete opening flow available in every language. Prioritize reviewed content and demonstrated learner difficulties rather than a presumed German preference. Software acceptance, pedagogical review, and learner outcomes are separate gates. Publication still requires the user's separate authorization.
