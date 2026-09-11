# LingoMitra multilingual learning audit and redesign

## Inspection coverage statement

**Accessed:** the live anonymous website; its arrival page, German preview, language selector, sign-in transition, About page and empty Blog; the Sites deployment/version metadata; the clean source checkout at /workspace/sites/lingomitra; the complete generated catalog and all 209 source-to-catalog text comparisons; shared React components, Worker APIs, schema/migrations, account and progress logic, audio/AI integration, preferences, mascot assets, and existing tests. Language reviewers in this audit were AI agents, not human teachers.

**Interactively tested:** arrival to preview, hiding a shown model, typing a wrong-meaning response, comparing the attempt, revealing a worked answer, and switching from the preview to Japanese. The preview deliberately labels itself self-practice and does not grade the typed answer. Switching to Japanese and choosing the language catalog both reached sign-in. The available ChatGPT sign-in route reached an authentication screen requiring credentials; sign-in was not completed. Desktop inspection used a 1363 by 936 CSS-pixel browser viewport, with a visible screenshot of the preview feedback state. No horizontal overflow was observed in that state. This is one desktop observation, not a site-wide responsive pass.

**Inferred from source, not demonstrated on a learner account:** the six non-German lesson workspaces, authenticated German assessment branches, Today, profile, settings, review, tutor and conversation histories, admin/support handling, saving, account separation, language resets and deletion. A browser navigation to the public capabilities endpoint was blocked by the browser client, so configured provider availability was not verified. No production learner rows, credentials, invoices or raw recordings were inspected.

**Tested without changing the application:** all 35 existing automated tests passed using the existing Node test runner and SQLite-backed D1 adapter. They cover selected account, migration, review, assistance, recovery and API contracts. All 209 catalog records exactly match their source Markdown, with 209 unique stable lesson IDs. The checkout remained clean. These checks do not demonstrate actual cross-device synchronization, correct microphone behavior, accessibility conformance, linguistic correctness, or learning gains.

**Sampling:** all 209 lesson titles, IDs, order indices and content structure were inventoried. The opening three reference lessons in every language were read in full, plus systematic later samples listed in each appendix. All three existing German authored starters were read. Later sampling includes grammar-heavy, communicative and final lessons, but is not a line-by-line linguistic review of all 209 lessons. Findings apply to the stated source version and observed browser state.

## Decision and scope

**Approve a shared authored learning system with seven distinct language pathways, while preserving the deployed application and every existing account and lesson identity.** The main gap is not a missing visual theme. Six offered languages lack the small, authored teaching and assessment sequences that German now has, and sampled reference lessons contain specific language errors. Correct those errors, give every target an accessible opening, and make evidence of independent production trustworthy before making learning claims.

This is a design proposal, dated 10 September 2026. No application implementation, production data migration, Git push, or publication was performed in this phase. The proposed lessons are original AI-authored drafts, not Language Transfer material or human-reviewed curriculum. Qualified language review and beginner studies remain necessary. All lessons remain free and unlocked. Approval of this design would authorize an implementation phase only; publication needs a separate instruction and verification.

The package contains this shared report, a research synthesis, a technical audit, seven substantial language appendices, a complete 209-lesson inventory, annotated interface wireframes, a shared lesson schema, and seven populated examples. Each appendix includes a first experience integrated into Lesson 1, three scripted lessons, a ten-lesson map, prerequisite and exposure checks, remaining-course treatment, and a pathway-specific evaluation plan.

### Source provenance and discrepancies

| Source | Inspected fact | Consequence |
|---|---|---|
| Deployed LingoMitra | Sites version 2, deployment succeeded; saved source commit ff6711c104de95ec63d76be2451ba0db7af1c711 | Use this deployed baseline for the redesign |
| Local checkout | Same commit, clean Git status; generated catalog matches all source lessons | This is the code audited here |
| Live client | Loaded asset index-CmN03uZz.js is present in the local build output | Additional client provenance support; not a byte-by-byte runtime attestation |
| GitHub origin | Bhanu9Prakash/lingomitra-fullstack; default branch main still has package name rest-express and the old Express build | Do not rebuild from main assuming it is the deployed application |
| GitHub content checks | worker/learning-content.ts on main returned 404; fetching deployed commit returned no commit found | Reconcile the deployed source with the chosen repository after approval, before further release work |
| Earlier project documents | Describe the initial migration and German-only authored pilot | Useful history, superseded for current multilingual scope |

The GitHub discrepancy is a confirmed inspection result, not a request to push or merge during this phase. The available [GitHub package file](https://github.com/Bhanu9Prakash/lingomitra-fullstack/blob/main/package.json) contains the older build definition. The [live application](https://lingomitra.bhanukonepalli.chatgpt.site/) and saved deployment are the product baseline. No claim is made that every remote branch was enumerated.

## Actual language coverage

Target languages are what learners study. Teaching languages carry explanations. Interface languages carry controls. The live selector and About page list seven target languages, matching the source generator. The explanation and interface language actually implemented is English. A known-language preference is not a teaching pathway.

| Target | Code and stable legacy IDs | Lessons | Teaching and interface | Script | Apparent content span | Current availability |
|---|---|---:|---|---|---|---|
| German | de; de-lesson01–39 | 39 | English / English | Latin with umlauts and ß | Introductory forms through cases, relative clauses and advanced grammar | Live reference course; three additional authored starter activities linked to existing IDs; public preview |
| Spanish | es; es-lesson01–25 | 25 | English / English | Latin with accents, ñ and inverted punctuation | Introductory grammar through daily situations, past forms, pronouns and invitations | Live authenticated notes and self-practice; no authored sentence-check starter |
| French | fr; fr-lesson01–25 | 25 | English / English | Latin with diacritics, apostrophes and œ | Introductory forms through subjunctive, pluperfect and reported speech | Live authenticated notes and self-practice; no authored sentence-check starter |
| Hindi | hi; hi-lesson01–25 | 25 | English / English | Devanagari plus Latin transliteration | Introductory copula/verbs through postpositions, compound verbs and conditionals | Live authenticated notes and self-practice; no authored sentence-check starter |
| Chinese, implemented as Mandarin | zh; zh-lesson01–30 | 30 | English / English | Simplified Han characters with Hanyu Pinyin | Basic pronouns/tones through aspect, 把, 被, classifiers and idioms | Live authenticated notes and self-practice; no authored sentence-check starter |
| Japanese | ja; ja-lesson01–35 | 35 | English / English | Hiragana, katakana, kanji and romaji | Initial particles through polite forms, causative/passive and natural-language topics | Live authenticated notes and self-practice; no authored sentence-check starter |
| Kannada | kn; kn-lesson01–30 | 30 | English / English | Kannada script plus Latin transliteration | Introductory forms through everyday situations, cases, complex sentences and idioms | Live authenticated notes and self-practice; no authored sentence-check starter |

Total: **209 legacy lessons, seven target pathways, seven English-to-target teaching pairs, one interface language**. The three German activities are not three extra legacy lessons. No lesson-level CEFR field, validated placement or assessed CEFR coverage was found. Advanced grammatical topics do not establish B1/B2 or other proficiency coverage.

All seven catalog entries have availability enabled. Six lack the authored assessment layer, but are genuine offered courses, not merely translated menus or planned targets. Hindi and Telugu teaching versions are explicitly described in Settings/FAQ as unavailable. Generic flag mappings for Italian, Portuguese, Russian, Korean and Arabic are source-only display support, not courses. About says more languages are on the way without identifying a committed target list; no additional target pathway is counted. No separate source-only course directory was found beyond the seven catalog sources.

The full machine-readable inventory preserves numeric ID, stable ID, language, display order, title, source path, source hash and descriptive length counts. Opening reference lessons contain roughly 1,114–1,991 whitespace-delimited tokens. These counts indicate breadth, not reading time, and are especially poor proxies for effort across scripts.

## Learner journey and feature decisions

| Journey stage | Observed or source-supported current behavior | Proposed behavior | Disposition |
|---|---|---|---|
| Arrival | German-specific primary CTA; broad marketing sections before language choice | Show seven target choices immediately, each with a concrete first outcome and English explanation label | Improve |
| Select a language | Catalog and course routes require sign-in; public selector lists seven | Let beginners inspect and start the opening activity before sign-in; offer account saving at a useful transition | Improve |
| First lesson | German preview is short; other courses ask learner to choose a pattern from broad notes | Authored one-concept sequence for every language; retained notes remain available as reference | Improve and resequence |
| First attempt | Preview puts model away but visibly prints moechte/möchte in an input note | Keep answer-bearing input help behind an explicit cue; provide neutral input controls without target words | Improve |
| Feedback | Public preview reveals same worked answer for any nonempty response; legacy practice self-rates | Bounded language-aware diagnosis, clear unassessed state for uncertain answers, help on demand | Improve |
| Independent attempt | Existing German server distinguishes help/exposure; six courses do not assess correctness | Protected task pool per language and version; a different task follows every reveal/correction | Keep foundation and extend |
| Next lesson | Completion-based legacy suggestion; Today defaults to German | Per-language recommendation using current evidence and prerequisites, with every lesson still open | Improve |
| Return | German assessed review and legacy self-practice reminders coexist | One language-scoped return action with honest distinction between assessed retrieval and self-practice | Merge presentation, preserve data |

### Evidence to action register

Effort bands are planning estimates: S about 1–2 engineering days, M about 3–5, L about 1–3 weeks depending on existing contracts. They exclude teacher review and recruitment; they are not a delivery commitment. P0 protects correctness or the intended scope; P1 improves the learning experience; P2 follows the complete multilingual opening.

| Evidence | Learning problem or hypothesis | Change and action | Rationale and limits | Effort and dependency | Success measure | Priority |
|---|---|---|---|---|---|---|
| E01 Live home and Today.tsx promote German by default | Other-target beginners must detour; actual abandonment not measured | Public seven-language entry and target-aware Today; improve | Reduce unrelated choices and preserve intention; benefit requires observation | M; route and guest/account handoff | Correct language retained from arrival through resume in all seven slices | P0 |
| E02 Catalog has 209 notes; only three German activities in learning-content.ts | Shared wrapper is not a complete multilingual teaching redesign | Author three opening lessons per language and stage ten-lesson pathways; improve/resequence | Small taught sets permit interpretable transfer tasks; no promised fluency | L plus seven language reviews | 21 reviewed lesson scripts and seven complete working openings | P0 |
| E03 Specific errors documented in each appendix | Wrong examples can teach wrong distinctions | Correct defective rules/models with versioned errata; improve | Preserve useful explanations, never generalize from one correction to course quality | S–M per batch plus qualified reviewer | All cited defects resolved in source and generated catalog | P0 |
| E04 Preview input displays moechte/möchte; LessonAudio labels include spoken text | Visible support can invalidate an independence or listening claim | Separate teaching audio from assessment audio; support inventory per task; improve | Transparent modality is essential; accessible text alternative remains available | M; authored schema and renderer | No answer tokens in visible or accessible assessment UI; cue use logged | P0 |
| E05 Preview compare does not diagnose meaning; legacy wrapper explicitly unassessed | Novices may not know how to correct their own answer | Targeted feedback for reviewed tasks; retain labelled self-practice elsewhere; improve | Diagnosis helps correction but automated judgments can be uncertain | L; per-language validators and variant review | Wrong-meaning, valid-variant and uncertain responses follow correct branches | P0 |
| E06 Source notes-open state can survive navigation; support records only unfinished starters | Exposure before or outside a session may be missed | Persistent language/content exposure ledger and close/re-log notes on lesson change; improve | Independence is an evidence property, not just current-screen emptiness | M; additive events and renderer state | Switching lessons/languages with notes open never produces unlogged exposure | P0 |
| E07 Review toggles the same session completed flag | Prior prerequisites may temporarily appear missing | Separate lifetime completion from current review state; improve | A due review is not loss of prior learning | M; additive state fields | Starting review does not erase completion or prerequisite satisfaction | P0 |
| E08 Existing legacy completion and new skill evidence are separate | Converting old percentages to mastery would fabricate ability | Keep existing data and dual labels; keep | Completion describes activity; it can guide navigation without certifying ability | S; migration assertions | Historical account/lesson rows byte-preserved; no backfilled mastery | P0 |
| E09 Device speech, editable transcripts and typed fallback exist | ASR uncertainty and pronunciation quality are different | Keep consent/transcript confirmation; introduce human-rated speech only as an evaluation modality; keep/improve | Text match cannot establish articulation or tone accuracy | M; device and provider checks | Microphone denial, incorrect transcript and missing voice leave a usable path | P0 |
| E10 Existing hints/reveals and optional companion minimise controls | Helpful foundation, but help must fade and remain attributable | One help ladder shared by teacher and fox; keep/improve | No guessing loop or penalty for revealing | M; event deduplication and branch authoring | After stuck/reveal branch learner gets a genuinely different task | P1 |
| E11 Legacy notes are large and answer lists live in the same document | Learners must self-select prerequisites and self-monitor exposure | Split into outcome-sized activities while retaining stable reference links; resequence | Chunk size is a design hypothesis; retain richer optional explanation | L across remaining corpus | Every production item has an explicit ingredient/prerequisite audit | P1 |
| E12 Current warm fox identity, native selector, skip link, static lesson styling | Existing brand and access affordances are useful | Preserve palette and assets; consolidate duplicate headers and improve script fonts; keep/improve | Visual novelty alone does not improve retention | M; mobile and assistive-tech verification | One clear next action, no keyboard obstruction, readable seven-script samples | P1 |
| E13 Optional provider calls have limits, but retry cost and usage context vary | A free product still incurs costs outside successful sessions | Deduplicate optional requests, bound context and monitor cost per completed session; improve | Per-account quotas alone do not cap global cost | M; provider usage and global budget policy | Authored path functions during model outage/limit; cost denominator includes abandonment | P1 |
| E14 Empty live Blog and broad supporting pages | Peripheral navigation offers little immediate learning value | Keep routes/admin; simplify visible prominence until useful content exists | Editorial choice, not demonstrated learning effect | S | No empty-content detour in first-session primary journey | P2 |

Other dispositions: **keep** unlocked notes, original URLs, ChatGPT authentication, account-linked history, drafts, optional conversation scenarios, contact/admin features, explicit offline notices and nonintrusive install option. **Improve** FAQ claims only when new capabilities are verified, the distinction between native and explanation language, and support links that carry lesson/version context. **Merge** the presentation of competing progress/review surfaces while preserving their distinct evidence. **Simplify** duplicate navigation, speaker-count prominence, dashboard decoration and repeated method copy. **Retire** inaccurate examples and unsupported learning claims after replacing them with reviewed content. No entire target language, account feature, free access or useful reference lesson is proposed for removal.

## Shared teaching design

The recommended approach is a small authored sequence with language-aware validation, built on the existing Worker/React system. Improving only the wrapper is cheaper but leaves the novice responsible for curriculum selection. An AI-led tutor could generate variety but makes prerequisite control, assessment consistency, cost and review much harder. The authored approach offers bounded teaching, predictable fallback behavior and a reviewable curriculum; its main cost is seven-language authoring and quality review.

The teaching loop is: **establish a meaning → explain one small contrast → hear/see a model → try with help available → diagnose and repair → make an unseen combination → use it for a choice or message → retrieve later**. A recognition question is optional when it checks meaning, not a mandatory obstacle before every sentence. Sometimes a model precedes the explanation, but the learner is never expected to discover an arbitrary form without input.

Default opening budget: one communicative purpose, one main construction, roughly 3–6 core lexical items and at most one tightly connected contrast. Some pathways need more short functional pieces, such as a topic marker or dative recipient form; count those explicitly and split the lesson if formative learners lose the meaning. Do not treat numbers of words as equivalent across writing systems. The appendix timing is a design estimate. The 3–5-minute and 10-minute goals are per-language hypotheses, never timers or a speed grade.

Explain directly when the distinction is arbitrary or easily misinferred: grammatical gender, honorific form, particle function, tone-bearing syllable, word spelling, or an exceptional inflection. Invite inference only when the learner already has contrasting examples that support a reliable answer, such as finding the changed drink or the position of a taught verb. After one unsuccessful inference, give a concrete cue. After a second or a request for help, explain explicitly. This is a practical default to test, not an experimentally established optimum.

The learner receives useful vocabulary as form-meaning pairs in context, then retrieves it repeatedly. Understanding a rule does not remove the need to remember forms. Brief blocked practice establishes the pattern; later mixed tasks require choosing between patterns. Speed may improve with practice but is observed, not demanded. Automaticity is a later outcome requiring sustained varied practice and input.

### How help fades

1. During teaching, show the example, meaning, optional audio and a small ingredient set.
2. During supported practice, keep only the supports the learner chooses; identify these attempts as supported.
3. Before an independent check, put away model, ingredient translations and frames. Show a meaning/context prompt and neutral entry controls.
4. The first help action gives a small conceptual cue; another gives a specific rule; another a partial worked example; a voluntary reveal gives a complete explanation.
5. Correcting the same answer is useful supported practice. The next assessment uses a different semantic combination whose answer was not displayed in any branch.
6. When the pool is exhausted, offer practice and explain that a new assessment will come later. Do not manufacture novelty by changing a name or punctuation alone.

The help button is always available, including before an attempt. The app does not deduct points, remove access, or make the fox disappointed. If the learner remains stuck, reduce the number of active ingredients, show one worked example, invite an optional copy/repetition explicitly labelled as such, and move to a new supported task. Let them pause or change activities.

### Input, output and existing languages

Explanations are provisionally and actually in English for all seven targets. Ask at most “Which language would you like to learn?” before the lesson. Put “Explanations: English” beside it. Native language and strongest explanation language are distinct optional settings; no first-session questionnaire is needed. Existing Hindi/Telugu/other language checkboxes provide context, not automatically translated pedagogy.

Use a short, replayable target-language model with normal and slower options, plus a visible meaning during teaching. Do not play automatically. Reading can support memory without becoming an alphabet test. Early written or transliterated production is a valid, separately labelled route; optional private speaking remains self-reported practice. The actual-script progression in the four non-Latin pathways pairs meaningful taught words with small reading tasks and gradually withdraws transliteration when evidence supports doing so. No complete alphabet course is a communication prerequisite, and no transliteration result is called script literacy.

English-to-German word-order similarity is local, not universal. Spanish may omit subjects naturally. French written and spoken forms diverge. Hindi and Kannada may both place important verb material late, but their morphology and agreement must be taught separately. Japanese topic markers do not simply translate an English subject, and Mandarin does not add a European-style copula everywhere. Each appendix details register, agreement, negation, questions, script and pronunciation, plus misleading connections. Future Hindi or Telugu explanations would require a separately authored and reviewed teaching-language pack; translating these English paragraphs is not a sufficient adaptation.

Move beyond translation by asking the learner to select a real preference, correct a mistaken order, identify an object for someone who cannot see it, or ask another person for needed information. A meaning-based task still supplies enough context to make the intended message assessable. Personal disclosure is optional; fictional choices work equally well.

## Production and feedback contract

“Independent” describes a qualifying attempt, not a person or a whole lesson. A qualifying sentence combines previously taught elements into a meaningful utterance not shown verbatim, with no answer or answer-bearing lexical/structural assistance visible or accessed for that attempt. It must satisfy the context, not merely contain target words. Languages may allow subject omission or a short predicate; the appendix defines the relevant unit. A recalled greeting or isolated word is never relabelled novel sentence construction.

| Evidence category | Permitted support | What it can establish |
|---|---|---|
| Copied or repeated | Full model visible/audible or just revealed | Reproduction, not novel construction |
| Selected or rearranged | Answer choices or supplied words | Recognition/ordering under those supports |
| Produced with support | Vocabulary cue, frame, model replay, rule hint, notes or tutor help | A supported construction; distinguish support type |
| Produced independently | Context/meaning prompt; neutral input tools; no answer-bearing support; unseen combination | One successful construction under a specified modality |
| Retrieved later | Previously practised construction family, no help, a later session after the defined delay | Delayed retrieval, even when an earlier sentence recurs; not automatically novel combination |
| Applied in a new context | New communicative situation with the same taught ingredients; no help | Contextual reuse; novelty of sentence and context recorded separately |

Neutral supports include font scaling, keyboard access, generic script/IME setup and replay of the task instructions in English. A vocabulary lookup is not neutral. A target-script-to-transliteration toggle may be a permitted input mode in a separately labelled assessment, but revealing the target answer through it is assistance. Operating-system predictive text/autocorrection is documented during pilots; it is not reliably detectable or suppressible on every device. Treat uncertain provenance conservatively.

Record assistance from every channel: hint level, notes, word bank, partial model, answer reveal, audio replay of a model, mascot coaching, optional tutor, accessible alternative and external help reported by the learner. A semantic exposure ledger covers the public preview, prior checks, completed sessions and cross-route reference reading, not just the current unfinished starter. Reading a review model means later reproduction can count as retrieval when delayed, but never as a never-seen combination.

Feedback separates **meaning**, **word order**, **verb/inflection**, **agreement/register**, **vocabulary**, **spelling**, **script** and, only when legitimately assessed, **pronunciation**. Say what to change and why. For example, “Your sentence says you already have it. This situation asks for something you would like” diagnoses meaning before introducing the needed form. “I can’t confidently assess that version” leaves the answer intact, offers comparison or review, and awards neither failure nor mastery.

The first-pass rubric keeps three fields separate: task meaning (met/partly/not met/uncertain), taught form (acceptable/repair needed/uncertain) and orthographic detail (within target/error/not assessed). A meaningful grammatical variant outside the intended construction can satisfy communication without demonstrating the intended pattern. Do not call it bad language. Minor punctuation can be ignored for a sentence-construction task while still being taught in a writing activity. Never globally lowercase or strip diacritics across all languages; the language-specific policies preserve meaning-changing contrasts.

Typed target script, typed romanization, assessed spoken production and private self-reported speaking have separate evidence histories. Speech recognition produces a provisional transcript for the learner to confirm; its uncertainty is not a learner error. Confirmed transcription still does not establish pronunciation quality. During human pilots, trained raters can score intelligibility and relevant contrasts from consented speech. Do not make microphone use essential.

## Retention and next steps

Keep historical lesson completion untouched and display it as “Course activities completed.” The new ability view reports the evidence observed: seen, recognized, produced with help, independent attempts, later retrieval, and context use. These dimensions are not a single irreversible ladder. A learner can recall a sentence but still need script support, or produce a form independently once and struggle next time.

For a pattern, retain a highest-observed historical record alongside recent performance. A proposed “independent on recent tasks” summary needs at least two distinct qualifying combinations in separate prompts; “retrieved later” needs an unassisted attempt at least 24 hours after the most recent relevant practice; “used in a new context” needs a held-out context scored for meaning and form. These are conservative product rules to test, not validated mastery thresholds. A later failure changes the next recommendation to repair/review without deleting earlier successes or removing lesson access.

Practical default: a successful first construction invites an optional next-day review; an unassisted next-day retrieval invites a 3-day review, then 7 and 14 days. Supported or incorrect retrieval returns to a short worked example and a next-day invitation. Repeated immediate practice does not count as delayed retrieval or lengthen the schedule. Pilot follow-ups at 24 hours and seven days are research assessments, not the same thing as the adaptive production schedule; log all intervening exposure.

Start each return with one meaning-based sentence task before showing a model. Mix an older construction with the recent one once both are established. Mistake-aware review selects a meaningful new task requiring the relevant distinction, not the exact string just corrected. Maintain sufficient semantic pools to avoid repeated identical answers being reported as transfer.

Within the selected language, recommend in this order: an interrupted attempt, a short due review, a repair task for recent confusion, or the next authored outcome whose prerequisites have been taught. Explain the reason in one line and allow “Choose something else.” Never block access because a prerequisite or streak is missing. On a language switch, save or explicitly retain the unsaved text, change the language context, and show that language’s latest draft/review. Keep all seven histories distinct and never mix reviews without the learner opting into a mixed-language session.

## Multilingual evaluation and roadmap

The seven appendices define concrete prior checks, held-out tasks and modality rules. Begin with **6–8 genuine beginners per target language**, approximately 42–56 in total, in small rounds so defects can be fixed before later rounds. This is formative observation, not enough to establish superiority. Recruit adults initially, stratifying English explanation comfort and prior script familiarity where relevant; do not conflate fluent Hindi speakers beginning Kannada with English-only beginners learning a new script. Include returning lapsed learners as a separately labelled cohort, not in the true-beginner denominator.

A brief prior check asks about relevant prior study and offers one uncoached, unrevealed attempt from the target construction plus an optional “I don’t know yet.” Never teach the answer in the baseline. Correct baseline knowledge excludes that construction from claims of new learning attributable to the session, while preserving the learner’s success. A baseline failure is not proof of no knowledge; use conservative interpretation. Prior familiarity with the particular prompt also enters the exposure ledger.

For each language and modality, measure arrival-to-first-independent-correct sentence separately from active learning time. Arrival starts when the first usable page is shown, including selection and any sign-in delays. Active learning includes listening, reading, thinking, composing and feedback; excludes explicit pause, backgrounded page, service waiting and authentication. Silence while the learner thinks remains active. Report intervals and start/end definitions, not just a timer number. A task with no qualifying sentence contributes a non-success/censored observation at session end, not a dropped record.

The immediate outcomes are success on protected unseen combinations, amount/type of help, comprehension of the intended meaning, confidence and observed confusion. Also report abandonment, technical failures, number of attempts, return rate and whether first-session success survives 24-hour and seven-day checks. Gather a short open comment and confidence rating without suggesting the lesson worked. Do not fabricate learner quotations or results.

Events should contain event UUID, pseudonymous research/session ID, internal account boundary where applicable, target and teaching language, curriculum/lesson/prompt version, semantic task key, response modality, script/input mode, event and received timestamps, elapsed/active durations, assistance ledger, attempt index, model exposure, scoring status, error categories, validator/rater version and success category. Research consent is separate from essential operational learning events. Do not export raw answers or account identifiers into third-party analytics by default.

### Later comparative study

Compare the redesigned and current instruction **within each language**, using equivalent taught content, exposure time and held-out tasks. Randomly assign eligible learners within prior-knowledge/script strata; use concealed allocation and blinded scoring where practical. The primary outcome can be the proportion meeting a prespecified seven-day independent-production criterion over multiple held-out tasks. Keep first-sentence time a secondary outcome to prevent optimizing trivial prompts at the expense of retention. Assessors should rate meaning/form and note modality separately; independently double-score a subset and resolve disagreement with a documented rubric.

For sample-size planning only, detecting a change from 40% to 60% meeting the primary criterion at two-sided 5% significance and 80% power requires roughly 97 learners per arm under a simple independent-proportions approximation. Allowing 25% loss to seven-day follow-up gives about 130 recruited per arm, per language. This is an illustrative effect and attrition assumption, not an estimated LingoMitra effect. Revise using a scientifically meaningful difference, uncertainty/precision goals, clustering if applicable and a prespecified analysis; a small formative pilot cannot reliably estimate an effect size. If making seven formal claims, specify multiplicity control or treat results as separate exploratory estimates with confidence intervals.

Publish per-language denominators and intervals, including failures, incomplete sessions, missing follow-ups, technical issues, exclusions and deviations. Report intention-to-treat outcomes with a prespecified missing-data sensitivity analysis; do not treat all missing follow-ups as known learning failures or omit them silently. Time-to-success summaries must retain non-successes and can use survival curves with explicit censoring assumptions. Do not pool seven languages into a single headline that hides a weak pathway. Any pooled estimate must be secondary and use an explicit hierarchical or weighted model with language-level results visible.

### Prioritized delivery after design approval

| Stage | Scope | Exit condition |
|---|---|---|
| 0 Source and preservation | Reconcile deployed provenance with repository; record current account/lesson schema; verify supported backups and restore | Reproducible baseline and documented additive rollback; no IDs or historical progress reinterpreted |
| 1 Shared evidence foundation | Close exposure gaps, preserve lifetime completion during reviews, add language-aware schema/validation adapters, target-aware entry and Today | Common contracts pass ownership, assistance, version, recovery and failure tests |
| 2 Seven opening slices | Complete entry → teaching → attempt → feedback → independent check → account save → return review for every offered target | All seven slices satisfy the acceptance matrix below; no German-only completion claim |
| 3 Opening curriculum | Three reviewed scripts and ten-lesson sequence per target; meaningful script/audio support | Twenty-one teacher-reviewed opening lessons and seven coherent ten-lesson paths |
| 4 Formative rounds | Beginners in each pathway, revisions after observed confusion, 24-hour and seven-day follow-ups | Failures and limits documented; no unsupported superiority claim |
| 5 Remaining corpus | Repair cited defects first, then convert outcome clusters in every target with stable source links | Coverage tracked by target, grammar/script dependencies and task type, not only aggregate lesson count |
| 6 Separate release gate | Verify code, device/accessibility/account behavior, reviewed content and requested audience | Publish only after separate authorization |

Risk-based sequencing within stages: first correct evidenced misleading rules and examples across all seven; develop script/IME and validation contracts early because four targets depend on them; reuse German’s existing engine as a regression reference, while developing the other pathways in parallel. No usage analytics were accessed, so there is no evidence-based popularity ranking. Teacher availability and validated content readiness may change order, but every target remains in the first complete multilingual milestone.

### Working slice acceptance criteria

For each of de, es, fr, hi, zh, ja and kn: the selected language persists from entry to return; the first outcome is clear in English; all required words/forms/script operations are introduced or explicitly supplied; the full correct/partial/misconception/stuck branches work; hints and voluntary reveal remain available; correction is followed by a different unexposed task; grammatical variants and wrong-meaning near-matches are handled appropriately; uncertain judgments remain unassessed; exposure and modality classification survives refresh and route changes; signed-in drafts and evidence survive a second-device request; another account cannot access them; switching target never changes other-target history; 320/375/390/768-pixel layouts, 200% text, keyboard-open composition, focus, screen-reader announcements and actual IMEs are verified; model/audio/speech failure leaves authored typed learning usable; old lesson IDs and completion remain intact.

Run software tests and human pedagogical review as separate gates. An automated grammar validator passing its authored examples is not human linguistic validation. A teacher confirming grammatical examples is not evidence of learning effectiveness. A successful small pilot is not a comparative superiority result.

## Design approval checkpoint

The requested decision is whether to approve the shared system, seven distinct opening pathways, interface direction, evidence rules and staged roadmap. Provisional timings, cost scenarios and untested hypotheses remain labelled as such. Human language review and real-device/account validation are outstanding for every pathway. Approval does not certify the content or authorize publication.


---

# LingoMitra: research evidence and design implications

Research working memo, accessed 10 September 2026. Scope: a design audit for German, Spanish, French, Hindi, Kannada, Mandarin Chinese, and Japanese, currently taught through English. This memo does not evaluate implementation or observed learner outcomes in LingoMitra. It separates a teaching reference, independent findings, proposed adaptations, and hypotheses requiring evaluation.

The defensible direction is a sequence that helps a learner understand something, attempt a meaningful response, inspect useful feedback, and later retrieve and reuse it. Research supports testing these ingredients. It does not establish the effectiveness of this particular combination, establish Language Transfer's scientific superiority, or show that producing a first sentence implies conversational fluency. The audit should therefore ask what evidence each activity produces about the learner, rather than treating completion as a general proficiency measure.

## What was inspected in Language Transfer

**Language Transfer's public description.** Its courses page asks listeners to participate actively by stopping the recording, thinking, and responding aloud. Among LingoMitra's seven targets, it offers Complete Spanish, available but unfinished Complete German, and Introduction to French. Introduction to Japanese is in development; its tester material is explicitly provisional. Hindi, Kannada, and Mandarin Chinese are not listed on this page. These are current catalogue observations, not conclusions about every resource LT has ever published. [Language Transfer courses](https://www.languagetransfer.org/courses).

**Guidebook status.** The guidebook landing page says that Part 5's competition, team-building, and proposed platform arrangements are no longer relevant. They should not be presented as an available partnership, training, or distribution pathway. [Guidebook and update](https://www.languagetransfer.org/guidebook).

**Guidebook teaching account — LT's claims, not experimental validation.** The linked 432-page first-edition PDF was inspected at sections 1.1–1.3, 1.6–1.9, and 4.3: printed pages 21, 26–29, 54, 66, 70, 80–82, and 412–413. The author asks course writers to anticipate a novice's knowledge, unpack what looks like one operation into smaller decisions, sequence dependencies, and revisit material with variation. Participation involves deliberate pauses and spoken attempts. Correction should investigate the learner's reasoning, sometimes inviting another attempt before adding stepwise help. The author also stresses checking contextual naturalness with multiple native speakers and avoiding questions that merely invite agreement with a proposed rule. The guidebook describes a method responsive to both the instructional and target languages, rather than a universal translated template. These are practitioner prescriptions and explanatory claims. Only the PDF text was inspected; no claim is made to have listened to course audio. [Actual linked guidebook PDF](https://static1.squarespace.com/static/5c69bfa4f4e531370e74fa44/t/5fc6e0621d689b68bf8b09e9/1606869102329/TMG+1ST+EDITION+FINAL+-+Google+Docs.pdf).

## Independent evidence: what was actually tested

This is a bounded evidence review, not a systematic review or an effect-size synthesis. “Full text” below means relevant methods and results were inspected in the paper; “abstract” limits claims to the authors' accessible summary. For three Cambridge papers, the abstract was obtained from publisher-deposited Crossref metadata; full-text details and effect sizes were not verified. Studies differ in prior proficiency, languages, practice duration, tasks, and measurement. Their results cannot be pooled informally into a prediction for LingoMitra.

| Evidence and access | Population and task | Outcome | Limits | Relevance to the audit |
|---|---|---|---|---|
| **Retrieval:** Karpicke & Roediger (2008), full paper and methods | Forty university students studied 40 Swahili–English pairs; they typed an English translation in response to a Swahili cue. Learned items were subsequently restudied, retested, both, or neither. | Continuing retrieval after an initial success substantially improved one-week recall; additional study alone did not produce that benefit. | This was cued **English-word recall**, not speaking Swahili, generating grammar, or conversation. Initial success and confidence did not certify durable learning. | Keep later retrieval opportunities after success; do not label a vocabulary result “speaking ability.” [Paper](https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_Science.pdf), [methods](https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_ScienceSupportingMaterial.pdf). |
| **Spacing:** Karpicke & Bauernschmidt (2011), full text | Ninety-six undergraduates learned Swahili–English pairs. After first successful recall, items received three further retrievals with different total and relative spacing. | Greater total spacing improved one-week retention. Expanding, equal, and contracting schedules showed no inherently superior relative schedule in this experiment. | Intervals were intervening trials within learning; this does not select an optimal calendar schedule for an app. Outcomes again concerned cued English translations. | Use delayed review, then evaluate the actual schedule. Avoid claiming that a particular algorithm or fixed sequence of days is proven best. [Paper](https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Bauernschmidt_JEPLMC.pdf). |
| **Guided retrieval:** Karpicke et al. (2014), full text | Three classroom experiments with elementary-school children used curriculum texts, free recall, partially completed concept maps, and question maps. | Unassisted free recall yielded little content. Guided formats enabled retrieval, and the question-map activity improved immediate final recall relative to repeated study. | Children learning school texts are not adult second-language beginners. The key comparison measured immediate recall, not delayed retention. This does not establish a universal cue ladder. | A blank response should trigger informative help. Measure later performance without that help to distinguish supported success from independent recall. [Paper](https://learninglab.psych.purdue.edu/downloads/2014/2014_Karpicke_etal_JARMAC.pdf). |
| **Direct instruction versus discovery:** Klahr & Nigam (2004), publisher abstract | One hundred twelve third- and fourth-grade children learned to design unconfounded science experiments, then evaluated science-fair posters. | More children acquired the procedure under direct instruction. Among children who acquired it, those taught directly performed as well on transfer judgments as those who discovered it. | This is science reasoning, not second-language acquisition. The transfer comparison is conditional on having learned; it does not imply identical group outcomes. | Do not assume that making a novice discover every prerequisite improves transfer. A worked explanation followed by application is a candidate to test. [Study](https://journals.sagepub.com/doi/10.1111/j.0956-7976.2004.00737.x). |
| **Explicit explanation plus input processing:** VanPatten & Cadierno (1993), abstract | Learners received either explanation plus output practice or explanation plus practice processing input. Sentence interpretation and sentence production were tested; sample details were not verified in the accessed abstract. | The processing-instruction group improved on both interpretation and production; the traditional group improved on production only. | Both conditions contained explanation. This does **not** isolate an explanation effect or prove “explicit instruction beats implicit learning.” Sentence-level tests also do not establish spontaneous dialogue. | Evaluate what the learner must attend to in a model or listening example, not just the presence of a grammar explanation. [Study](https://doi.org/10.1017/S0272263100011979). |
| **Comprehensible input and interaction:** Loschky (1994), abstract | A Japanese-learning experiment compared unmodified input, premodified input, and input with negotiated interaction. Measures included immediate comprehension, vocabulary recognition, and two locative structures; sample details were not verified. | Negotiated interaction produced the strongest immediate comprehension. Differences in momentary comprehension did not correlate with the measured acquisition gains; all groups improved. | Neither “I understood that” nor extra comprehension alone demonstrated the intended learning difference. The study does not show input is unnecessary. | Include meaningful listening, but assess retained understanding and reuse separately from success on the supported listening activity. [Study](https://doi.org/10.1017/S0272263100013103). |
| **Output and noticing:** Izumi (2002), abstract | Adult ESL learners worked with English relative clauses in computer-assisted reading and reconstruction. Output requirements and visual enhancement were varied experimentally. | Output–input activity yielded greater learning gains than exposure for comprehension alone. Visual enhancement increased noticing without producing measurable learning gains. | Reconstruction of a selected grammatical form is not unrestricted speaking. “Noticing” and “learning” were distinct outcomes. | Have learners reconstruct and recombine language; do not treat highlighting, viewing an explanation, or noticing an error as mastery. [Study](https://doi.org/10.1017/S0272263102004023). |
| **Corrective feedback:** Mackey & Philp (1998), publisher abstract | ESL learners received negotiated interaction, with or without intensive recasts; researchers examined question development and immediate responses. | The findings favored intensive recasts for more advanced learners' short-term development of targeted higher-level question forms, although immediate repetition or modification was uncommon. | Effects depended on developmental readiness and targeted forms. Lack of an immediate repair did not imply that no learning occurred. This was human interaction, not an automated speech scorer. | Offer a clear model and opportunities to try again, but track delayed transfer rather than counting corrections accepted. [Study](https://onlinelibrary.wiley.com/doi/10.1111/j.1540-4781.1998.tb01211.x). |
| **Extended speech practice:** de Jong & Perfetti (2011), full text | Twenty-four complete datasets from 47 high-intermediate ESL students; three sessions of 4-, 3-, and 2-minute monologues, with repeated or changing topics. | Repeating a speech was associated with retained fluency gains, including a four-week assessment and transfer to new topics; improvement during practice alone was less diagnostic. | Small retained sample; monologues, prior language knowledge, planning, classroom study, and feedback. Accuracy/complexity trade-offs were not settled by this article. | Repeated meaningful speaking is a candidate for later progression. This study provides no evidence for making an absolute beginner produce a first sentence within 3–5 minutes. [Paper](https://www.lrdc.pitt.edu/perfettilab/pubpdfs/de%20Jong%20Language%20Learning.pdf). |
| **Mandarin tone support:** Liu et al. (2011), full text | Thirty-five first-semester Chinese students, mostly English L1, in three classes assigned to pitch-contour-plus-pinyin, number-plus-pinyin, or contour-only support. Eight lessons trained tone identification. | Contour plus pinyin showed promising learning advantages. The pre/post advantage over numbers plus pinyin was significant in the item analysis, but the participant-level interaction was not significant. | Only 8 and 12 students supplied paired data for that comparison; the contour-only comparison was excluded because just four completed both tests. Class assignment, missing data, and near-ceiling scores limit confidence. Tests measured **perception**, not spoken tone production. | Test audio-linked visual tone cues as a candidate scaffold. A successful tone-selection task cannot certify pronunciation. [Paper](https://www.lrdc.pitt.edu/perfettilab/pubpdfs/Liu_et_al-2011-Language_Learning.pdf). |
| **Chinese script versus phonology:** Guan et al. (2011), full-text abstract and first-experiment methods/results | Two experiments studied adult L2 Chinese learners. The first enrolled 30 Chinese II students, nearly all with prior character-writing experience; the second added pinyin typing to the training comparison. | Character handwriting supported character recognition and meaning links; pinyin typing supported phonological knowledge. Benefits differed by the component tested. | Character tasks do not establish sentence production. Prior experience matters, and the article is not a direct test of Japanese kana, Japanese kanji learning, Devanagari, or Kannada. | Provide script and sound tasks that have their own measurable goals. Handwriting can be an option to evaluate, not an unconditional prerequisite for speaking. [Paper](https://www.lrdc.pitt.edu/perfettilab/pubpdfs/Writing%20strengthens%20Guan%20JEP.pdf). |
| **Kannada literacy:** Nag & Snowling (2011), publisher abstract | Kannada-reading children aged 8–12 with reading difficulties were compared with competent peers and younger language-matched readers; a case-series analysis examined individual profiles. | Weak akshara knowledge and phonological skills were prominent; additional oral-language, naming, and visual difficulties varied between children. | This is observational evidence about childhood reading difficulty. It neither tests an adult L2 course nor proves a script-teaching intervention, and it should not be generalized directly to Hindi. | Keep script knowledge, phonological discrimination, and oral language distinguishable during assessment; pilot any teaching sequence with the intended population. [Study](https://link.springer.com/article/10.1007/s11145-010-9258-7). |

## Proposed app adaptations, not findings about the existing app

**Make the objective a communicative act.** For a beginning unit, choose one small intention the learner could plausibly have: requesting something, asking where something is, or stating a preference. Specify which meanings are permitted and what would count as an understandable answer. Then select the few words, sound distinctions, and structural choices required. “One sentence” should not become an arbitrary grammatical length rule; a natural short utterance can communicate more successfully than a forced full sentence.

**Use a small, inspectable learning sequence.** A proposed sequence is: establish the situation; provide a comprehensible model; draw attention to one useful relationship; request an attempt with the answer concealed; offer help when needed; show a model and explanation; change the situation or one meaningful element; revisit the skill later. These steps are a LingoMitra design proposal, not a reconstructed LT lesson script. The value of the sequence depends on language accuracy, the quality of the prompts, and learner testing.

**Design help as temporary support.** Offer an initial meaning or structural cue, then a more specific prompt, then a worked response. Make requesting help normal. Record which support was used. Later remove the answer and earlier cues before assessing independent production. A learner who can follow the explanation should have an opportunity to demonstrate whether they can recover and apply it. The number of hints and their order are hypotheses; the research above does not specify a universal three-step ladder.

**Feedback should identify a useful next action.** Separate “the intended meaning was conveyed” from a correction to a target feature. Model a natural alternative, explain the one relevant difference in plain English, and offer another meaningful attempt. Do not infer a learner's hidden reasoning from one error with certainty. If the response could fit another legitimate context or dialect, clarify the context or accept an appropriate variant. Automated transcription uncertainty should lead to a retry or neutral comparison, not a confident linguistic diagnosis. These are proposed design and assessment safeguards, not claims of tested app behavior.

**Make listening active and output purposeful.** Listening tasks could ask which person, object, or intention a speaker means, with distractors tied to the feature being learned. Speaking tasks could require an answer to a situation that changes, rather than only repeating the displayed sentence. Keep model repetition as one useful task, but identify it honestly. A learner's selected response, typed response, and spoken response expose different capabilities and should not be interchangeable credits toward “speaking mastery.”

**Treat English as the instructional language, not proof of an English-only learning history.** Learners may know another relevant language or already read the target script. A brief, optional profile can distinguish new learners, returning learners, and people with heritage exposure. Provide plain explanations and define necessary terms in context. Do not force a learner to learn grammatical terminology merely to demonstrate communicative understanding.

| Target | Proposed priority to validate | Evidential boundary |
|---|---|---|
| German | Small sentence-building decisions, followed by a new contextual response and listening check. | LT supplies an unfinished reference course; no German LingoMitra treatment effect is established here. |
| Spanish | Recombination beyond rehearsed words, with varied situations and delayed speaking checks. | A complete LT offering is not an independent outcome study. |
| French | Pair a spoken model with a meaning decision; assess oral comprehension and production separately from written success. | The LT reference is introductory; its presence does not validate an app adaptation. |
| Hindi | Pilot script support and spoken work with intended adult learners; assess existing script and sound knowledge first. | No directly relevant adult Hindi intervention was established in this review. |
| Kannada | Test the relationship between script support, sound distinctions, and useful utterances without making literacy a proxy for speaking. | The cited child-literacy evidence is indirect and observational. |
| Mandarin Chinese | Evaluate tone-perception support, spoken-tone feedback, and character learning as distinct activities. | The accessed experiments support limited component-level hypotheses; they do not validate connected spontaneous speech. |
| Japanese | Evaluate kana/kanji support with Japanese educators and learners; measure meaning, sound, and script outcomes independently. | The Japanese input experiment is not a script intervention. Chinese character findings cannot establish the best Japanese script sequence. |

These priorities require language-specific original content and review. They do not prescribe transferring English word order, importing a Romance-language explanation into an unrelated language, or translating one lesson seven times. Native-speaker review should examine whether a response is natural in the intended situation; educator review should also examine whether a beginner has been given the prerequisites to reach it. Learner trials then reveal whether those assumptions hold.

## The 3–5 minute first-sentence hypothesis

Treat this as a product experiment: **Can a new learner independently construct a meaningful novel sentence within 3–5 minutes of actual arrival, either typed or through separately assessed speech?** This is an unvalidated hypothesis about an early learning outcome, not a fluency promise or a deadline for the learner. Let learners take the time they need and avoid a visible countdown.

Define independent construction before measuring it. The learner combines previously introduced vocabulary and structures into a sentence that fits a new situation or expresses a new meaning, with the answer hidden and without sentence-building hints or a supplied word bank. Novelty concerns the combination or communicative use; it does not require untaught vocabulary. Copying a model, immediate imitation, and construction with visible content support are distinct outcomes. **Supported production is a useful secondary milestone**, recorded with its assistance level, but it does not satisfy the primary independent-construction outcome. A typed sentence is a valid primary response. Assess spoken responses separately for meaning and intelligibility; typing alone provides no evidence of pronunciation or spoken performance. Record any input assistance and the script or transliteration accepted by the task.

Start the arrival clock at actual arrival, **before language selection, authentication, onboarding, or accessibility and audio setup**, and stop it at the first qualifying independent sentence. Report this elapsed arrival-to-outcome duration separately from active-learning duration. Active learning includes visible thinking, listening, and response construction; do not silently remove deliberation or listening time as inactivity. Predefine how other periods are classified and retain all elapsed time in the arrival measure. A post-selection duration may be reported as an additional secondary measure, but must never replace the arrival measure. Record time to supported production separately. Neither the 3-minute nor the 5-minute observation point should interrupt the learner or turn continued learning into a failure state.

In an initial moderated study, recruit participants in each target language with varied prior language and script exposure. Observe confusion, requests for help, independent and supported attempts, input difficulties, and whether the experience creates pressure. Use these observations to revise the material before setting a success percentage. A small usability sample can identify problems; it cannot establish comparative learning effectiveness.

For an effectiveness test, compare the proposed guided experience with an equally usable alternative containing the same target content, controlling or explicitly accounting for instructional exposure. Randomize when practical and define the primary independent-construction outcome and assessment modality in advance. Check a new situation immediately and again after a delay, with assistance removed. Include a new speaker for listening assessment where appropriate. Score meaning and the selected target feature separately; add intelligibility for spoken assessment. Keep assessors unaware of the learner's condition. Track adherence and missing follow-ups rather than presenting completers alone as all starters.

Report the proportion of all starters reaching independent construction by each observation point and the distribution of arrival-to-outcome times, alongside active-learning duration and the secondary supported milestone. State assessment opportunities, modality-specific denominators, assistance, and unfinished attempts. Also report delayed accuracy on unseen combinations, listening comprehension, and learner-reported pressure. Break out results by target language and prior exposure when sample size permits. Avoid cross-language speed rankings that reward easier prompts or penalize unfamiliar writing. Early completion is useful only alongside retained understanding and usable transfer.

## Measurement and remaining gaps

Keep an assessment ladder explicit: recognition of a choice; recall of an isolated item; repetition of a model; cued sentence construction; response to a new situation; and sustained interaction with clarification or repair. Movement up this ladder requires new evidence. A single aggregate score can obscure where a learner actually needs help. Retention, intelligibility, grammatical accuracy, listening, and script literacy may each justify their own feedback.

No controlled evaluation of Language Transfer itself was established in this bounded review. The sources do not establish a best course sequence across seven languages, an optimal review calendar, a universally effective feedback timing rule, or a validated automatic pronunciation threshold. Direct adult L2 evidence for Hindi, Kannada, and Japanese script onboarding remains a particular gap. Those gaps should guide pilots and content review, rather than being filled by confident claims about a universal method.

The source links above distinguish direct papers from accessible abstracts. The full-text basis comprises the two retrieval/spacing papers, guided-retrieval experiments, the speech-repetition study, the Mandarin tone study, the specified sections of the Chinese-writing paper, and selected LT guidebook sections. The other study accounts remain abstract-level. No course recordings or experimental audio files were listened to, and no study's materials or LT teaching script is reproduced here.


---

# Interface, mascot, and accessibility proposal

These are annotated design wireframes, not deployed screens or completed mobile tests. They reuse the actual LingoMitra fox artwork, warm paper background, brown text and orange emphasis. They introduce no new mascot identity, subscription, upgrade prompt or fluency promise. The opening language choice, quiet composition area and language-specific teaching scripts form one experience.

## Entry and learning workspace

![Annotated public entry proposal showing all seven target languages](design_assets/entry_proposal.png)

The entry asks one question: which target to learn. Each row names a useful first outcome. “Explanations in English” is explicit; the optional first-language profile comes later. Mandarin is named as the taught Chinese variety. A public beginner can start without a microphone or account setup. Signing in becomes the optional transition for keeping account-linked learning. Existing signed-in learners instead see a single resume/review action for their selected target, with all lessons accessible.

The proposed public opening includes the exact teaching and feedback branches in each appendix. Use the existing server validator architecture through a small, stateless, rate-limited public check for approved guest prompts. This is the selected design option from the technical memo. It makes targeted feedback possible without AI or a new guest database. Guest correctness is provisional practice feedback; server-stored independent evidence begins with a fresh account assessment after sign-in. Carry a bounded list of public material exposures and the practice draft across the handoff, conservatively marking uncertain exposure. In moderated research, an assessor can score observed guest independence separately. If the public checker fails, the same lesson offers voluntary worked comparison and a later fresh check. It remains usable and free.

![Annotated desktop composition proposal using the Japanese opening](design_assets/desktop_proposal.png)

The desktop uses a narrow, readable teaching column and a compact optional companion area. The header retains the target, lesson outcome and saved state. During instruction, show one example and an English meaning with Play, Pause, Replay and Slower controls. During independent construction, that panel is closed and removed from the accessible tree; target-bearing audio, captions, examples and vocabulary labels are absent. The remaining prompt expresses a situation. It does not contain the target answer.

One primary button checks the sentence. A secondary help button starts a requested hint; a separate text action reveals a complete explanation at any time. The composer remains blank initially, retains the learner's text and does not show an answer-shaped placeholder. Feedback names the useful next correction. “Try a different message” follows correction; the target allocator checks the exposure record before calling that next task unseen. If none remains, label it practice. Pause and Save and leave are available without pressure.

![Annotated mobile proposal with the software keyboard open](design_assets/mobile_proposal.png)

The left phone illustrates a Kannada meaning task in Latin input mode. It has a blank composer, check/help controls above the illustrated keyboard, and no predictive answer chips. The right phone shows correction of a different practice item. This avoids exposing the assessed answer in a neighboring feedback panel. These are separate states, not two simultaneous learner panels. At narrower widths the prompt and controls reflow; long corrections scroll normally. A keyboard-aware layout must use the visible viewport and safe-area insets rather than an assumed keyboard height. Actual 320-, 375- and 390-pixel devices, landscape, zoom and IMEs remain to be tested after implementation.

The existing logo can remain in a small header. Companion art/commentary collapses when the keyboard is open. No floating fox, sticky promotion, footer tabs or celebration overlays cover the input. Preserve a single obvious check action and enough prompt context to answer; do not shrink script to fit a fixed-height card. A long prompt can scroll above a stable composer, with a short accessible “Read task” control that reads the English instructions only.

## Script and interaction requirements

All seven offered targets use left-to-right layout in the inspected material. No right-to-left learning pathway was found. Use explicit language and script metadata, Unicode text and bidirectional isolation for mixed user names, numbers and quotations; do not invent an Arabic pathway to justify an RTL redesign. A later RTL course would require separate content and layout validation.

| Target | Rendering and entry proposal | Distinctions that must survive validation |
|---|---|---|
| German | Latin font coverage for ä ö ü ß; an optional neutral character palette; preserve original text | möchte/mochte changes form; Sie/sie can change reference; oe keyboard convention is explicitly taught |
| Spanish | Latin accents, ñ and ¿ ¡; accents available without revealing a word | ñ is not n; punctuation and spelling scored separately from message, with context-sensitive accent judgments |
| French | é è ê ë ç œ, apostrophes and appropriate punctuation spacing | Curly/straight apostrophe equivalence is safe locally; removing pas reverses meaning; ne omission concerns register/writing target |
| Hindi | A tested Devanagari family and shaping engine; generous line height; grapheme-aware cursor, selection and wrapping | Dependent vowels, nukta and nasal signs must remain intact; transliteration typing is not Devanagari reading; no submission during IME composition |
| Mandarin | Tested Simplified Chinese glyphs; Han line breaking and punctuation; separate pinyin line during teaching | Tone marks/numbers are not erased from sound evidence; untoned pinyin can support meaning scoring only; character IME is distinct from prepared tiles |
| Japanese | Tested Japanese kana/kanji glyphs; optional furigana/romaji on taught words; Japanese line breaking | Small kana, long vowels and particles は/を have task-specific readings; kana conversion is text entry, not proof of handwriting |
| Kannada | A tested Kannada family and shaping engine; no clipping of vowel signs; grapheme-aware selection and wrapping | Vowel length, retroflex distinctions and gemination remain in the canonical form; mixed-script corruption is flagged for review |

Retain Nunito for Latin UI text only if its delivery and glyph coverage are verified; the source declares it but the audit did not establish a bundled complete multilingual font. Proposed fallback families include Noto Sans Devanagari, Noto Sans Kannada, Noto Sans SC and Noto Sans JP, subject to licensing, size, actual browser availability and glyph checks before bundling. These are candidates, not fonts proven on current devices. Avoid downloading an entire CJK family into every lesson; load a vetted language-specific resource or tested system fallback. Test shaping and fallback with real lesson strings, long answers, mixed-script names, punctuation and 200% text. The wireframes demonstrate geometry in English; they do not certify native-script rendering.

Do not split Indic grapheme clusters to count characters or animate “letters.” During compositionstart/compositionupdate, Enter must not submit. compositionend, candidate selection, voice transcript edits and normal typing preserve the draft and selection. A native-script IME is allowed input. Word/phrase prediction, translation keyboards or recalled full answers are separately recorded in learner studies; app code cannot reliably know every operating-system behavior. Do not infer unaided spelling from an IME's suggested candidate.

## Accessible teaching and honest modalities

Use semantic headings, associated labels, descriptive button names and a visible focus indicator. Keyboard order follows task, input, Check, Help, Reveal and navigation. After submitting, announce a concise status through a polite live region; retain focus and the entered sentence unless the learner explicitly opens a feedback panel. When a new task is chosen, move focus to its heading and announce the change once. Do not have the fox and feedback region both speak the same correction. Dialogs return focus to their opener; Escape closes optional help without deleting work.

Correctness uses text plus a symbol, never color alone. Distinguish “Message understood,” “One form to revise” and “Not assessed” visibly and programmatically. Reduced-motion mode eliminates decorative movement; the proposed composition state is still for everyone. Buttons target at least 44 by 44 CSS pixels in this design, with actual contrast and touch checks required before release. No timer, flashing cue or rapid transient toast carries essential information.

Provide text alternatives for teaching audio. For a listening assessment, an answer transcript changes the task: the accessible text route becomes reading comprehension, clearly labelled, while retaining the same lesson access. English audio of a meaning prompt is neutral support for a production task. Target-sentence audio is a model exposure. Names such as “Play example” are safe only on the teaching step; neither aria-label nor hidden caption may contain a reserved answer during assessment. Remove concealed answer nodes rather than merely styling them offscreen. Human QA must inspect both the visible view and accessible tree.

Typed production and private, non-recorded speaking are always available. On speech-service failure, keep the recording locally in the current component only long enough for a user-controlled retry/discard; never reinterpret a failed transcription as a language error. After a transcript is returned, let the learner edit and deliberately submit. This assesses the resulting text, unless a separate consented spoken task is rated using its actual audio. Deletion, pause, help and service-limit messages must remain plain and actionable.

## Verified mascot inventory

No personal name was verified. “The LingoMitra fox” is a description, not a newly invented character name. The existing artwork is an orange fox with a light muzzle/chest and darker paws, outlined in a friendly illustrated style. The five 1024 by 1024 PNGs were viewed and contain alpha transparency. No additional expression is required by this proposal.

| Asset under client/public | Verified visual state | Existing component state |
|---|---|---|
| mascot-neutral.png | Upright smiling fox | neutral |
| mascot-thinking.png | Hand at chin, considering | thinking |
| mascot-coaching.png | Pointing gesture | coach |
| mascot-retry.png | Seated with an open-hand gesture | retry |
| mascot-celebration.png | Raised paws | celebrate |
| mascot.svg | Existing logo asset | MascotLogo |

MascotMoment maps the five PNGs, supplies image dimensions and can return no companion when minimizeCompanion is enabled. MascotLogo separately retains the logo. Source placements include Hero, sign-in, language selection/detail, Today, the German preview, legacy practice, guided hints and guided feedback. Guided feedback already differentiates independent celebration, supported coaching and retry. The later learning-workspace stylesheet disables animation for the mascot and guided shell. Therefore this audit does not claim that the deployed learning fox currently loops or must be replaced to stop motion.

## Proposed moment-by-moment companion contract

The teacher owns essential instruction. The fox offers brief optional encouragement or requested help. The table gives exact English dialogue because English is the actual teaching language. Later teaching-language packs require natural authoring of this dialogue as well as explanations. “Silence” means no speech bubble, autoplay speech, correctness signal or pose change during entry.

| Screen or moment | Purpose and trigger | Exact optional dialogue | Visual state | Dismissal and accessibility |
|---|---|---|---|---|
| Arrival | Orient after a target is chosen | “We will build one useful message, one step at a time.” | neutral, still | Minimize commentary; essential outcome remains as heading; decorative image has empty alt |
| Before first attempt | Permit thinking when examples close | “Take the time you need. Help is here if you want it.” | neutral, still; disappear into quiet state on entry | One optional line; no repeated announcement; removable without hiding instructions |
| Sentence composition | Protect concentration, from focus to submission | **Silence** | neutral, still; hidden on mobile keyboard | No live region, sound, automatic hint or reaction to keystrokes |
| Help chooser | Give control after explicit Help | “Would you like a small cue or a worked example?” | thinking, still | User chooses; Escape returns to input; no instructional support logged until delivered, request still recorded |
| Specific hint | Deliver the authored language-specific cue after selection | Exact cue from the language lesson, once | coach, still | Cue is essential teacher text even with companion minimized; log content/version/tier and display status |
| Partial or wrong meaning | Normalize repair after submitted work | “We can change one part.” | retry, still | Actual diagnosis sits in the teacher feedback, not the fox; one polite status announcement |
| Answer reveal | Make the next assessment boundary clear | “You've seen this example. Let's try a different message.” | coach, still | Voluntary reveal; no loss of access; record full exposure; next task has a different eligible combination |
| Verified independent success | Recognize precisely recorded evidence | “You made a new sentence without an in-app hint.” | celebrate, still after assessment | Only if qualifying first attempt, fresh combination and no answer-bearing support; no sound/confetti; never claim fluency |
| Supported success | Acknowledge correction honestly | “That expresses the message. You used help on this try.” | coach, still | Same respectful treatment; no false independent badge |
| Transition | Offer continuation or stopping | “Another short pattern is ready when you are.” | neutral | Next lesson and Stop remain equally accessible; no streak pressure |
| Return visit | Invite retrieval before a model | “Try one message first. Then we can bring back the explanation.” | neutral | Due-review reason is ordinary text; learner may choose another lesson |
| Recovery | Reassure after a known draft was recovered | “Your saved draft is here. Continue when you are ready.” | neutral | Speak only after confirmed recovery; unresolved conflict stays explicit; no claim unsaved work is safe |
| Service failure | Keep the lesson usable after optional service failure | “You can keep learning by typing.” | neutral | Technical retry/discard options are essential text; no error blamed on learner |

The minimized setting persists per account, with a local session fallback when saving fails; changing language must not reset it. An image accompanying the same text is decorative. If the fox is the logo link, its accessible name is “LingoMitra home.” No expression substitutes for a correctness label. User-requested fox hints enter the same assistance ledger as teacher hints; omitting a bubble does not erase previously delivered help.

## Exact Lesson 1 adaptations across all seven targets

These brief lines are additional optional companion copy. They do not replace the complete teaching branches in the appendices. Neutral state stays still before the attempt; coaching appears only after Help; any success line requires a saved qualifying result. During construction, every pathway uses silence.

| Target | Arrival line | Requested first cue | After verified independent message |
|---|---|---|---|
| German | “You will make a request and choose the drink.” | “Who is making the request?” | “You built a new drink request without an in-app hint.” |
| Spanish | “You will tell someone what you need or are looking for.” | “Which meaning do you want: needing or looking for?” | “You made the new need or search message yourself.” |
| French | “You will help someone understand your preference.” | “Does this message say like or don't like?” | “You made a new preference sentence without an in-app hint.” |
| Hindi | “You will check how you and your group are doing.” | “Who is the message about?” | “You made a new check-in message without an in-app hint.” |
| Mandarin | “You will state a drink choice for this breakfast.” | “Whose choice are you describing?” | “You built a new drink-choice sentence without an in-app hint.” |
| Japanese | “You will help a visitor identify something nearby.” | “Which thing are you identifying?” | “You made a new identification sentence without an in-app hint.” |
| Kannada | “You will choose or decline a drink and offer one.” | “Does this message want the drink or decline it?” | “You made a new drink message without an in-app hint.” |

Avoid combining the general arrival line with the language-specific one; choose the relevant line, once. Test minimized, occasional and standard companion visibility in formative sessions. Ask about clarity, confidence and distraction after the activity; inspect unsolicited glances, input obstruction and unnecessary help requests. Greater visibility is a hypothesis, not an assumed improvement. Reuse these assets until a specific comprehension problem demonstrates a missing state.


---

# LingoMitra: technical audit and additive architecture proposal

Verified source and published-price date: **10 September 2026**. Source root: `/workspace/sites/lingomitra`, clean commit `ff6711c`. The audit combined source inspection, execution of all 35 existing tests, deployment verification, and limited public browser checks. All 35 tests passed, with no application changes. No production learner-record queries or paid model calls were performed. Deployment success does not establish every workflow's behavior. References below identify source files and individual lines or functions; historical validation documents are distinguished from checks executed in this audit.

The application already has the right basic architecture for a small learning product: a React interface, an authenticated Worker, D1 persistence, authored lessons, bounded assessment, and optional AI. The proposal should extend those mechanisms. The highest-value work concerns the meaning of completion, exposure across routes, recovery at transaction boundaries, and measurement of real provider spending.

**Source provenance requires reconciliation before implementation.** Deployment inspection verified Sites version 2 at `ff6711c` and live asset `index-CmN03uZz`, matching this checkout. Separate GitHub inspection found `Bhanu9Prakash/lingomitra-fullstack` main still describing the older Express application; `worker/learning-content.ts` was absent and the `ff6711c` lookup failed. Those observations mean the named GitHub main cannot yet be treated as the deployed baseline. If implementation is approved, establish which repository/branch will own the deployed Worker source, preserve the current snapshot, and make the proposed reconciliation reviewable before pushing. No push or reconciliation occurred in this audit.

## What exists and must be preserved

| Responsibility | Current implementation and evidence |
|---|---|
| Identity | `worker/core.ts:32`, `account()`, reads dispatcher identity headers and upserts on unique `users.chatgpt_id`; email/name update display fields. |
| Account ownership | `worker/index.ts:36` authenticates before learning, progress, chat, conversation, and admin routing. Learner queries use the authenticated internal `user.id`. |
| Course catalog | `scripts/catalog.mjs` derives stable string lesson IDs from tracked Markdown. The inventory and test fixture cover 209 lessons across seven languages. |
| Learning state | `worker/learning.ts` owns the current step, answer, assistance, exposures, version, feedback, and next review; the client sends actions. |
| Assessment | `worker/learning-content.ts`, `worker/learning-validator.ts`, and `shared/learning.ts` separate authored targets from public teaching content. |
| Persistence | `db/schema.ts` and three SQL migrations define legacy progress/chats plus learning sessions, events, drafts, preferences, and AI counters. |
| Storage | `.openai/hosting.json` names D1 `DB` and R2 `BUCKET`. R2 is used for blog images, not learner recordings. |

Keep every existing `users.id`, `users.chatgpt_id`, lesson string ID, progress row, and old progress interpretation. Preserve all 209 lessons: German 39, Spanish 25, French 25, Hindi 25, Chinese 30, Japanese 35, Kannada 30. Migration `0002_powerful_ted_forrester.sql` is already additive; it creates four tables and adds preferences without rewriting legacy progress. Do not repeat that migration as if these structures were missing. Do not edit published migrations or use email to import/link historical accounts. The README explicitly states that the old external database was not imported; preserving current D1 data and importing a historical database are different projects.

The Worker does not verify a ChatGPT token itself. Its trust boundary is the dispatcher-protected `oai-authenticated-user-id` and email headers. The manifest proves logical bindings, and the README documents the ingress contract; neither proves that every possible alternate host strips forged headers. Existing request tests inject these headers directly and test missing identity/query impersonation, not the real dispatcher's anti-spoofing. Verify that contract through supported platform controls before changing hosting. There is no source basis for adding a second authentication provider. Top-level sign-in/sign-out navigation, account cache clearing on identity change, an identity-keyed React subtree, and logout recovery-buffer removal already exist in `client/src/hooks/use-auth.tsx`.

Prepared statements, ownership predicates, admin checks, cross-origin write checks, bounded JSON/audio bodies, and private/no-store API responses are implemented. `client/public/service-worker.js` excludes APIs and authentication routes and caches selected static assets. Retain these safeguards. Shared public blog images are a deliberate exception, served with public caching. These source facts do not constitute a penetration test.

## Progress, language, and assessment semantics

There are two deliberate progress systems. `user_progress` describes original course activity completion and self-practice review. `learning_sessions` and `learning_events` describe three German starter activities and their assessed evidence. Finishing a guided activity does **not** mark its linked legacy lesson complete. Profile copy and `AbilitySummary.tsx` already distinguish completion from demonstrated constructions. Preserve that distinction in any redesign; do not translate completed lessons into mastery, proficiency, or a CEFR level.

| Authored activity | Linked legacy lesson | Current entry behavior |
|---|---|---|
| `de-starter-01` | `de-lesson01` | `/learn/de-starter-01`; the ordinary lesson route also renders the guided activity unless `?notes` is present. |
| `de-starter-02` | `de-lesson06` | Guided path/Today links; the ordinary lesson route remains self-practice. |
| `de-starter-03` | `de-lesson09` | Guided path/Today links; the ordinary lesson route remains self-practice. |

Evidence: `worker/learning-content.ts:23`, `:37`, `:48`; `client/src/pages/LessonView.tsx:177`. This inconsistent entry mapping is a product-design question, not missing persistence. Add a catalog relationship and clearly labelled guided/self-practice options for linked lessons instead of silently changing old completion counts.

Confirmed semantic defect: review start resets the sole session's `completed` field to false (`worker/learning.ts:74`), while prerequisite warnings derive from that same field (`:34`). An already completed prerequisite can therefore look incomplete while its review is underway. Add immutable `lessonCompletedAt` and separate current-run status. Preserve old evidence events and derive historical completion from an actual finish event or saved completion, never from a guessed score.

Guided progression intentionally permits continuing after an incorrect/unrecognized attempt or revealed example. `canAdvance()` requires an attempt or reveal, not correctness. The finish screen reports activity completion, and independent evidence comes from qualifying attempt events. This is appropriate for an unlocked, supportive path. Legacy version-2 self-practice rejects correctness scores and saves `score:null`; its completion payload is structurally validated, not independently graded (`worker/progress.ts`). Version-1 legacy scores remain accepted for compatibility. They are client-submitted historical activity data, unsuitable as new assessment evidence.

Language ownership is already explicit in course progress, conversations, and learning sessions; draft keys embed the language-specific lesson ID. Reset removes only that account/language's progress, lesson chats, starter sessions/events, and drafts. It deliberately leaves roleplay sessions and usage counters. Settings copy names what is removed. English is the only supported explanation language; native/known-language preferences do not translate instruction. The guided registry and runner are currently German-specific, including a hardcoded `de` insert. Before adding another assessed language, add `targetLanguage` and `explanationLanguage` to activity metadata and use them in storage, routes, speech, and rendering. Keep language-specific validators rather than applying German normalization globally.

`learningSummary()` currently offers the newest unfinished draft across languages, but its assessed activities/reviews are German. It does not merge the original courses' self-practice review queues into Today. A unified suggestion response can include a labelled source/mode/language for each item while preserving both underlying systems.

## A useful public attempt before sign-in

Deployed browser inspection reached public landing/About/blog, seven language choices, and the German preview. Japanese selection led to authentication. A wrong-meaning German preview answer produced the same worked example rather than a grade, consistent with `TryGerman.tsx`: Compare is a reveal action. Browser inspection did not cross sign-in, so authenticated rendering, provider configuration, and real account synchronization remain unverified.

The smallest addition is one public authored starter for each of the seven languages, using a common presentation component with language-specific teaching content. Give a meaningful purpose, a small set of supplied words/forms, one example, then put the example away and ask for a different meaningful combination. Keep the written attempt while the learner optionally compares, reveals, retries, or chooses to save future learning with ChatGPT. These are guest self-practice records, not accounts, proficiency scores, or saved mastery. New scripts require language review; the current German checker is not a multilingual validator.

A formative study can test the first-independent-production timing hypothesis without a guest identity subsystem. Record study arrival, task presentation, first submitted attempt, any displayed support, and the first assessor-judged correct new combination. Start the study clock at actual arrival, not after the teaching example. Report baseline knowledge, support used, noncompletion, and elapsed versus active time separately. An independent assessor can code guest answers against a prespecified meaning/form rubric; that observed study outcome remains separate from server-stored evidence. No current app field establishes a comparative learning gain or guarantees a time target.

Begin with self-practice plus observed study scoring. If immediate checks materially help, add a narrow stateless public endpoint for approved public prompts that reuses the corresponding server validator, with existing body/origin limits and no D1 write or model call. Do not copy a second grader into the client. It may report limited correctness but cannot certify independence. After sign-in, register the preview material already shown and use a fresh held-out account task. Preserve a guest draft only as visible practice context/recovery; never silently convert it into authoritative independent evidence.

## Exposure, assistance, and the strength of evidence

Existing controls are substantive. Public steps omit targets, hints, answers, correct-option keys, and exposure keys (`worker/learning-content.ts:63`). Authored examples register semantic exposures. The initial baseline and German preview prevent the opening water request from earning new-independent credit when already demonstrated/revealed. Hints, reveals, and diagnostic corrections mark assistance; a corrected repeat is not a fresh independent construction. Review evidence requires at least 24 hours since relevant previous practice and does not automatically lengthen spacing after supported performance.

Normalization is deliberately narrow (`worker/learning-validator.ts:5`): Unicode NFC, case/spacing/punctuation handling, and `moechte` support. It preserves the meaningful distinction between *möchte* and *mochte*. Semantic checks consider requested drink/language, subject/register, action placement, and requested politeness. Several natural articles and *gern/gerne* variants are accepted. Unsupported alternatives remain unassessed, with an explicit checker-limitation message. Do not replace this with fuzzy string similarity, remove meaningful diacritics globally, or equate a matching transcript with pronunciation competence. The three scripts remain `awaiting-human-review`.

Three source-supported exposure gaps need attention:

1. `recordLearningSupport()` only updates currently unfinished sessions (`worker/learning.ts:53`). Notes/tutor use before a starter exists, or between completion and a new review, leaves no durable exposure record for that future run. The preview flag is only a sessionStorage signal used at initial session creation. Previously seen material can therefore be described more strongly than the app's observation warrants.
2. `LessonContent.tsx:27` owns `notesOpen`, but only its child `LearningLoop` is keyed by lesson ID. If the parent remains mounted across lesson navigation, newly selected notes can appear while the old open state persists, without another support request. The same pattern can carry notes across a language switch. Browser reproduction is still needed; resetting/keying the notes component and recording each opening are small targeted changes.
3. Help requests are recorded **before** notes/tutor retrieval or provider success. This conservatively prevents false independence, but unsuccessful help can still mark the whole run assisted. Conversely, `chat/init` can return previous assistant history without a support event; ordinary ChatUI opening displays that history before a new learner message triggers server-side support recording. Existing guided tutor opening explicitly records support, so the gap concerns alternative entry paths.

Add material-exposure records to the existing event approach: account, language, material ID/version, source, related run if any, and requested/delivered/display-acknowledged status. Register relevant reference exposure even without an active starter; carry that context into later assessment. Acknowledging display is an observation, not proof of attention. Do not infer independence from absence of a browser acknowledgement. Keep a conservative distinction between step-specific hints and broad notes/tutor support, and explain when broad support affects the whole run.

Optional tutor prompts already use server history and exposed teaching (`worker/chat.ts`, `worker/coach-context.ts`), ignoring browser-supplied assistant turns/scratchpad as authority. Prompt constraints cannot guarantee a model will never supply an answer or unfamiliar material. Keep tutor output as unassessed help. Original course content is intentionally available through unlocked lesson endpoints, and off-app help cannot be detected. “Independent” should mean “qualifies under the recorded in-app conditions,” not a secure examination or demonstrated causal learning gain.

## Saving, recovery, and transaction boundaries

Guided events already have an account-scoped UUID, version comparison, conditional session update/event insert in a D1 batch, and replay returning the newest saved view (`worker/learning.ts:96`, `:154`). Two simultaneous attempts cannot both overwrite the same version. `GuidedLesson.tsx` retains an in-flight request for retry, reconciles newer typing, preserves displaced text separately, and uses account/activity/step-scoped sessionStorage recovery with a 24-hour expiry. It warns before leaving with unsaved work. Do not propose these as missing features.

Legacy drafts have versioned saves, explicit conflict recovery, debounced autosave, and a leave warning (`use-lesson-draft.ts`). Their unsaved text is only in the mounted component; a forced reload can lose it. Reuse the guided recovery helpers for these drafts. Version checks also do not make a lost-response retry idempotent: a successful legacy draft save whose response disappears can return 409 on retry. An optional mutation ID can distinguish a replay from an actual competing edit.

Legacy finish spans a draft save, progress save, then an asynchronous save of `draft.step=3` (`LearningLoop.tsx:16`). Failure during the last step can leave completed progress with an unfinished draft that Today resumes. Add one narrow completion endpoint that validates the draft version and commits the final checkpoint plus legacy completion together. It should be idempotent and preserve existing completedAt and progress semantics. Until then, the summary should reconcile completion and draft state explicitly.

Legacy progress has a server-side compare-and-swap around its read/write, protecting overlapping requests. It does not accept the client's previously observed version. A sequential stale browser payload can still replace newer notes; immutable completion protects only some fields. Add optional version/mutation fields compatibly and expose a real conflict choice. Do not advertise universal cross-device conflict safety from the existing concurrency test alone.

Chat and roleplay also compare versions, but call the provider before committing history and have no request UUID. Lost responses, cancellation, or competing tabs can spend another model call, then conflict or duplicate a user turn on retry. Use a small D1 request ledger with a unique account/request ID, reserved/running/succeeded/failed/uncertain status, target conversation version, provider/model, usage, and durable result reference. Exact-once provider execution is not guaranteed across a crash; represent uncertainty and reconcile before retrying. No queue, distributed agent framework, or new database is needed for this scale.

## Time and operational measurement

The guided `ActiveClock` counts visible, unpaused lesson time, including quiet thought and **active listening**. It stops during saves, hidden intervals, completion, and the optional tutor panel. The server caps each reported delta to elapsed time since its previous update (`worker/learning.ts:100`). This is an engagement estimate, not attention detection. Device read-aloud has no separate listening event, but listening on a visible teaching step still counts through the clock. Preserve listening and reflection rather than switching to keystroke-only timing.

Legacy `timeSpent` measures wall time since component mount, capped at eight hours; the server retains the maximum rather than summing visits. It includes time hidden behind the tutor and potentially an inactive tab. Roleplay initializes duration to zero and never increments it. Do not combine these three fields as comparable “active learning minutes.”

Arrival capture already exists on public entry: `client/src/components/Layout.tsx:26` calls `arrivalTime()` in an effect keyed by route location, including public routes. `client/src/lib/learning-api.ts:8` retains the original sessionStorage timestamp while it is less than 24 hours old. Preview/guided calls reuse that mechanism. The specific limitation is that one per-tab timestamp can combine separate visits within that window; persistence through actual authentication navigation and across tabs remains unverified. Existing analytics hooks are no-ops. Add visit/run identifiers and explicit started/completed timestamps while retaining the existing arrival capture. Keep elapsed-to-first-attempt, elapsed-to-first-qualifying-production, and active time separate. Review runs currently share the original session ID/beganAt/activeMs, and review start has no explicit run-start event; this limits session-level attrition and cost analysis.

## AI, audio, and retention

`worker/ai.ts` uses `gpt-4.1-mini`, `gpt-transcribe`, and `gpt-4o-mini-tts` by default, with server environment overrides. Gemini `gemini-3.7-flash` is the text alternative only when no OpenAI key exists. This is configuration selection, not automatic failover after an OpenAI error. Chat sends at most eight history messages of 2,000 characters each, with 600 OpenAI output tokens or 700 Gemini output tokens; provider requests time out after 45 seconds.

Atomic daily reservations already enforce 20 chat, five transcription, and ten cloud speech calls per account (`worker/usage.ts`). Failures consume reservations. Authored steps, deterministic checks, hints, and typed self-practice need no provider call. Device speech is selected when no OpenAI key exists or the local speech allowance is exhausted. A cloud provider failure currently produces a playback error rather than device fallback. Offer an explicit device-voice retry while keeping the written material usable.

Counters are not an invoice ledger: text tokens are aggregated without provider/model, cache category, run ID, or request outcome; transcription duration and generated audio tokens are not recorded. Gemini thinking tokens are not included in `candidatesTokenCount` accounting. Aborted/timed-out calls can remain billable despite no successful local usage record. Add those dimensions to the proposed request ledger, retain existing allowance counters, and reconcile aggregates against provider usage. A per-account quota does not bound total site spending; add an operator budget mechanism based on actual provider capabilities, without gating free authored lessons.

The active `ModernVoiceRecorder.tsx` flow obtains in-page consent, then browser permission, records on deliberate action, stops after one minute, releases microphone tracks/resources, and offers discard or transcription submission. Successful transcription fills editable text; a separate Send action goes to the tutor. Failed transcription keeps the clip available in memory for retry. Current code does not persist raw audio in D1/R2. The older `useAudioRecorder` hook is only used by an unused alternative component; its shortcomings should not be reported as the active recorder's behavior.

Consent is currently component state, not a versioned server record. If consent provenance is required, store purpose/policy version/time, not audio. Publish precise app/provider retention distinctions after checking the configured provider account; provider retention, backups, and contractual deletion were not verified here. App deletion cascades owned D1 records and removes owned R2 uploads before deleting the user; the UI then signs out and clears its recovery buffer. Reset does not clear the device recovery buffer, so stale recovery may reappear until expiry/dismissal. Add scoped cleanup after reset and a recoverable deletion process for partial D1/R2 failures if operations justify it. Cloud playback uses a component-memory object URL revoked on cleanup; do not place private replies in a shared audio cache. Reviewed generic teaching audio could later use R2 with content/language/voice/version keys.

## Published prices and a transparent scenario

Prices below were fetched from primary provider pages on **2026-09-10**. They are observed published prices and may differ from configured models, future rates, discounts, account terms, taxes, or the actual Sites billing arrangement. No invoices, production overrides, or paid calls were verified.

| Source default | Published planning rate |
|---|---|
| GPT-4.1 mini | $0.40/million input tokens, $0.10/million cached input, $1.60/million output. [OpenAI model pricing](https://developers.openai.com/api/docs/models/gpt-4.1-mini) |
| GPT-Transcribe | $0.0045/minute published transcription estimate. [OpenAI transcription pricing](https://developers.openai.com/api/docs/models/gpt-transcribe) |
| GPT-4o mini TTS | $0.60/million text input tokens and $12/million audio output tokens. [OpenAI speech pricing](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts) |
| Gemini 3.7 Flash alternative | Standard paid tier: $0.75/million input and $3.75/million output including thinking through December 31, 2026; page lists $1.50/$7.50 from January 1, 2027. This is not the OpenAI-path assumption below. [Google pricing](https://ai.google.dev/gemini-api/docs/pricing) |

Define cost per completed run as **all attributable provider spending from completed and abandoned starts, including charged retries/failures, divided by completed runs**. Then add hosting/storage and amortized content/review work separately. Track completion rate and educational evidence alongside cost so abandoned learning is not hidden by a cheap “successful call” denominator.

Illustration, not forecast: 1,000 starts and 700 completed runs. Each completion uses four text calls; 300 abandoned starts use one each; another 350 charged-equivalent retry/failure calls are included. Every text call is assumed to use 1,500 uncached input and 150 output tokens. One call costs $0.00084; 3,450 cost $2.898, or **$0.00414 per completion**. Real failed-call charges must replace this conservative simplifying assumption.

For a voice scenario, assume 850 transcription minutes total, including incomplete/retried clips: $3.825. Assume 800 cloud speech requests, each with 250 text input and 1,000 audio output tokens: $9.72. These are token assumptions, not a claim about speech duration. Combined provider cost becomes $16.443/700 = **$0.02349 per completion**. Core authored-only learning has **$0 marginal model cost**, with infrastructure/content costs still present. None of these scenarios claims measured learning quality or actual usage.

Cloudflare's published Workers Standard example uses a $5 monthly subscription, with ten million requests and 30 million CPU milliseconds included; excess rates are $0.30/million requests and $0.02/million CPU milliseconds. These are infrastructure reference rates, not a verified LingoMitra bill. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

D1 Paid includes 25 billion read rows and 50 million written rows monthly; excess rates are $0.001/million reads and $1/million writes. Five GB is included, then $0.75/GB-month. Read costs concern scanned rows, not only results. The current account upsert on each authenticated request and summary history scans should be measured before optimizing. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)

R2 Standard lists $0.015/GB-month, $4.50/million Class A operations, and $0.36/million Class B operations, with a free allowance and no Internet egress charge. Keep this separate from model costs; current learner audio generates no R2 storage charge because it is not stored there. Actual platform allocation remains unknown. [R2 pricing](https://developers.cloudflare.com/r2/pricing/)

## Smallest useful next architecture and verification

Retain the Worker, D1, R2, existing APIs, and account keys. First correct entry-point exposure handling and separate historical completion from current review state. Add run IDs/lifecycle events to the existing event model, reuse recovery helpers for legacy practice, and make final practice save one idempotent transaction. Next add the AI request/usage ledger and explicit fallback choices. Version authored content immutably and resolve its saved version in every consumer, including tutor context; current missing-version handling fails safely but can block the whole summary when one session lacks its content. Add language metadata when extending the pilot. Optimize queries or materialize evidence summaries only after measured growth warrants it.

All **35 existing tests were executed and passed** in this audit, with no application changes. They span `tests/migration.test.ts`, `tests/learning.test.ts`, and `tests/learning-client.test.ts`, using real in-memory SQLite SQL with a D1 adapter and stubbed provider responses. Coverage includes populated migrations, ownership, language reset, event replay/CAS, recovery helpers, timing, all three scripts, bounded normalization, assistance, delayed review, quotas, and editable transcription. Passing these tests does not verify dispatcher ingress, production synchronization, actual microphones, rendered notes across navigation, model pedagogical behavior, qualified teacher review, or human learning gains. The source-supported risks identified above remain specific scenarios for targeted validation; the existing suite is not evidence that those untested scenarios pass.

Targeted acceptance should exercise precisely those unresolved boundaries: existing-account preservation; same-account two-device conflict/retry; notes and old tutor history before/during/between starter runs; language switching with open notes; review without losing historical completion; lost responses during legacy finish; hidden/paused/listening timing; provider failure and cancellation accounting; microphone denial/discard/unmount; and account deletion/reset recovery behavior. Keep results labelled as source, synthetic test, deployed browser observation, or human learning evidence.


---

# Shared schema, delivery rules, and remaining design decisions

The machine-readable deliverable contains one common schema and seven populated Lesson 1 examples. It is an **author/reviewer artifact** with answer keys. It must never be shipped wholesale as a public lesson payload. The examples preserve the full authored language detail while giving the shared system consistent metadata, teaching-step and prompt fields. They are design data, not an implemented renderer, validated multilingual grader or production migration.

## Shared contract

| Field | Purpose and boundary |
|---|---|
| schema_version; stable_id; version | Schema compatibility, permanent activity identity and immutable content version; sequence position belongs to a separate pathway list |
| legacy_ids | Many-to-many reference links to existing lesson IDs; never an instruction to rename or equate completion |
| target_language; teaching_language | Explicit code, variety and explanation language; no hidden German default or automatic translation |
| script_requirements | Actual scripts, input modes, reading support, normalization constraints and audio status |
| outcome; prerequisites | The communicative result and previously taught ingredients; prerequisite evidence can suggest a recap without locking access |
| vocabulary; structures | Reviewed forms, meanings, readings and local patterns; an inflection is a taught form, not an assumed spelling transformation |
| teaching_steps | Stable step ID, interaction kind, exact teacher text, prompt references and retained authoring detail including models, branches and transition destinations |
| prompts | Stable prompt ID, meaning/context cue, expected response and accepted-variant policy, support ladder, misconception feedback and assessment conditions |
| accepted_variants; hints; misconceptions | Author-only language-aware decision material indexed by prompt; no global string similarity or universal diacritic stripping |
| assessment_rules | Semantic novelty, support/modality criteria, error dimensions and uncertain-judgment behavior |
| review; review_tags | Retrieval tasks, protected new combinations and scheduling hypotheses; models and reserved combinations have different exposure roles |
| review_status | AI authorship, teacher/speaker review, audio, learner testing and publication status recorded independently |

The seven example identities are `de-starter-01@2.0.0`, `es-starter-01@1.0.0-draft`, `fr-starter-01@1.0.0-draft`, `hi-checkin-001@0.1.0`, `zh.drink-choice@0.1.0`, `ja.table-identification@0.1.0`, and `kn-drink-choice-001@0.1.0`. German retains the existing activity ID and previous 1.0.0 version. The other six IDs are proposed additions. Different naming styles are legal opaque identities, not language-specific application logic; choose one convention for future new IDs while preserving any already saved identifiers.

The common renderer needs only a small set of interactions: orientation, teach/model, meaning choice, free response, requested help, feedback, script/listening practice, and finish/review. Language modules own the forms, role context, variant policy and diagnostic checks. Content files can be static versioned assets in the repository; the Worker selects public steps and keeps answers/validation material server-side. D1 remains the learner-data store. R2 is appropriate for reviewed shared audio if added, using language/content/voice/version keys. No vector database, unrestricted curriculum chatbot, new authentication provider or agent orchestration service is needed.

## Constraints on optional generation

Keep generation outside the essential path. First use a finite authored set and approved semantic combinations. If variety is later useful, the server supplies an allowlist of vocabulary IDs, surface forms, structure IDs, meanings, register and already-seen/reserved tuples. A proposed exercise must identify every required form and cite its introduction step. Check those references against the learner's taught inventory and the selected language grammar template. Reject unknown inflections, unintroduced script operations, ambiguous roles and reserved-answer collisions. A vocabulary allowlist alone cannot guarantee a grammatical or natural sentence.

Generated output initially enters an authoring/review queue, not the assessed beginner curriculum. For optional live practice, identify it as AI practice, accept uncertainty, and never use it as the sole source of mastery evidence. If text escapes a finite template or uses a new form, supply an explicit teaching step or fall back to a reviewed prompt. Do not silently expand the lesson to accommodate a model's response. Provider prompts are not a security or linguistic guarantee. No model calls are required for the populated scripts or the deterministic opening checks.

## Additive migration and rollback procedure after approval

1. Preserve the verified deployed source and inspect supported export/restore mechanisms. Confirm which remote branch owns it before any push. Record schema version and existing ID/count checks; do not copy real user answers into development fixtures.
2. Add new curriculum/version registries, pathway ordering, run lifecycle and material-exposure records. Keep existing progress and historical learning events. Add a completed-ever value derived only from actual recorded completion, separately from review-in-progress. Do not edit already-applied migrations.
3. Backfill references and trusted completion timestamps idempotently. Leave missing evidence unknown. Link existing users by their stable authenticated identity and existing internal IDs, never by matching display names or email guesses. Build uniqueness constraints for account/event UUID and account/request UUID.
4. Enable new readers behind pathway feature flags. Old URLs remain valid and old content versions remain resolvable. New assessments create new evidence with prompt and validator versions; they do not rewrite prior scores. A failed lookup shows a recoverable reference/practice route instead of breaking all Today data.
5. Commit attempts and evidence atomically, with the existing compare-and-swap pattern extended to explicit run versions. An acknowledged replay returns the saved result. A real conflict offers the newer saved version and the local draft; do not silently overwrite either. Tie recovery buffers to account, target, activity, content version and step, and clear the appropriate scope on logout/reset/delete.
6. Validate one account across two real devices and two accounts on a shared device. Cover delayed responses, duplicate requests, offline recovery, a version switch and interrupted finish. Inspect results through supported authenticated tools after credentials are available, not by impersonating account headers against production.
7. Roll back by disabling new pathway readers/writes and restoring the prior compatible application version. Keep additive tables and new historical evidence for forward recovery. Do not run destructive down-migrations as routine rollback. If incompatible data writes become necessary later, require a separately reviewed backup/restore plan before them. A supported backup restores data only in a genuine recovery operation, not to erase new progress after an ordinary UI rollback.

The existing synthetic tests cover parts of this system; these steps are proposed changes and acceptance work. No backfill, feature flag, migration or rollback was executed in this phase.

## Sustainable free delivery and data defaults

The technical memo provides verified provider prices dated 10 September 2026 and an abandonment-inclusive scenario. The authored path has zero marginal AI/speech calls. The illustrative optional-text scenario is about **$0.00414 per completed session**; the illustrated text-plus-cloud-voice scenario is **$0.02349**, before infrastructure and editorial work. These are assumptions, not measured bills or a quotation for Sites hosting.

Language costs should be measured, not guessed from character count. The same price schedule can produce different token counts, recording durations, retries and reviewer costs. Use the following per-pathway planning checks, then replace assumptions with actual usage:

| Target | Expected source of variation to measure | Essential fallback |
|---|---|---|
| German | Amount of optional explanation and correction of forms; no special price premium established | Authored typed checks and reviewed text |
| Spanish | Speech duration, variety recognition and accent corrections; no per-language token multiplier asserted | Typed meaning/form feedback with spelling separate |
| French | Listening replays and speech-recognition uncertainty with linking/negative forms | Written models and typed checks; listening marked unavailable when necessary |
| Hindi | Tokenization of Devanagari versus transliteration; IME friction and voice-recognition retries | Labelled transliteration or native-script typing; no microphone requirement |
| Mandarin | Character/pinyin tokenization, tone-support playback and transcript ambiguity | Character/pinyin construction; no invented pronunciation grade |
| Japanese | Kanji/kana/romaji token counts, long-vowel/segmentation retries | Typed script or romaji; phrase audio optional |
| Kannada | Kannada/Latin tokenization, provider coverage and recognition retries | Reviewed authored text and transliteration; no compulsory cloud speech |

Sensitivity examples, not language forecasts: if average uncached input rises from 1,500 to 3,000 tokens with the same 150-token output, the text call increases from $0.00084 to $0.00144, and the illustrated text cost per completion from $0.00414 to about $0.00710. Doubling the 850 transcription minutes adds $3.825/700, about $0.00546 per completed session. These computations use the rates and assumptions in the technical memo. Do not assign either increase to Kannada or Mandarin without measurement.

Record AI, transcription, TTS, storage operations/bytes and hosting separately. In the reference Worker pricing scenario, a $5 fixed monthly charge would add $0.005 per completion at 1,000 monthly completions, or $0.0005 at 10,000. This arithmetic does **not** establish that Sites charges LingoMitra that fee. Hosting entitlement and billing are still unverified. Content editing, teacher review, recording and participant recruitment are labor expenses requiring real quotations; no free-content promise makes those costs disappear.

Retain static caching for public teaching assets; never place private answers, transcript audio or API records in a shared cache. Reuse reviewed generic audio across learners. Deduplicate optional calls, cap context/output, retain current per-account allowances, and add operator cost alerts and a configurable global optional-service ceiling. A limit message says, “Cloud practice is unavailable right now. Continue with the lesson, type your answer, or try a device voice.” It must not offer a paid upgrade or close lesson access. Anonymous rate limits apply only to check requests; reading and manual comparison remain available.

Proposed data policy for review before implementation:

- Keep essential account progress/evidence while the account is active or until the learner deletes it. Store only what supports learning, recovery and auditability. Let learners delete conversation histories independently; do not silently rewrite previous raw evidence into fabricated mastery after deletion.
- Retain recovery drafts for the existing 24-hour local window, scoped to account and language. Shared-device sign-out removes them. Unsubmitted voice remains in memory only and is discarded on explicit discard, route cleanup or session termination; raw voice storage is off by default.
- Optional research audio requires separate purpose-specific consent, restricted access and a proposed 30-day deletion deadline after transcription/rating. If long-term identifiable audio is needed, request separate consent with a specified purpose and duration. Do not infer research consent from microphone permission.
- Proposed diagnostic logs retain request/error metadata for 30 days and aggregate usage/cost totals for 12 months; omit raw answers, recordings, authentication headers and precise personal profile fields. Validate these durations against operational needs before adopting them.
- Provide plain in-app explanation of essential learning events versus optional research analytics. Optional analytics opt-out must not stop saving learning. Account deletion should expose pending/completed/failed status and retry partial cleanup. Provider retention and backup erasure depend on the configured provider/account and platform contract, which were not verified here; describe those separately after verification, without promising immediate universal erasure.

These periods are proposed product defaults, not current inspected retention guarantees or legal findings. Core lessons and typed production remain usable without optional research, AI or voice consent.


---

# German: audit and proposed opening curriculum

**Original AI-drafted proposal, awaiting qualified German review.** Sources: `/workspace/sites/lingomitra/generated/catalog.json` and `worker/learning-content.ts`, root-verified baseline `ff6711c`. Preserve existing activity IDs and immutable `1.0.0` content/evidence. Proposed `2.0.0` scripts do not change historical records or the application.

## What the source establishes

All 39 titles/lengths were inspected; full reads cover `de-lesson01`, `02`, `03`, `05`, `06`, `09`, `18`, `20`, `30`, and `39`: opening, midpoint, later material and pilot dependencies. Other lessons have migration dispositions, not completed linguistic audits.

| Actual source | Observed evidence | Disposition and distinction |
|---|---|---|
| `de-lesson01`, 1,839 words | Nine pronoun entries, six ending rows, thirty verbs, sounds and translation. The standard-ending instruction includes exceptions such as `arbeiten`, `tanzen`, and `sitzen`. | Split into productive units. Overload is a hypothesis; the incompatible instruction is observable. Retain stem comparisons for a restricted verb set. |
| `de-lesson01`, “Common Mistakes” | Says she/they endings do not differ for the listed `-en` verbs; its own table gives `sie lernt` versus `sie lernen`. `suchen` is labeled “soft ch.” | Correct the contradiction and sound label before reuse. Teach formal `Sie` separately; sentence-initial capitalization alone cannot identify the referent. |
| `de-lesson02`, 1,678 words | Whole alphabet, umlauts and many combinations; `ich` repeatedly rendered “ish”; final `d` described as “slightly softer”; `qu` described as `kv` and compared with English *queen*. | Move short sound work beside useful words. Replace misleading equivalences with reviewed audio and optional IPA. Standard target `ich [ɪç]` is not exactly English “ish.” These are language issues, independently of lesson length. |
| `de-lesson03`, 1,364 words | Zero through twelve, teens, tens, compounds, hundreds, thousands, a million, and digital time before the first practice set. | Stage small numeral ranges and meaningful codes first; postpone compound numbers and minutes. The first three lessons total 4,881 whitespace-delimited words; this is a load measure, not proof of learner failure. |
| `de-lesson05` | Greetings, farewells, three address forms, and several “how are you” forms together. | Keep useful greeting chunks; soften fixed clock boundaries and social absolutes during qualified review. Phrase recall is useful but not evidence of generating a sentence. |
| `de-lesson06` | Six modal rows across the person paradigm, alongside a helpful action-final explanation. | Extract the action-final explanation, initially only with `ich möchte`. Its treatment of `möchten` as a special form of `mögen` is worth preserving. Review categorical permission claims separately. |
| `de-lesson09` | Calls a declarative question grammatically incorrect; gives `Können Sie mir Apfel geben?` while admitting an article is needed. | Teach the neutral verb-first question as the target; do not label every other question construction ungrammatical. Use complete natural models, never deliberately omit necessary material to expose a pattern. |
| `de-lesson18` | Useful `nicht`/`kein` contrast combined with a three-case, four-column ending table. | Introduce one communicative negation first; defer the table until noun gender and case are taught. Do not turn its broad noun-negation shortcut into an exceptionless rule. |
| `de-lesson20` | Twelve “always dative” verbs; the `glauben` note correctly distinguishes believing someone from believing something. | Keep this distinction; teach verb–meaning–complement combinations, rather than an unqualified “always” label. |
| `de-lesson30` | Models `Das ist roter Ball` and `Ich habe roten Ball`, then softens article omission as “unnatural or poetic.” | Replace everyday singular-count examples with normal article use; use mass nouns/plurals to introduce genuine article-free patterns. A declension ending can be right while the whole model is inappropriate. |
| `de-lesson39` | Correctly calls TeKaMoLo a guideline; its noun-object-placement example contains only adverbial/prepositional material. | Retain the flexibility warning, replace the irrelevant illustration, and revisit only after learners can manipulate shorter clauses. |

Grammar cross-checks: formal `Sie` addresses one or more people ([University of Texas, pronouns](https://coerll.utexas.edu/gg/gr/pro_02.html)); neutral yes/no questions use verb-first order ([word order](https://coerll.utexas.edu/gg/gr/con_06.html)); modal constructions retain an infinitive ([modal verbs](https://coerll.utexas.edu/gg/gr/vm_01.html)). `möchte` and `mochte` differ ([Duden](https://www.duden.de/rechtschreibung/moegen)). Article use and adjective endings are separate choices ([articles](https://coerll.utexas.edu/gg/gr/det_01.html), [adjectives](https://coerll.utexas.edu/gg/gr/adj_04.html)). These checks do not validate the curriculum or audio.

## Common delivery and evidence contract

The teacher explains in English; German vocabulary is explicitly glossed on separate teaching screens. The fox is static and neutral; no name is assumed. Optional coaching follows Help: “We can take one piece at a time.” It never completes typing. Independent response screens show only the English meaning prompt and blank input, with all German lexical cues, glosses, models and prior answers hidden and German word/answer audio replay unavailable. If a gloss remains visible or repeat target audio is available or used, classify the response as supported, even when correct. Help or returning to teaching also removes independent status. Log lexical teaching/audio exposures separately from complete target-sentence exposures.

For **German separately**, retain version, modality, prompts, attempts, help, models, preview exposure and timestamps. Separate completion, supported construction, independent typing, assessed speech and self-reported speaking. A transcript or “I said it” cannot establish pronunciation. Speech needs an unprompted recording and qualified listener or separately validated rubric; uncertain recognition stays unassessed.

Score meaning, taught structure, naturalness and orthography separately. `Tee, bitte` communicates a request but does not demonstrate the full target sentence. A natural alternative outside the taught form may earn communication evidence without proving this grammar target. Ignore harmless final punctuation for meaning/structure; retain noun-capitalization feedback. Explicitly teach `moechte`/`moechten` as keyboard alternatives. Do not silently accept `mochte`/`mochten`. Preserve the raw case of `Sie`; a whole-answer lowercase normalizer would erase a relevant distinction. Typed `Möchten sie …?` needs formal-address spelling feedback; speech has no capitalization score.

“New combination” means a taught-word/taught-pattern combination whose answer-equivalent target has never been modeled, hinted, attempted, supplied at baseline, or exposed in an earlier version. Changing context, punctuation, optional `bitte`, or the order of two requested drinks does not create novelty. Track structural novelty separately from meaning: adding `trinken` to a familiar request is a new construction, not automatically a new intention. Baseline and public-preview water requests are excluded. Unknown historical exposure conservatively blocks affected targets. Every attempt consumes its combination, successful or not.

Reserve pools are author-only. Check the complete exposure ledger; replace any exposed reserve with an eligible combination. If none remains, report “not yet measured” and expand vocabulary later. A repair is supported evidence. A different subsequent first attempt can be independent, with earlier support still reported.

## Lesson 1: ask for a drink — complete integrated script

**Identity:** `de-starter-01@2.0.0`; linked reference `de-lesson01`; no German prerequisite. **Outcome:** build a self-request, change or combine drinks, and add `bitte`. **Nine words, introduced in order:** `ich` = I; `möchte` = would like; `Tee` = tea; `Kaffee` = coffee; `Milch` = milk; `bitte` = please; `Wasser` = water; `Saft` = juice; `und` = and. **Structure:** `Ich möchte [drink(s)].`, optionally with `bitte`; `und` joins two drinks. Five to ten minutes includes thinking; first independent construction around three to five minutes is a hypothesis, never a timer or promise.

**0. Arrival and baseline, approximately 30–60 seconds.** Teacher: “Today you will build a request and change it yourself. You can type, choose Help, or say ‘I don’t know yet.’ Before we start: if you already know German, ask for water in a full sentence. Otherwise choose ‘I don’t know yet.’” No German answer is shown. Likely beginner response: “I don’t know yet.” Teacher: “Thank you. Let’s start with three pieces.” A correct baseline is recorded as prior ability; the learner can still choose the lesson.

**1. Make meaning, approximately 60 seconds.** Teacher: “`ich` means I. `möchte` means would like. `Tee` means tea. Listen: `Ich möchte Tee.` That means ‘I would like tea.’ You are requesting tea; you are not saying you already have it. The order here is I, would like, drink. German starts names of things such as `Tee` with a capital letter.” Play approved ordinary-speed and optional slow audio. “For this lesson, copy the sound from the recording. The `ch` in `ich` has no exact English spelling. If your keyboard cannot type `ö`, you may type `oe`: `moechte`.” Audio assets are a review requirement, not asserted to exist.

Teacher: “What is this speaker doing: requesting tea, or saying they already have tea?” Likely: “Requesting tea.” Correct feedback: “Yes. Keep that meaning as you change the drink.” Wrong/unsure feedback: “`möchte` expresses what the speaker would like. Choose the requesting meaning.” This recognition item does not earn construction credit.

**2. First construction, approximately 60–90 seconds.** Separate screen `coffee-word`: teacher says “`Kaffee` means coffee.” Show the word/gloss and provide its reviewed word audio; log the lexical cue and any audio playback. On Continue, close that screen and hide **all** German lexical cues, glosses, models and previous answers; remove German word/answer replay controls. New screen `coffee` has blank input and only this English meaning prompt: “At a café, ask for coffee in a full German sentence.” Expected first response, author-only: `Ich möchte Kaffee.` If any gloss remains visible or repeat target audio is available or used, classify success as supported. The three-to-five-minute independence hypothesis applies only after this cue-removal check passes. These branches are alternatives, not compulsory screens:

| Submitted state | Exact teacher response and support | Next different task |
|---|---|---|
| Correct: `Ich möchte Kaffee.` | “You kept the request and changed the drink. Let’s try it somewhere else.” Record first-attempt independence only if the exposure check passes. | Teach the milk word, then the office task below. |
| Partial: `Kaffee` or `Ich Kaffee` | “You chose coffee. A full request also needs who is asking and ‘would like.’ Which part is missing?” Permit a repair. If still incomplete: “Here is the complete request: `Ich möchte Kaffee.`” Record support, even if repaired correctly. | Teach milk; close the repair and require a fresh milk response. |
| Misconception: `Ich Kaffee möchte` | “You have the three pieces. In this request, ‘would like’ comes before the drink. The order is I, would like, coffee. `Ich möchte Kaffee.`” A learner who writes `Ich mochte Kaffee` instead hears: “The form for ‘would like’ here is `möchte`, or `moechte` on your keyboard. `mochte` is a different form.” | Teach milk; do not award new evidence for recopying coffee. |
| Stuck or Help | Fox, optionally: “We can take one piece at a time.” Teacher hint 1: “Who is making the request?” On another Help, hint 2: “Put the words for ‘I would like’ before the drink.” On another Help, hint 3: “Here is one complete request: `Ich möchte Kaffee.` You can read it, then try a different drink.” No timed hint escalation. | Teach milk; proceed even if the learner chooses not to copy. |

**3. All branches rejoin, approximately 45–60 seconds.** Separate screen `milk-word`: teacher says “`Milch` means milk.” Show its word/gloss and reviewed word audio; log the cue and any playback. Continue closes teaching, hides all lexical cues/models/prior answers and removes German replay controls. New screen `milk` has blank input and only the English prompt: “At an office, your host asks what you would like. Ask for milk in a full German sentence.” Expected, author-only: `Ich möchte Milch.` Accept `Ich moechte Milch.` After success: “That asks for milk. You chose the drink and placed it after ‘would like.’” Wrong drink: “Your sentence requests a different drink. Here the host needs your milk request.” Offer graduated hints, then reveal if requested. Visible glosses, available/used repeat target audio, and feedback-informed repairs count as support; none earns independent credit.

**4. Add politeness, approximately 60 seconds.** Teacher: “`bitte` means please. You can add it at the end: `Ich möchte Tee, bitte.` That means ‘I would like tea, please.’ `Ich möchte bitte Tee` is also natural. Both keep the request meaning.” Teacher: “`Wasser` means water. Now request water and include please.” Expected: `Ich möchte Wasser, bitte.` Accept `Ich möchte bitte Wasser.` This is practice; baseline/preview water blocks the unseen claim. Hints: “Which word adds please?” → “Put `bitte` at the end or after `möchte`.” → reveal the complete water request.

**5. Combine and transfer, approximately 90 seconds.** Teacher: “`Saft` means juice. `und` means and. You can request two drinks: `Ich möchte Tee und Wasser.` That means ‘I would like tea and water.’ The two drink names join with `und`.” Hide the model and words. “At a breakfast counter, request coffee and juice for your table in a full sentence; include please.” Expected: `Ich möchte Kaffee und Saft, bitte.` Accept reversed drink order, `bitte` after `möchte`, and taught `oe` spelling. Missing `bitte`: “The request is clear. This task also asked for please.” Missing a drink: “Your request names one drink. This task needs both.” Hints: “Which two drinks?” → “Join them with `und` after ‘I would like.’” → reveal the complete request. Repairs are supported; a wrong drink fails the requested meaning even with good grammar.

**6. Meaningful choice and close, approximately 30 seconds.** Teacher: “Choose tea, water or coffee for yourself and write what you would actually request.” Accept a natural choice without claiming it is unseen. “You practiced one request pattern. Your record will show which attempts you made independently and where you used help. Later we will check what you can bring back.” Show the actual evidence, not a generic mastery celebration. Offer the next lesson or stopping. Do not force further attempts to meet a timing target.

**Return plan:** cold retrieval plus an unused combination at each return. Candidate 24-hour transfer: milk and juice; seven-day transfer: tea and milk; alternate: coffee and milk. Each requests a different drink set; `bitte` variation and reversed noun order share its exposure key. Components were taught; full reserved sentences stay hidden. There are ten unordered two-drink sets from five drinks, with tea–water and coffee–juice already consumed. Review tags: `self-request`, `drink-slot`, `join-with-und`, `please`, `oe-keyboard`, `meaning-not-possession`.

## Lesson 2: put the action at the end — complete script

**Identity:** `de-starter-02@2.0.0`, linked `de-lesson06`; prerequisite L1 pattern and drink words, confirmed by retrieval or supplied recap. **Outcome:** express a wish to drink something or learn a language using an action-final construction. **New words:** `trinken` = to drink; `lernen` = to learn; `Deutsch` = German; `Englisch` = English; `Spanisch` = Spanish. Five to ten minutes remains a hypothesis.

**1. Retrieve.** Teacher: “Without looking back, request tea.” Expected: `Ich möchte Tee.` This is retrieval, not novelty. If unsure: “`ich` means I, `möchte` means would like, and `Tee` means tea: `Ich möchte Tee.` We will build on that.” Recap exposure is logged.

**2. Explain and model.** “`trinken` means to drink. To say ‘I would like to drink tea,’ start with `Ich möchte`, put the drink next, and put `trinken` last: `Ich möchte Tee trinken.` English puts ‘drink’ before ‘tea’; this German pattern puts it after the drink. You do not add another German word for ‘to’ here.” Hide the model. “Say that you would like to drink water.” Expected: `Ich möchte Wasser trinken.`

**3. Respond.** Correct: “You put the action at the end.” Partial `Ich möchte Wasser`: “Your request is clear. This task also asks you to include the action ‘drink.’” Misordered `Ich möchte trinken Wasser`: “Keep the drink between ‘would like’ and the final action.” Wrong form `trinke`: “After `möchte`, use the action form `trinken`.” Hints on request: “Which piece is the action?” → “The action follows the drink.” → “`Ich möchte Wasser trinken.`” On every path, the **different** next task is: “At breakfast, say you would like to drink coffee.” Expected: `Ich möchte Kaffee trinken.` Evaluate its first attempt separately; do not show its answer beforehand.

**4. Transfer domains.** Teacher: “`lernen` means to learn. `Deutsch` means German. `Ich möchte Deutsch lernen` means ‘I would like to learn German.’ The language goes in the middle and the action still comes last.” Then: “`Englisch` means English. Tell a course adviser you would like to learn English.” Expected: `Ich möchte Englisch lernen.` Correct: “You reused the order with a different action.” Wrong noun/action pairing: “That action does not express learning. Which taught action has that meaning?” Hints: “What do you want to do?” → “Put the language before `lernen`.” → reveal the English-learning sentence. The next different task after any reveal is “Say you would like to drink milk,” expected `Ich möchte Milch trinken`; this consumes that reserve if used.

**5. Check meaning and close.** “Does `Ich möchte Deutsch lernen` mean the person would like to learn German, or prove that they are studying now?” Expected: “Would like to learn German.” Correction: “It states a wish; it does not establish a current activity.” Teacher: “One more word for later: `Spanisch` means Spanish. It names a language, like `Deutsch` and `Englisch`.” Check the word’s meaning without displaying a full sentence. “Your action can now stay at the end while you change what you want to drink or learn.”

Accept the taught `oe` alternatives and harmless punctuation variation. A short drink request may communicate successfully but does not demonstrate the action-final outcome. Review tags: `wish-not-current-action`, `action-final`, `infinitive`, `cross-domain-combination`. At 24 hours, retrieve an old action request and independently construct an unused juice-drinking or milk-drinking combination; at seven days, use an unused Spanish-learning combination. These assess retained structure with known words. Familiar request meanings are not renamed new intentions.

## Lesson 3: ask someone formally — complete script

**Identity:** `de-starter-03@2.0.0`, linked `de-lesson09`; prerequisites L1 and L2, with support available. **Outcome:** ask a neutral formal yes/no question, with an optional final action, and interpret accepting/declining phrases. **New words/forms:** `Sie` = formal you; `möchten` = would like with `Sie`; `ja` = yes; `nein` = no; `danke` = thank you. `bitte` is retrieved. Five to ten minutes is a hypothesis.

**1. Retrieve and explain.** Teacher: “Say that you would like to drink tea.” Expected: `Ich möchte Tee trinken.` Supply a logged recap if needed. “Now you are addressing a visitor. `Sie`, with a capital S, is formal ‘you’; it can address one person or several. Use `möchten` with it. `Sie möchten Tee` means ‘You would like tea.’ A neutral yes/no question starts with that verb: `Möchten Sie Tee?` That means ‘Would you like tea?’ We are practicing this question pattern. Other question patterns also exist.”

**2. Construct.** Hide examples. “Ask your visitor formally whether they would like coffee.” Expected: `Möchten Sie Kaffee?` Correct: “You addressed the visitor and put the verb first.” Partial `Möchten Kaffee?`: “The question needs the word for the person you are addressing.” `Sie möchten Kaffee?`: “That can be a confirmation question. For this task, make the neutral question by starting with the verb.” `Möchte Sie Kaffee?`: “With formal `Sie`, use `möchten`.” Lowercase `sie`: “For written formal ‘you,’ keep the capital S in the middle of the question.” Hints: “Which piece begins our neutral question?” → “Start with `möchten`, then formal you.” → reveal the coffee question. Following any support, teach nothing new and ask a **different** task: “Formally offer your visitor milk,” expected `Möchten Sie Milch?`.

**3. Keep the final action.** Teacher: “With an action, keep it at the end: `Möchten Sie Tee trinken?` means ‘Would you like to drink tea?’ The beginning changes to a question; the action remains last.” Hide the example. “At a course desk, formally ask whether the visitor would like to learn English.” Expected: `Möchten Sie Englisch lernen?` Then: “At breakfast, formally ask whether your guest would like to drink milk.” Expected: `Möchten Sie Milch trinken?` Check each target separately. Action-placement hints: “Which part says what they would do?” → “Keep that action last.” → reveal that task’s answer. A fresh alternative is coffee with the final action if its full target has not been exposed; otherwise log supported practice only.

**4. Respond to meaning.** Teacher: “`ja` means yes; `nein` means no; `danke` means thank you. `Ja, bitte` means ‘Yes, please’; `Nein, danke` means ‘No, thank you.’ These are useful phrases.” “You do not want the tea. Which reply fits?” Expected: `Nein, danke.` Wrong/unsure: “Choose the phrase that declines the offer.” Further help reveals it. “Now you do want the offered drink. Respond.” Expected: `Ja, bitte.` Mark phrase recall separately from question construction.

**5. Close and return.** Teacher: “You practiced asking someone formally and choosing a reply that matches what you mean.” Accept `Moechten Sie …?`, punctuation variation and appropriate full questions; short noun offers may communicate but do not prove the target structure. Do not interpret formal `Sie` as “she,” nor certify capital letters from audio. Review tags: `formal-you`, `finite-verb-first`, `action-final-question`, `accept-decline`. Candidate 24-hour new combination: formally offer juice without an action. Candidate seven-day combination: formally ask about learning Spanish. Include a separate cold retrieval of a previous question at each return; check the exposure ledger first.

## Ten-unit opening map

Sequence is a learning path independent of legacy numbers. The first three retain their current activity identities; L4–L10 IDs below are proposed stable IDs. Every unit returns to earlier material before adding its own contrast. “H1 → H2 → H3” always requires successive Help selections; H3 reveals the model and removes independent status.

| Unit / linked actual legacy ID / prerequisite | Outcome, vocabulary and English teaching/model | Prompt, likely answer, support, variants and review |
|---|---|---|
| 1 `de-starter-01` / `de-lesson01` / none | Self-request; nine introduced words, progressively, and complete script above. | Single-drink substitution then two-drink combination; preserve different drink sets for delayed checks. |
| 2 `de-starter-02` / `de-lesson06` / L1 | Action final; five new items and complete script above. | Drink → learning transfer; no extra German “to”; delayed unused object/action combinations. |
| 3 `de-starter-03` / `de-lesson09` / L1–2 | Formal question; five new forms and complete script above. | Verb-first questions; polite reply meaning is separately tagged phrase recall. |
| 4 `de-foundations-04` / `de-lesson05` / L1, L3 | Open/close a short exchange. Teach `Hallo` = hello, `Guten Tag` = good day, `Auf Wiedersehen` = goodbye as whole phrases. “Use the greeting when arriving, farewell when leaving.” Model `Guten Tag.` | “Greet the receptionist, then make your own taught drink request.” Likely `Guten Tag. Ich möchte Tee.` Accept `Hallo` where appropriate. Misconception: farewell on arrival. Hints arrival/leaving → choose greeting → reveal greeting only. New arrangement demonstrates exchange use; the greeting itself is recalled. Review next unit, 24h/7d. |
| 5 `de-foundations-05` / `de-lesson04`, `de-lesson08` / L3–4 | Introduce self and request a name. New `heiße` = am called, `heißen` = are called with formal you, `wie` = how; `ß` may be typed `ss`. “`Ich heiße Alex` means my name is Alex; `Wie heißen Sie?` asks your name formally.” | Give your own or an invented name, then ask the visitor’s. Likely `Ich heiße Sam. Wie heißen Sie?` Accept any name and `heisse/heissen`. Name replacement alone is not broad transfer. Mistake `Wie heiße Sie`; H1 whose name → H2 formal form → H3 reveal question. Review with L4 greeting and L3 offer. |
| 6 `de-foundations-06` / `de-lesson01`, `de-lesson15` / L2–3 | Contrast doing with wishing. New taught finite forms `lerne` = learn with I; `lernen` = learn with formal you. “`Ich lerne Deutsch` says I learn/am learning German; without `möchte`, the learning verb now carries the statement.” | “Say you are learning English, not just expressing a wish.” Likely `Ich lerne Englisch.` Accept appropriate present meaning; reject `Ich lernen` as target form. H1 action or wish → H2 use I-form → H3 show model with German, then a different language task. Reserve Spanish present statement; review mixed with L2. |
| 7 `de-foundations-07` / `de-lesson08`, `de-lesson09` / L3 | Ask an open drink question. New `was` = what. “`Was möchten Sie trinken?` asks what you would like to drink. The question word precedes the verb.” | Ask what the visitor wants to learn: `Was möchten Sie lernen?` Accept natural specified answers without requiring a yes/no reply. Mistake yes/no order after `was`. H1 kind of answer → H2 what then verb → H3 reveal. Unseen combination is the changed action; review with a freely chosen L2 answer. |
| 8 `de-foundations-08` / `de-lesson18` / L1, L3 | Repair misunderstanding. New `verstehe` = understand with I; `das` = that; `nicht` = not. “`Ich verstehe das nicht` means I don’t understand that. Here `nicht` follows what you do not understand.” | “Say you do not understand English.” Likely `Ich verstehe Englisch nicht.` Accept a natural meaning-equivalent variant after review; do not teach a universal position rule. Mistake using `kein` for the action. H1 affirm or deny → H2 keep not after language → H3 reveal. Reserve another taught language; review paired with a request for help in a later unit. |
| 9 `de-foundations-09` / `de-lesson03` / no numeral prerequisite; L4 context optional | Communicate a code using 0–5. New `null, eins, zwei, drei, vier, fünf` = 0,1,2,3,4,5, explicitly taught with audio. “For this code, name each digit separately.” Model 20: `zwei null`. | Read unseen code 314: `drei eins vier`. Accept digit-by-digit output; not the compound whole number. H1 separate digits → H2 reveal needed numeral → H3 code answer. Independent numeral sequence, not sentence grammar. Reserve different codes at 24h/7d. |
| 10 `de-foundations-10` / `de-lesson22`, `de-lesson03` / L2, L9 | Add a whole-hour time, limited to 1–5. New `um` = at for clock time, `Uhr` = o’clock; teach `ein Uhr`, not `eins Uhr`. “Put the time after `möchte` and keep the action last.” Model `Ich möchte um zwei Uhr Tee trinken.` | “Say you would like to drink coffee at three.” Likely `Ich möchte um drei Uhr Kaffee trinken.` Accept natural alternative time placement only if it preserves the finite verb and final action; manual review if outside the authored grammar. H1 time phrase → H2 after would-like → H3 model. Reserve milk at four and juice at five; review after 24h/7d. |

The following keys refer to the units above; reused ingredients are prerequisites already taught, not additional new vocabulary.

| Unit | Reused ingredients | Reason for this position |
|---|---|---|
| L1 | No German assumed; baseline records any prior request ability. | Establish a useful request before adding person tables or other verb forms. |
| L2 | L1 `Ich möchte`, drink names and request meaning. | Add one final action to a familiar frame, then transfer it from drinking to learning. |
| L3 | L1 drinks/`bitte`; L2 action-final order and language names. | Change the addressee and question opening while preserving the known final-action structure. |
| L4 | L1 requests; L3 formal offers and accepting/declining replies. | Greetings and farewells can now frame an exchange with meaningful middle turns. |
| L5 | L4 greeting; L1 `ich`; L3 formal `Sie` and question experience. | Introduce names after formal address is established; teach the new name forms and `wie` explicitly here. |
| L6 | L2 language names and wish statements; L1 `ich`; L3 formal `Sie`. | Contrast an actual learning statement with an already understood wish before expanding conjugation. |
| L7 | L3 `Möchten Sie …?`; L2 `trinken`/`lernen` and final-action order. | One explicitly taught question word opens the familiar yes/no frame into an information question. |
| L8 | L1 `ich`; L2 language names; previous conversation experience. | Add a practical misunderstanding repair, with its new verb and negation taught together, before broader case/negation rules. |
| L9 | No numeral prerequisite; L4 greeting is optional context only. | Establish a small digit set and code combinations before using numbers in time expressions. |
| L10 | L1 drink names; L2 `Ich möchte … trinken`; L9 numbers 1–5. | Add a time phrase only after both its numbers and surrounding sentence frame are available. |

## Migration disposition for all 39 references

Keep legacy URLs and history. Reference reading never grants assessed mastery; linking a legacy page to a new activity never converts its old completion into new evidence. Corrected references need their own version history. These clusters exhaust the 39 IDs without claiming full review of every page:

| Disposition | Actual legacy IDs |
|---|---|
| Extract small opening units; retain full pages as reference pending correction/review | `de-lesson01`, `de-lesson02`, `de-lesson03`, `de-lesson04`, `de-lesson05`, `de-lesson06`, `de-lesson08`, `de-lesson09`, `de-lesson15`, `de-lesson18`, `de-lesson22` |
| Later future/past sequence after present and action-final control | `de-lesson07`, `de-lesson10`, `de-lesson14` |
| Later noun roles, articles, pronouns and complement patterns, split by communicative need | `de-lesson11`, `de-lesson12`, `de-lesson13`, `de-lesson17`, `de-lesson20`, `de-lesson25` |
| Later verb variation, commands, reflexives and lexical patterns | `de-lesson16`, `de-lesson24`, `de-lesson34`, `de-lesson36`, `de-lesson37` |
| Later clause linking and multi-verb structures | `de-lesson19`, `de-lesson26`, `de-lesson27`, `de-lesson28`, `de-lesson29`, `de-lesson33` |
| Later description and reference; rewrite unnatural article-free examples first | `de-lesson21`, `de-lesson30`, `de-lesson31`, `de-lesson32` |
| Defer advanced clause/tense/information choices; retain as discoverable reference | `de-lesson23`, `de-lesson35`, `de-lesson38`, `de-lesson39` |

## German pilot and review gate

Recruit six to eight screened German beginners; document formal/informal exposure and preview use, then collect uncoached baseline attempts. Screening cannot prove historical exposure absent. Analyze returning `1.0.0` users separately. Offer typing and optional recorded speech; separate modalities and retain noncompletion and help use.

Provisional immediate criterion: two correct first submissions on eligible different combinations, without task help, plus an accurate meaning choice. This is not a proficiency award. Report counts and individual paths. Test the three-to-five-minute first-construction and ten-minute lesson hypotheses including thinking, help and audio; learners may continue or stop freely.

At approximately 24 hours and seven days, check old-target retrieval and a reserved combination before feedback. Record elapsed time, intervening exposure, hints, missed returns and pool exhaustion. Delayed success supports this narrow pattern, not general German ability or causality without comparison. Confidence, enjoyment and willingness to speak are separate self-reports.

Before delivery, a qualified German teacher reviews glosses, models, variants, feedback, register and assessments. A qualified speaker reviews audio and intelligibility guidance, including `ich [ɪç]`, `möchte`, `Sie` and acceptable regional variation; English “ish” is no exact equivalent. Beginner usability review checks taught prerequisites and fresh tasks after help. Record reviewer, date, scope and decisions when review occurs. Current status: **AI-drafted; awaiting qualified review; no human validation claimed.**


---

# Spanish curriculum appendix — design proposal

**Target:** Spanish (`es`). **Teaching language:** English (`en`). **Status:** all new scripts and assessment decisions below are AI-drafted; qualified Spanish teacher and proficient-speaker review and learner testing are pending. No human review is claimed. This is an author/reviewer document, not the learner-facing lesson: answer keys and reserved tasks must be separate from learner delivery.

## What the existing Spanish course actually contains

Source inspected: clean checkout `ff6711c`, `generated/catalog.json`, and `server/courses/spanish/lesson01.md`–`lesson25.md`. All 25 catalog contents match their Markdown sources after outer-whitespace trimming. Stable identifiers are `es-lesson01`–`es-lesson25`; catalog numeric IDs are 40–64 and order indices 1–25. The source totals 39,608 whitespace-delimited words; individual lessons span 1,076–2,381 words. All contain tables and “Quick Practice”; 24 contain a “Practice Answers” heading. Lesson 2 instead asks for private pronunciation practice. These are structural counts, not measures of learning quality.

Read lessons 1–3 in full. For later lessons, systematically inspected the opening teaching sections and full closing exercises/answers of 5, 10, 13 (midpoint), and 25. Inventoried headings across every lesson. Later-language accuracy outside the sampled passages remains unverified.

| Actual stable IDs | Existing content, observed from headings | Proposed disposition |
|---|---|---|
| `es-lesson01`, `es-lesson02`, `es-lesson03` | Pronouns/three regular verb classes/30 verbs; alphabet and sounds; numbers through millions and several time systems | Replace their role as the beginner starting sequence; preserve IDs as annotated references. Correct demonstrable errors before recommending the references. |
| `es-lesson04`, `es-lesson05`, `es-lesson06` | Tener/ser/estar and introductions; greetings; five modal constructions | Reuse reviewed fragments in short communicative lessons; separate essential forms from full paradigms. |
| `es-lesson07`, `es-lesson08`, `es-lesson09`, `es-lesson10`, `es-lesson11` | Two futures; information questions; yes/no requests; preterite; present continuous | Split by meaning. Near future and one question pattern enter early; full future/preterite systems move later. |
| `es-lesson12`, `es-lesson13`, `es-lesson14`, `es-lesson15`, `es-lesson17` | Object pronouns; adjective agreement/comparison; hay/location; commands; articles | Bring noun chunks and location forward. Stage pronoun combinations and commands after independently demonstrated prerequisites. |
| `es-lesson16`, `es-lesson18`, `es-lesson19`, `es-lesson20` | Weather/dates; travel; family/possessives; health | Build optional scenario branches; vocabulary lists become reference banks, not one-session acquisition targets. |
| `es-lesson21`, `es-lesson22`, `es-lesson23`, `es-lesson24`, `es-lesson25` | Gustar; reflexive routines; shopping; emergencies; invitations/plans | Give each scenario a small production progression; release complex medical/emergency material only after separate accuracy and pragmatic review. |

### Evidence-to-decision ledger

Effort below means estimated editorial/QA person-days, excluding scheduling delay, implementation, and paid recording. P0 = fix before exposing as recommended teaching; P1 = starter pilot; P2 = later expansion.

| Observation with exact evidence | Problem and proposed change | Rationale, limits, effort/dependencies, success, priority |
|---|---|---|
| `es-lesson02`, “Stress and Accents”: `ca-**sa**`, `ha-**blan**` illustrate a next-to-last stress rule; `**tá**-xi` illustrates an accent override. Practice item 2 says “accent mark on 'o'” for `español`; item 10 says “second 'i'” for `familia`. | **Confirmed defects.** Correct stress to **ca**-sa, **ha**-blan, **ta**-xi; write **taxi**, without an accent. Español has final stress and no written accent; familia stresses the first i. Replace contradictory hints and review all sound annotations. | A learner cannot reliably infer a rule from conflicting examples. RAE's [accentuation rules](https://www.rae.es/dpd/tilde) and [taxi entry](https://www.rae.es/dpd/taxi) support the corrections. 0.5–1 day plus speaker/audio QA. Success: all examples agree with reviewed audio and spelling. P0. |
| `es-lesson01` says “All verbs use `-o` for ‘yo’ forms”; its later irregular note names ser and ir. `es-lesson02` describes v as “almost like 'v'” and indistinguishable from b “in many regions.” | **Overbroad wording.** Limit -o claim to the regular present patterns just taught. Teach b/v as the same Spanish phoneme, with position-dependent realizations, without instructing an English labiodental v. | Prevent false generalization. RAE explicitly describes b/v equivalence in its [v entry](https://www.rae.es/dpd/v). 0.5 day; reviewer checks dialect-aware audio notes. Success: no contradictory universal claims remain. P0. |
| `es-lesson01` has 1,991 words, 12 pronoun rows, three six-row paradigms and “The First 30!” verbs. Practice says “Use the vocabulary list and pronunciation hints.” `es-lesson03` reaches millions and clock expressions before `es-lesson05` greetings. | **Observed scope/sequence; overload is a hypothesis.** Open with two personally useful meanings and four complements; stage sounds inside those meanings; teach small quantities only when used. | Bounded ingredients make a first attempt interpretable. This is not evidence that every learner is overwhelmed, or that short lessons guarantee retention. 2–3 days for L1–3, plus reviewer and pilot. Success: learners attempt before ten active minutes and most can explain the two meanings without prompts. P1. |
| `es-lesson05` practice has context (“Greet your professor in the morning”) and multiple answers. `es-lesson10` has conjugation drills and translations; item 3a changes the model's María to “doctor.” | **Useful assets plus limited assessment validity.** Keep contexts and natural alternatives. Label copying, inflection drills, and vocabulary-supported translations as guided practice. Add reserved meaning-to-message tasks with previously taught ingredients. | Existing exercises may be useful retrieval, but are not automatically novel independent production. Current shared `LearningLoop.tsx` also asks learners to choose a pattern and self-compare, so do not describe the whole app as having no practice. 1–2 days for assessment pools; requires exposure logging and reviewed variants. Success: no exposed/cued answer earns an independent label. P1. |
| `es-lesson13` combines agreement, placement and comparison; final translation asks “That was the worst movie of the year.” `es-lesson25` presents ten invitation starters and ends with a dialogue containing `¿Quieres que lleve algo?` and `sería genial`. | **Observed complexity; prerequisite gaps need fuller audit.** Separate agreement from comparison, and everyday invitations from subjunctive/conditional constructions. Retain the long dialogues as later supported reading, with their ingredients explicitly mapped. | Neither a chapter number nor a final congratulation proves productive command. 3–5 days for later clusters; dependency on full prerequisite/content review. Success: every scored construction has a taught origin and a distinct unseen task. P2. |

The selected starter does not present itself as all varieties of Spanish. Use a reviewed broadly intelligible seseo audio model, identify the speaker's variety, accept other intelligible regional pronunciations, and introduce tú/usted in concrete relationships. The existing “respectful in all contexts” claim should become a contextual explanation; RAE describes usted's usual distance/formality and regional plural usage in [usted](https://www.rae.es/dpd/usted).

## New lesson 1 — Say what you need or are looking for

**New stable ID:** `es-starter-01`, content version `1.0.0-draft`; sequence position 1 is separate metadata. Associated legacy references: `es-lesson01`, `es-lesson06`, `es-lesson18`. **Outcome:** produce one unshown need/search message from taught ingredients; then attempt a different meaning. **Prerequisites:** understand the English instructions; no Spanish assumed. **Scope:** first-person statements only. Typed production is the assessed pilot mode; saying it privately is optional.

### Complete first-session script, approximately 8–10 active minutes

Minute labels below refer to active learning, including listening and silent thinking. They do not reset the separate arrival clock; see the pilot clock contract.

**0:00–0:40, lesson orientation.** Neutral fox, then static thinking image while writing. Teacher: “In this short lesson, you will tell someone what you need and what you are looking for. You can type, ask for a hint, or see an answer. Needing help is part of practice. We will keep helped practice separate from a new sentence you make on your own.” Optional prior-knowledge box: “Do you already know a way to say you need help? Try it, or choose ‘I don't know yet’.” Do not show an answer; this prior task uses the later model meaning, never an assessment reserve. Record prior attempt/external knowledge.

**0:40–2:00, meaning and ingredients.** Teacher: “`Necesito` means ‘I need’. `Busco` means ‘I am looking for’. Each is already a complete ‘I’ verb form. English needs several words for ‘am looking for’; Spanish can use `busco`. Do not add a separate word for ‘for’ in this pattern.” Show isolated tiles with meanings and reviewed audio: `un taxi` = a taxi; `un mapa` = a map; `ayuda` = help; `información` = information. “Keep `un` with `taxi` and `mapa`. In these messages, `ayuda` and `información` do not need `un`. Learn those as usable pieces; we are not learning every article rule today.”

**2:00–3:15, two models.** Teacher: “Put what you need after `necesito`: `Necesito ayuda.` That means ‘I need help’. Put what you are looking for after `busco`: `Busco un taxi.` That means ‘I am looking for a taxi’. `Yo` means ‘I’. You may put `yo` before either statement, but usually the verb already makes the speaker clear.” Display only these two complete combinations, optionally with yo. Teacher: “The strong syllables are ne-ce-**si**-to, **bus**-co, **ma**-pa and in-for-ma-**ción**. The mark in información shows its stress. Keep Spanish o steady rather than sliding into an English ‘oh’.” Pronunciation cues disappear with the model.

**3:15–4:00, meaning check.** Show only the already modeled `Busco un taxi.` Ask: “Is this person saying they are looking for a taxi, or that they work as a taxi driver?” Correct choice: “Yes: looking for a taxi.” Wrong choice: “Here, `busco` means looking for. Nothing here says what the person's job is.” Recognition, never production credit.

**4:00–5:00, guided construction.** Teacher: “Imagine you are looking for a map. Use `Busco` and the map piece to make that message.” Expected `Busco un mapa.` Accept optional yo. Likely `Busco mapa`: “You chose the right meaning. The map piece is `un mapa`; keep both words.” Likely `Necesito un mapa`: “That says you need a map. This practice asks you to say you are looking for one; choose the other meaning.” Hints: “Which piece means looking for?” → “Start with `Busco`; the map piece follows.” → reveal `Busco un mapa.` After a correction/reveal, next task is different: “You need information. Say that message.” This second task is **guided**, with its model `Necesito información.` available after attempting or on request. On the correct initial route, also run this second guided task so the exposure ledger is identical across routes.

**5:00–7:00, independent attempt A.** First check exposure: if a learner previously generated Necesito un mapa during guided practice, retire A and go directly to eligible B. If both immediate combinations were exposed, finish with supported practice; preserve delayed reserves. Close all models, tiles and sound cues; empty composer, no answer-shaped placeholder. Teacher: “At a visitor desk, tell the person that you need a map.” This English meaning is the task; no Spanish lexical, grammar or answer cue is shown. Author-only target: `Necesito un mapa.` Optional yo accepted.

| Branch | Exact response and next action |
|---|---|
| Correct before help | “Your sentence tells the person what you need. Now try a different message.” Log independent first-attempt success, provided exposure checks pass. Advance to B. |
| Partial: `Necesito mapa` | “Your need is clear. One part of the map expression is missing. Would you like to try once more or see a cue?” The attempt is partial; subsequent response is revised, not independent. Requested cue: “The piece you learned was `un mapa`.” Reveal only on request or after chosen comparison: `Necesito un mapa.` Advance to B. |
| Misconception: `Busco un mapa` | “That says you are looking for a map. This person needs a map. Which meaning did you intend?” Any content-specific correction marks this task helped. Hints: “Recall the word for needing.” → “`Necesito` means ‘I need’.” → `Necesito un mapa.` Advance to B after retry/reveal. |
| Stuck or blank | “Take your time. You can try, ask for a cue, or see an answer.” No automatic time penalty. Hints: “Choose the need meaning, then the item.” → “`Necesito` comes before `un mapa`.” → reveal the full target. Log each assistance level; advance to B. |
| Unknown natural alternative | “I can see another way of expressing this. This starter checks a small set of patterns; keep this for review.” Preserve text; no false rejection or independent score until qualified adjudication. Advance to B. |

**7:00–8:30, next DIFFERENT task B on every route.** Teacher: “You are looking for help. Tell a person at the desk what you are looking for.” Author-only target: `Busco ayuda.` This exact combination has never been shown; the help noun and search meaning have been taught separately. Correct: “You expressed the new message.” Partial `Busco una ayuda`: “For help in this message, the piece is `ayuda`, without `una`.” Misconception `Necesito ayuda`: “That says you need help. The message here is that you are looking for help.” Stuck: “Recall the search meaning” → “`Busco` followed by the help piece” → reveal target. Every correction/reveal is followed by **a different, deliberately supported consolidation task**, “Say that you need information,” whose answer was already encountered. Never recycle B and relabel the rewrite independent. If B fails, finish honestly with supported practice recorded; do not consume the delayed reserves to force success.

**8:30–10:00, reflection and exit.** Teacher: “In your own words, what changes between needing something and looking for it?” Accept an English explanation; this is understanding evidence. “Would you like a worked example, a small cue, or a try before help next time?” Record this as preference, not mastery. If independent criteria met: “You made [actual count] new message(s) without an in-app cue.” Otherwise: “You practiced both meanings with support. Your next visit starts with another try.” Celebration fox only after result, never moving during composition. Neutral closure: “You can return to this lesson and practice again.”

### Exposure contract, variants and review

The complete permitted pre-assessment full-sentence set is `Necesito ayuda`, `Busco un taxi`, `Busco un mapa`, `Necesito información`, plus optional-yo versions. Isolated vocabulary tiles, audio, public previews, hints, reference openings, tutoring and self-entered prior answers are also logged. A and B are author-only until their respective prompt/attempt. **24-hour reserve:** looking for information → `Busco información.` **7-day reserve:** needing a taxi → `Necesito un taxi.` These combinations must not appear in onboarding examples, previews, tutor suggestions or intervening reviews. Reviewing the two models is permitted; it affects delay interpretation and is logged. Exposure anywhere retires that reserve from independent status; do not quietly replace it with a repeated sentence.

Known-language transfer note: “English information can help you remember información. Similar-looking words are memory aids, not a rule for translating every English ending. If another language you know normally requires an I-word, remember that Spanish can leave yo unspoken here.” Never assume English is the learner’s first language.

Normalize Unicode NFC, case, outer whitespace and sentence-final punctuation for meaning scoring. Missing información accent gets “meaning achieved; spelling to review”; retain the original text and canonical accent. Optional yo is correct. Do not silently treat arbitrary Spanish substitutions as equivalent: e.g. “I want” is not the same target intention as “I need.” A naturally synonymous answer can be teacher-adjudicated separately. Formal/informal address is absent here, so do not invent a register error.

## New lesson 2 — Correct a need and ask a companion

**ID:** `es-starter-02`; references `es-lesson08`, `es-lesson09`, `es-lesson06`. **Outcome:** correct a mistaken need and ask one familiar companion a needs/search question. **Prerequisites:** L1 ingredients and meaning distinction; learners who needed support reopen only model combinations, then try a new task. No full conjugation chart.

**Teach, verbatim:** “`No` before the verb makes these statements negative. `No necesito un taxi.` means ‘I don't need a taxi’. Keep the Spanish verb; do not add an English-style ‘do’. To ask one companion you address as tú, use `necesitas` for ‘you need’ and `buscas` for ‘you are looking for’. `¿Buscas un mapa?` asks ‘Are you looking for a map?’ The opening and closing marks show the question in writing. Say it as a question; do not move English ‘do’ into it. You may include `tú`, but the ending already identifies this familiar ‘you’. `Sí` means ‘yes’, with an accent; `no` also means ‘no’ as a separate answer.” These are this course's tú scenarios, not a claim that every Spanish-speaking place uses the same familiar address.

**Models visible:** `No necesito un taxi.`; `¿Buscas un mapa?` Teacher: “Notice **bus**-cas and ne-ce-**si**-tas. Asking a question does not move the stress inside these words. Question melody belongs to the whole phrase and varies by speaker.” Show a reviewed statement/question audio pair using those already exposed words. Explain optional `tú` using the modeled question only. No inversion drill.

**Guided prompt:** “Ask your companion whether they need information. Start with `¿Necesitas... ?`.” Expected `¿Necesitas información?` Teacher after success: “You asked about the companion, not yourself.” If `¿Necesito información?`: “The -o form asks about your own need. For this companion use `necesitas`.” Hints: “Who needs it?” → “Use the companion form `necesitas`.” → complete answer. Next different guided message: “Say that you are not looking for a map.” Expected `No busco un mapa.` Teach/reveal after attempt only.

**Independent A, all aids closed:** “A companion offers help, but you do not need any. Tell them that; then ask whether they are looking for a taxi.” Author key: `No necesito ayuda. ¿Buscas un taxi?` Score the two novel clauses separately; selecting a wrong polarity is meaning failure, missing question punctuation is writing feedback. Accepted: optional yo/tú, two separate messages, `¿Tú buscas un taxi?`, or `¿Buscas tú un taxi?` with register/prosody review where needed. Do not require a particular subject order simply to match a string.

**Correction paths:** `Necesito ayuda` → “Your sentence says you do need help. Place the negative word before the verb.” `¿Busco un taxi?` → “That asks about yourself. This question is for your companion.” `No necesito un ayuda` → “Use the help piece without an article.” Hints for each clause: restate intended relationship/polarity → name the relevant taught form → reveal only that clause. Correct/reveal A always advances to **different independent B**, “You are not looking for information. Say that, then ask your companion whether they need a map.” Key: `No busco información. ¿Necesitas un mapa?` If B needs help, supported consolidation uses the earlier guided information question, never a relabeled B.

**Review:** end by explaining in English why busco/buscas differ. At 24 hours reserve `No necesito información. ¿Buscas ayuda?`; at 7 days reserve `No busco un taxi. ¿Necesitas ayuda?`. These combinations are excluded from every other lesson's examples until used. Review versions of A/B are retrieval only. `Si` for sí is a spelling issue in a clearly affirmative answer; an omitted no is a meaning error. Standalone `No` is a useful response but insufficient evidence for the full-clause construction outcome. All likely-response keys remain author-only before attempt.

## New lesson 3 — Check what the desk has

**ID:** `es-starter-03`; references `es-lesson04`, `es-lesson09`, `es-lesson17`. **Outcome:** ask a desk worker whether an item is available and report your own possession/absence. **Prerequisites:** L1 noun pieces and L2 no/question writing; no assumption that a learner knows tener.

**Ingredients:** `tengo` = I have; `tiene` = you have when addressing one person as usted in this scene; `usted` = that address form; `por favor` = please; `gracias` = thank you. Reuse un mapa, un taxi, ayuda, información. For assessment, use possession-compatible map/information/taxi contexts; do not assess the odd literal possession of “help.”

**Teach, verbatim:** “At this visitor desk, we will address the worker as usted. `¿Tiene un mapa?` means ‘Do you have a map?’ You can include `usted`: `¿Tiene usted un mapa?` Use `tiene` in this question; it is different from your own `tengo`, ‘I have’. In a conversation that has established the addressee, usted can stay unspoken. Politeness depends on the situation and delivery, not one magic word. Begin with the taught greeting `Hola`—‘hello’—and use `por favor`—‘please’—when making a request. `Gracias` means ‘thank you’.” Hola is explicitly introduced here, never an assessed L1 prerequisite.

**Models:** `Hola. ¿Tiene un mapa, por favor?` and `Tengo información.` Teacher: “To say you do not have something, put the no you already know before tengo. The remaining item piece stays in place.” Model `No tengo un taxi.` Specify taxi context: you are a transport agent with no taxi available, not merely a passenger without a car. This framing is author-reviewed for naturalness before release.

**Meaning check:** show the map model; ask whether the worker's possession or the learner's possession is queried. For wrong answers: “Tiene here asks the person at the desk. Tengo describes you.” **Guided production:** “You have a map; tell your companion. Use tengo.” Key `Tengo un mapa.` Misconception `Tiene un mapa`: “That does not state your own possession. The form for you speaking about yourself is tengo.” Hints: speaker identity → tengo + item → full answer. Next different guided task: ask the desk about information. Key `¿Tiene información?` The please phrase may be added; record all versions exposed.

**Independent A:** “You are the visitor. Ask the transport-desk worker whether a taxi is available to them.” Key `¿Tiene un taxi?` optionally Hola, usted, por favor. A natural `¿Hay un taxi?` may communicate the intention, but hay is untaught here: teacher-adjudicated meaningful alternative, not proof of the tiene outcome. **Independent B after A, including correction/reveal:** “Now you are the desk worker. You have no information. Tell the visitor that.” Key `No tengo información.` These combinations were not modeled.

**Feedback:** `¿Tengo un taxi?` → “That asks about your own possession. You are asking the worker.” `No tiene información` → “This describes someone else or addresses the visitor. You are reporting your own supply.” `Tengo no información` → “Keep no before tengo.” Hints escalate from role/polarity → relevant form/position → answer. B corrected/revealed is followed by the different supported task of asking about the map. Unknown valid forms are preserved for review. End: “Which form talks about your own supply, and which asks the desk worker?” Accept English explanation; schedule retrieval.

**Held-out review:** 24-hour task `No tengo un mapa.`; 7-day task `Tengo un taxi.` in an explicit transport-agent inventory scene. Ensure later lessons/AI chat do not expose them first. This limited item pool is intentional; expand only with newly taught items and reviewed pragmatic contexts. Repeating the model without a cue is retrieval, not independent transfer.

## Ten-lesson path and remaining-course strategy

Each row is a new stable ID, separate from its mutable sequence position and historical references. Completing a legacy lesson does not automatically complete the new outcome.

| Order / new ID | Useful outcome and newly taught ingredients | Legacy associations; prerequisite/review |
|---|---|---|
| 1 `es-starter-01` | Need/search messages; necesito/busco, four complements | 01, 06, 18; none |
| 2 `es-starter-02` | Correct a need, ask familiar companion; no, buscas/necesitas, sí | 06, 08, 09; L1 |
| 3 `es-starter-03` | Ask desk availability; tengo/tiene, usted, courtesy | 04, 09, 17; L1–2 |
| 4 `es-starter-04` | Find a place; ¿Dónde está…?, está aquí/allí; la estación/la farmacia | 14, 18; L2 questions reviewed; teach definite noun pieces before task |
| 5 `es-starter-05` | Introduce self and location; me llamo, vivo en, Ana/Lina, Madrid/Bogotá | 04, 05, 01; L3 greeting retrieval |
| 6 `es-starter-06` | Request one/two desk items; una tarjeta, dos tarjetas/dos mapas | 03, 17, 18; L3 requests; no hundred-number detour |
| 7 `es-starter-07` | State a preference; me gusta/no me gusta + el café/el té | 21; L2 negation; explicitly explain gustar mapping |
| 8 `es-starter-08` | Invite a companion; ¿Quieres…?, ir al cine, tomar un café; accept/decline chunks | 06, 25; L2 familiar address; all new infinitive chunks taught |
| 9 `es-starter-09` | Arrange a plan/time; voy a + reviewed infinitives; tres, a las dos/tres | 07, 03, 25; L6 small numbers, L8 |
| 10 `es-starter-10` | Multi-turn visitor-desk encounter with a changed requirement | 04, 08, 09, 14, 18; only ingredients from L1–9; unseen role/item/polarity combinations |

### Prerequisites, reuse, transfer and sequencing — keyed to the same ten IDs

Every task below is a reserved **independent candidate**, shown as an English situation without Spanish vocabulary, grammar cues or an answer-shaped field. Keys are author-only. L1–3 use the scripted A/B tasks above. For L4–10, teach the listed new chunks individually with meanings and reviewed pronunciation, and model different full combinations; prohibit the reserved combinations in previews, examples, hints on other tasks and tutor suggestions. The same exposure/assistance gate applies throughout. These L4–10 rows are design specifications, not claims that those lessons have been fully scripted or reviewed.

| New stable ID | Required prerequisite | Reused ingredients | Independent task and author-only key | Why this position |
|---|---|---|---|---|
| `es-starter-01` | None beyond understanding English instructions | No prior Spanish required | A: tell the desk you need a map → `Necesito un mapa.` B: say you are looking for help → `Busco ayuda.` | Establish two useful intentions and successful composition before a conjugation inventory. |
| `es-starter-02` | L1 need/search meanings and noun chunks | necesito, busco, ayuda, información, un mapa, un taxi; optional yo | Decline unneeded help, then ask a familiar companion about their taxi search → `No necesito ayuda. ¿Buscas un taxi?` | Add polarity and addressee changes to familiar meanings, so the learner can compare roles without new object vocabulary. |
| `es-starter-03` | L1 noun chunks; L2 negation and question notation | un mapa, un taxi, información; no; previously practiced question intent | A: ask the desk worker about a taxi → `¿Tiene un taxi?` B: as worker, report no information → `No tengo información.` | Contrast one's own supply with polite address after person/polarity have been made explicit. |
| `es-starter-04` | L2 question intent; L3 desk/courtesy context | Hola, por favor, question punctuation; attaching a taught noun chunk to a message | Ask where the pharmacy is; then report the station's location as over there → `¿Dónde está la farmacia? La estación está allí.` | Location is the next practical information gap after identifying a need and checking availability; introduce only two places and two locations. |
| `es-starter-05` | L1 first-person perspective; L3 greeting | Hola; subject omission/optional yo; familiar statement construction | Use the role card “Lina; lives in Bogotá”: greet and introduce yourself → `Hola. Me llamo Lina. Vivo en Bogotá.` The greeting is retrieval; the name and city clauses are reserved new combinations. | Add personal identity once a learner can begin a short service interaction; names/places give meaningful substitutions without adjective agreement. |
| `es-starter-06` | L3 availability question; L1 map meaning and un chunk | ¿Tiene…?, un mapa, por favor; necesito/busco for supported review | Ask the desk worker whether they have two maps → `¿Tiene dos mapas?` | Numbers become useful in a transaction now; teach count/article/plural chunks before broader numerical systems. |
| `es-starter-07` | L2 negative meaning; ability to retrieve noun chunks | no; learned attention to article+noun pieces and first-person intention | Explain that coffee is not something you like, then say tea is → `No me gusta el café. Me gusta el té.` | Move into social choice using a deliberately taught gustar pattern; do not make the learner infer it from English subject order. |
| `es-starter-08` | L2 familiar tú address and yes/no; L7 café meaning; L3 courtesy | sí, no, gracias, café; question intent and familiar addressee | Invite one familiar companion to have a coffee → `¿Quieres tomar un café?` | Turn a preference topic into a joint activity; one invitation frame introduces infinitive chunks needed for the next plan lesson. |
| `es-starter-09` | L8 infinitive chunks; L6 number dos | tomar un café, ir al cine, first-person viewpoint; dos | State your plan to have a coffee at three → `Voy a tomar un café a las tres.` | Add time to an already understandable activity; one near-future frame precedes multiple future-tense systems. |
| `es-starter-10` | L1–9 completed or prerequisite outcomes demonstrated; specifically L1 need, L3 availability, L6 count chunks | necesito, ¿Tiene…?, dos tarjetas; Hola/por favor; other L4–9 material remains optional retrieval | At the desk, your requirement changes from one card to two. State the current need and ask whether the worker has them, naming the item → `Necesito dos tarjetas. ¿Tiene dos tarjetas?` | Integrate intention, quantity and addressee in a changed situation after practicing them separately. Score the two unshown clauses; greetings/location repetitions receive retrieval credit only. |

The L5 role-card ingredients are explicitly taught names **Ana/Lina** and cities **Madrid/Bogotá**; a model may pair Ana with Madrid, while Lina/Bogotá remains reserved. L6 teaches **una tarjeta**, **dos tarjetas** and **dos mapas** alongside the existing **un mapa**; a tarjeta is a card in this desk scene, with no untaught type modifier required. L7 teaches the whole chunks **el café**, **el té**, **me gusta** and **no me gusta**; model positive coffee and negative tea, reserving their opposite polarities. L8 explicitly teaches **ir al cine**, **tomar un café**, **¿Quieres…?**, and the responses **Sí, gracias / No, gracias**; model the cinema invitation and reserve the coffee invitation. L9 teaches **tres**, **a las dos**, **a las tres** and **voy a** before assessment. No prompt presumes untaught clock numbers, mañana or a personal-pronoun table. L10 adds no vocabulary or grammar; reserve both two-card combinations across all earlier authoring.

In the associations column, 01 means `es-lesson01`, etc. After L10, build reviewed travel/shopping (18/23), people/routines/preferences (19/22/21), and time/story (03/07/10/11) branches. Expand articles/adjectives/location (17/13/14) when those branches need them; commands/pronouns (15/12) follow real object-reference prerequisites. Weather (16) and health/emergency (20/24) remain optional scenario modules with domain-specific phrase review. Never infer CEFR certification or “comprehensive Spanish” from finishing 25 references.

## Spanish evidence and pilot protocol

**Independent typed production:** an initially unassisted typed clause conveying the assigned new combination of intention, participant and complement using taught ingredients. The full meaning/form pairing must not have been displayed, supplied in audio, attempted earlier, or revealed by any accessible sample/tutor. Learner-created prior exposure retires that pairing too. Role changes, meaningful polarity changes and recombination can qualify; punctuation-only changes, exact recall, copying, recognition and post-correction rewrites cannot. Save semantic success and form success separately; use both for the narrow pattern outcome. Outside-app help cannot be detected: ask and record self-report without claiming certainty.

**Assessed speech** requires a separately consented novel spoken task and qualified rating of message, person/polarity and intelligibility. Transcription is neither a pronunciation score nor sufficient evidence of spontaneous speech. **Self-reported speaking** means only “learner reports saying it”; never roll it into assessed production. Spanish stress, vowel clarity and question intelligibility are feedback dimensions; a regional accent is not a failure by default.

Run a formative pilot with **6–8 adult beginners in Spanish**, recording relevant known languages and prior exposure, including learners with and without another Romance language if available. One qualified Spanish teacher reviews the scripts/variants first; a proficient speaker checks each scenario and proposed recording. At baseline, before teaching, ask the two future model meanings: need help and search for a taxi; give no corrective answer. Capture attempted language, confidence and familiarity, not placement certification. Provide the same L1–3 treatment and log deviations.

**Clock contract.** Start the arrival clock at the learner’s actual first app arrival, before language selection, authentication or setup; never restart it at sign-in or lesson entry. Report arrival-to-first-attempt and arrival-to-first-eligible-independent-success separately. A second, active-learning clock starts with the first lesson instruction. It includes foreground, unpaused reading, listening, silent thinking, planning, typing and feedback; lack of keystrokes does not stop it. Exclude explicit pauses, background time and blocking application/network waits from active time, while retaining them in arrival elapsed time. Log both clocks and report learners who do not reach the event; the proposed eight-to-ten-minute script and pilot target refer to active learning, not total arrival time.

At immediate, 24-hour and 7-day sessions, use only the designated author-only reserves; do not show a recap before the first attempt. If sequential L1–3 teaching or tutoring exposed a reserve, mark it contaminated and report missing independent evidence. Use taught model combinations for ordinary retrieval after the reserve is complete. Ask 24-hour/7-day meaning prompts in English; allow only neutral encouragement before scoring. A hint ends the independent opportunity but remains available for subsequent learning.

Rate each clause 0 = intended message absent/wrong, 1 = message partly conveyed or essential person/polarity unclear, 2 = message clear and taught construction substantially correct. Record orthography separately as 0/1/2 (unreadable/meaning-preserving issues/conventional); never let accent assistance retroactively earn an unassisted spelling score. A second qualified rater independently reviews all small-pilot transfer items, blind to route/timepoint where feasible, with disagreements adjudicated and retained. Report individual trajectories, assistance requests, hesitation, exits and denominator/contamination counts. An initial design target is 6 of 8 (or 5 of 6) reaching at least one immediate independent score-2 clause within ten active minutes and a majority of available uncontaminated delayed tasks scoring 2. These are go/revise criteria, not proven efficacy or a powered comparative study. Failure prompts review of lexical recall, task wording, overload and recognition-versus-production separately.

**Fox behavior and logging:** reuse existing neutral/thinking/coaching/retry/celebration PNG states; no personal name is verified. Keep the thinking image static while composing, coaching only after requested help, retry without shame, celebration after a recorded result. Optional exact L1 fox lines: “Take your time; the next message is yours.” / “Would you like a cue or an example?” / “You changed the meaning successfully.” A minimize-companion preference removes these lines but preserves teaching and feedback. Log lesson/version, prompt/combination ID, mode, first/revised attempt, exposure source/time, requested hint tier, reveal, teacher correction, self-reported outside help, score dimensions, assessor and review time. None of this logging is implemented by this design document.


---

# French curriculum appendix — design proposal

**Target:** French (`fr`). **Teaching language:** English (`en`). **Status:** new content is AI-drafted; teacher/speaker review, recordings and pilot results are pending. This author-only appendix contains answers and reserved tasks that learner delivery must withhold until attempt or reveal.

## Audit grounded in the actual French course

Inspected checkout `ff6711c`: `generated/catalog.json` and all 25 `server/courses/french` files match after trimming. Stable IDs: `fr-lesson01`–`fr-lesson25`; numeric IDs 65–89; order 1–25. Whitespace word count: 32,313 total, 1,071–1,790 per lesson. All have “Quick Practice”; 24 have tables and answer headings. Lesson 2 uses private pronunciation practice.

Read lessons 1–3 fully; sampled opening teaching and complete exercises/answers in 5, 10, 13 (midpoint), and 25; inventoried all headings. Unsampled accuracy and actual learner outcomes remain unverified.

| Actual stable legacy IDs | Observed scope | Proposed disposition |
|---|---|---|
| `fr-lesson01`, `fr-lesson02`, `fr-lesson03` | Pronouns/-er paradigm/30 verbs; alphabet, accents, nasal sounds, liaison and elision; numbers through millions and time | Replace their starting-sequence role with the bounded path below. Preserve stable reference IDs and annotate/correct material. |
| `fr-lesson04`, `fr-lesson05`, `fr-lesson06`, `fr-lesson07`, `fr-lesson08` | Avoir/être/introductions; greetings; modals; three future strategies; three question constructions | Reuse reviewed portions when a scene needs them. Keep everyday register distinctions; stagger the alternate constructions. |
| `fr-lesson09`, `fr-lesson10`, `fr-lesson11` | Passé composé, imparfait, then broad negation | Bring one useful negative meaning forward; teach past-time contrasts after meaningful present use. |
| `fr-lesson12`, `fr-lesson13`, `fr-lesson14`, `fr-lesson15`, `fr-lesson16`, `fr-lesson17`, `fr-lesson18` | Possessive adjectives; imperative; adjective agreement; comparisons; connectors including subjunctive; possessive pronouns; adverbs | Split into outcome-specific expansions; repair imperative error before recommending this reference. |
| `fr-lesson19`, `fr-lesson20`, `fr-lesson21`, `fr-lesson22`, `fr-lesson23`, `fr-lesson24`, `fr-lesson25` | Conditional; reflexives; direct/indirect/y/en pronouns; subjunctive; relative pronouns; pluperfect; reported speech | Retain as reviewed later reference clusters. Their current breadth is not evidence of beginner mastery. |

### Observed → problem → change → evidence limits → delivery decision

Effort: editorial/QA person-days, excluding implementation, recruitment and recording. P0: repair before exposure; P1: pilot; P2: expansion.

| Observed evidence | Problem and change | Rationale, limits, effort/dependencies, success and priority |
|---|---|---|
| `fr-lesson02`, practice 9 labels `je m'appelle` “elision of ‘je’ + ‘appelle’.” | **Confirmed wrong analysis:** the elided item is me, producing m'; je remains. Correct this and distinguish a subject from a reflexive pronoun. | Correct the reusable mechanism. University of Texas describes [pronominal forms and s'appeler](https://www.laits.utexas.edu/tex/gr/vpr1.html). 0.5 day plus full elision-example review. Success: each example identifies the actually elided word. P0. |
| `fr-lesson13`, “Common Mistakes” prescribes `Donnes-moi`; answer 7 says it “is also accepted in modern French.” | **Confirmed grammatical defect:** standard written imperative is Donne-moi. Remove the endorsement; explain the separate -s condition before immediately following y/en when that later content is taught. | The university's [imperative explanation](https://www.laits.utexas.edu/tex/gr/tai1.html) distinguishes the absent -s and its y/en condition. 0.5–1 day plus reviewer checks of command/pronoun examples. Success: no incorrect variant is accepted by content or checker. P0. |
| `fr-lesson25`, pronoun-change example: `Jean dit que il viendra.` The same file elsewhere uses `qu'il`. | **Confirmed orthographic defect/internal inconsistency:** write qu'il. Review all joins around que, pronouns and vowels. | The error undermines the stated outcome. 0.5 day plus reviewer; success: corrected canonical examples and no contradictory coaching. P0. |
| `fr-lesson01` warns against “Putting stress on the last syllable”; `fr-lesson02` later says slight stress falls at the end of words or phrase groups. `fr-lesson03` pairs `cinq`/“sank” with “final 'q' usually silent” and `huit`/“weet” with “silent t.” | **Confirmed contradictory instructional cues; full phonetic audit needed.** Replace English respellings as the authority with reviewed audio tied to exact phrases; explain phrase rhythm and context-sensitive consonants, not isolated blanket rules. | Inconsistent explanations leave the learner unable to decide what to say. Do not infer pronunciation from text practice or claim the audio is already checked. 1–2 days plus a recorded variety and phonetic reviewer. Success: teacher text, spelling and contextual recordings agree. P0. |
| `fr-lesson01` is 1,790 words with “The First 30!” verbs and a complete -er paradigm; its added “Ingredients for this practice” supplies pose and j'écris. `fr-lesson03` includes 70–99, hundreds, millions and clock expressions; greetings arrive in `fr-lesson05`. | **Observed breadth and a useful existing repair.** Retain the principle of supplying ingredients; introduce them before practice in a smaller system. Start with preferences and negation using four noun chunks. | Overload/avoidance is a hypothesis to test, not a measured fact. J'écris supplied at test time is supported practice, not evidence of a learned -er rule. 2–3 days for L1–3; requires review/pilot. Success: early attempts and correct explanation of polarity/article use without help. P1. |
| `fr-lesson05` distinguishes Bonjour from Bonne journée and supplies contextual exercises; `fr-lesson10` asks verb-in-parentheses completions; `fr-lesson25` asks eight reported-speech transformations then congratulates completion of “25 foundational lessons.” | Keep useful pragmatic contrasts. Label constrained transformations as practice; add unshown messages and delayed checks. Split past narration and reported speech into smaller prerequisites. | A prompted inflection or completion is not equivalent to independent communication. Existing shared `LearningLoop.tsx` does provide draft/self-comparison practice; its self-report should not become a competence claim. 2–4 days for later cluster design; requires exposure instrumentation and human adjudication. Success: each scored item identifies the tested meaning and exactly which help was available. P1/P2. |

## New lesson 1 — Say what you like, and what you do not

**ID:** `fr-starter-01`, version `1.0.0-draft`; sequence position 1 stored separately. Legacy associations: `fr-lesson01`, `fr-lesson02`, `fr-lesson11`. **Outcome:** communicate a new positive or negative food/drink preference using taught ingredients. **Prerequisites:** comprehension of English instructions; no French knowledge assumed. The scene concerns preferences.

### Fully scripted first 8–10 active minutes

Minute labels below refer to active learning, including listening and silent thinking. They do not reset the separate arrival clock; see the pilot clock contract.

**0:00–0:40, lesson orientation.** Neutral fox. Teacher: “You will help someone understand what you like and what you don't like. You can type, listen to the examples, and ask for help. We distinguish corrected practice from a new sentence you make before a cue.” Optional baseline: “Do you already know how to say you like coffee? Try it, or choose ‘I don't know yet’.” No answer is provided until the model stage; this meaning is never an independent reserve. Optionally record prior French/other-language knowledge.

**0:40–1:50, ingredients before sentences.** Display with meanings and proposed reviewed phrase audio: `le café` = coffee; `le thé` = tea; `le chocolat` = chocolate; `le lait` = milk. Teacher: “Café here means coffee; thé means tea, despite its resemblance to English the. These are whole pieces for talking about the foods or drinks in general. Here French keeps `le`, even where English just says ‘coffee’. It does not mean you must be talking about one particular cup. All four happen to use `le`; other French nouns can use other articles. We will learn those with their words.” For this article use, see [University of Texas: definite articles](https://www.laits.utexas.edu/tex/gr/det2.html).

**1:50–3:10, two models.** Teacher: “`J'aime` means ‘I like’ in this food-and-drink scene. `J'aime le café.` means ‘I like coffee’. The I-word is `je`; directly before `aime`, it becomes `j'`, written with an apostrophe. Keep the French subject in this statement.” Show only the coffee example. Then: “To say you don't like something, use `Je n'aime pas` before the food piece. `Je n'aime pas le lait.` means ‘I don't like milk’. Here the no/not pattern is n' before aime and pas after it. Je stays whole because n' comes between je and aime. We are learning this pattern, not translating English ‘don't’ one word at a time.” The [negative pattern](https://www.laits.utexas.edu/tex/gr/neg2.html) and [subject/elision explanation](https://www.laits.utexas.edu/tex/gr/ver1.html) support these scoped rules.

**3:10–3:50, sound and script.** Teacher: “Listen to `J'aime` as one short sound group. The final e in aime is written but does not add another spoken syllable in our model. In `thé`, th sounds like t. The acute accent in café and thé belongs to the spelling. Keep the é vowel steady rather than making a large English ‘ay’ glide. Listen to the whole phrase's rhythm; don't give every word a separate English-style punch.” Optional audio replays use only the two model combinations. Teacher: “You may hear `J'aime pas le lait` in everyday speech, with n' omitted. It still means the speaker does not like milk. Our writing model here uses `Je n'aime pas`.” The informal version is an additional **exposure of the same milk-negative combination**, not a new task.

**3:50–4:20, meaning check.** Show `Je n'aime pas le lait.` Ask: “Would this person say milk is something they enjoy?” Correct: “No—the sentence expresses dislike.” Wrong: “The n'…pas pattern changes like to don't like. Listen for pas.” Recognition and audio repetition get no production credit.

**4:20–5:20, guided construction.** Teacher: “Say that you like tea. Use `J'aime` and the tea piece.” Target `J'aime le thé.` If `Je aime le thé`: “You have the right meaning. Before aime, je becomes j'.” If `J'aime thé`: “Keep the whole tea piece: le thé.” Hints: recall positive meaning → show J'aime → reveal target. Next **different guided task** on every route: “Now say that you do not like tea.” Key `Je n'aime pas le thé.` Explain/reveal only after the attempt or request. Both combinations are guided.

**5:20–7:00, independent A.** Hide ingredient tiles, examples, pronunciation spellings, and example-bearing help panels. Teacher: “Someone is choosing a snack for you. Tell them that chocolate is something you do not like.” Empty composer; no French cue. Author-only target `Je n'aime pas le chocolat.`

| Learner branch | Exact teaching response and route |
|---|---|
| Correct before help | “That clearly tells the person your preference. Try a different message now.” Record unassisted first-attempt semantic/form success if exposure gate passes; advance to B. |
| Partial: `Je n'aime pas chocolat` | “The negative meaning is clear. One small part of the food expression is missing. Try again, or ask for a cue.” Requested cue: “Keep `le` with `chocolat` here.” Subsequent success is corrected practice. Advance to B after retry/reveal. |
| Misconception: `J'aime le chocolat` | “That says you like chocolate. Your intended message says you do not. What needs to change?” This feedback is assistance. Hints: “Recall the negative meaning.” → “Use `Je n'aime pas` before the food piece.” → reveal the target. Retire the learner-generated positive-chocolate combination from the later reserve too. Advance to B. |
| Misconception: `Je ne aime pas le chocolat` | “You chose the negative meaning. Before the vowel in aime, ne becomes n'.” Keep the semantic result, mark form assistance; reveal only if requested. Advance to B. |
| Stuck/blank | “You can take your time, ask for a cue, or see an example.” Hints: “Choose the don't-like meaning, then the food.” → “`Je n'aime pas` + the chocolate piece.” → target. Record the highest help actually seen; advance to B. |
| Natural informal `J'aime pas le chocolat` | “Your message expresses dislike. That form is common in everyday speech. For the writing pattern we practiced, include n'.” Record semantic success and informal-register form separately; a rewrite is supported. Advance to B. |
| Another potentially valid response | “This may be another way to say it. I will keep it for review; this starter checks only a few taught patterns.” Preserve and route to human adjudication; do not invent a failure or a pass. Advance to B. |

**7:00–8:20, next DIFFERENT independent B.** Teacher: “At breakfast, tell your host that you like milk.” Author-only target `J'aime le lait.` Correct: “You made the new preference clear.” Partial missing le: “Keep the whole milk expression.” Negative answer: “That says you do not like milk. This message is positive.” Hints: “Recall the like meaning” → “Use `J'aime` before the milk piece” → reveal target. After correction or reveal, use a **different supported consolidation task**, “Tell someone that you like tea,” whose combination has already been guided. Never count a rewritten B as independent. If A/B was previously exposed by a learner's unexpected answer or tutor, skip its independent label and use the other eligible immediate task; preserve delayed reserves. If none remains, finish with no independent evidence recorded.

**8:20–10:00, reflection.** Teacher: “Explain in English what changes when you say you don't like something. What happens to le?” Expected idea: negative pattern surrounds aime; le stays with the general-preference noun. Ask “For your next visit, would you prefer a worked example, a small cue, or a try before help?” This is support preference. Actual achievement wording: “You made [number] new preference message(s) without an in-app cue,” or “You practiced the preference patterns with support.” Celebration image only after an actual result. Never claim the learner “speaks French” after this lesson.

### Exposure, variants and scheduled review

Pre-A full combinations: positive coffee, negative milk (standard/informal), positive tea and negative tea. Hide taught nouns/frames during assessment. A = negative chocolate; B = positive milk. **24-hour reserve:** negative coffee → `Je n'aime pas le café.` **7-day reserve:** positive chocolate → `J'aime le chocolat.` Any earlier accessible example, learner response, suggestion or reveal of a reserved meaning/form retires it. Review models after the delayed first attempt. Opening notes makes an attempt supported.

Normalize Unicode NFC, curly/straight apostrophes, case, spaces and terminal punctuation. `cafe`/`the` can receive meaning credit with accent feedback; preserve original spelling, never silently report conventional orthography. Missing subject or negative pas is a core construction/meaning issue. J'aime can convey like/love with food; do not force an English intensity distinction the prompt did not request. Expressions using untaught adorer/détester may be meaningful but need human review and do not prove the taught aimer construction. The optional known-language note says: “If you know Spanish or Italian, related words may help you remember. Keep the French subject and article in these patterns.” No inference about the user's actual first language.

## New lesson 2 — Order a drink with a preparation choice

**ID:** `fr-starter-02`; references `fr-lesson06`, `fr-lesson05`, `fr-lesson19`. **Outcome:** politely request one drink and a preparation condition. **Prerequisites:** café/thé/lait meanings and reading L1 contractions; no knowledge of the conditional mood required. New ingredients: `je voudrais` = I would like; `un café` = a coffee serving; `un thé` = a tea serving; `sans sucre` = without sugar; `avec du lait` = with milk; `s'il vous plaît` = please when addressing someone as vous. Also explicitly teach `bonjour` = hello/daytime greeting, and `merci` = thank you. Treat the preparation pieces and polite expression as chunks; explain their local function before using them.

**Teacher script:** “Your general preference can use le café. To request one serving here, use un café. `Je voudrais` is a useful polite request meaning ‘I would like’. We are learning this form as a usable piece today. Put the drink next, a preparation piece if needed, then please. `Sans sucre` requests no sugar. `Avec du lait` requests milk in the drink. If both matter, you can put both preparation pieces after the drink; you do not need to invent another linking word. `S'il vous plaît` is our please form for the staff member. Begin with Bonjour and end with Merci if you wish.” Do not test omitted courtesies as grammatical failure when the core request is clear.

**Visible models:** `Bonjour. Je voudrais un café, s'il vous plaît.`; `Je voudrais un thé avec du lait, s'il vous plaît.` English meanings explicitly supplied. Teacher: “The word un has a nasal vowel in our audio model. It is not the English word ‘oon’. In voudrais, the final s is not pronounced; listen to the complete request. Vous in this fixed please expression addresses the staff politely; we are not choosing tu forms in this scene.” Use reviewed phrase audio labeled by variety; English transcription is not authoritative.

**Meaning check:** “Does the second customer ask for milk in the tea?” Correct yes; wrong response: “Avec du lait is the preparation request for milk.” **Guided prompt:** “Request coffee without sugar. Use Je voudrais.” Key `Je voudrais un café sans sucre, s'il vous plaît.` If `Je voudrais le café`: explain that a specific known coffee can sometimes use le, but the target here requests an unspecified serving, taught as un café. If `Je voudrais un café pas sucre`: “Use the complete preparation piece sans sucre here.” Hints: desired drink/preparation → retrieve sans sucre → full answer. After correction/reveal, next different supported task is the already modeled tea-with-milk order.

**Independent A, no notes:** “At the café, request one tea without sugar politely.” Key `Je voudrais un thé sans sucre, s'il vous plaît.` Accepted minor punctuation, Bonjour/Merci, and placing s'il vous plaît at the start or end of the request. Accept `s'il vous plait` under the [1990 spelling rectifications, rule 4](https://www.academie-francaise.fr/sites/academie-francaise.fr/files/rectifications_1990.pdf), alongside plaît. Informal `stp` does not match the taught vous phrase; ask for a register-appropriate revision without treating the requested drink as unknown.

**Feedback branches:** wrong drink → “The staff would receive a different drink request”; omission of preparation → “Your drink is clear; the no-sugar condition is missing”; wrong request meaning (`J'aime...`) → “That states a preference. This scene needs an order.” Hints: name the missing message component → provide the relevant chunk → reveal only after request. **Next DIFFERENT independent B after all A routes:** “Request one coffee with milk politely.” Key `Je voudrais un café avec du lait, s'il vous plaît.` Same tiered correction logic, with the milk condition instead. B correction/reveal leads to different supported coffee-without-sugar consolidation, not a second B score.

**Review:** 24-hour reserve = plain tea order, `Je voudrais un thé, s'il vous plaît.`; 7-day reserve = coffee with milk and without sugar, `Je voudrais un café avec du lait, sans sucre, s'il vous plaît.` The two-condition composition was explained but this combination never shown. Accept reversing the two preparation chunks. Require both meanings for full task success. Recalling a familiar order is retrieval. Ask the learner in English why le café and un café differed in the two scenes; do not imply le always means “the” or un always maps mechanically to “one.”

## New lesson 3 — Ask what is available and respond as the host

**ID:** `fr-starter-03`; references `fr-lesson04`, `fr-lesson08`, `fr-lesson11`. **Outcome:** ask a staff member about an available ingredient and, as a host, state a supply or its absence. **Prerequisites:** food meanings, L1 negative meaning, L2 milk/sugar preparation. Newly teach `vous avez` = you have (vous address); `on a` = we have in this hosting scene; `on n'a pas de` = we do not have any; `du café`, `du thé`, `du lait`, `du sucre` = unspecified amounts; `oui` = yes; `non` = no. Teach each meaning before partner use.

**Teacher script:** “An order for un café asks for a serving. Now you are checking whether the place has any coffee. Use du café for an unspecified amount. Our four ingredient names all use du in these affirmative supply messages. `Vous avez… ?` asks the staff whether they have it. This everyday question keeps subject then verb; your voice makes it a question, and writing has a question mark. `On a…` means ‘we have’ when you speak for the hosts here. In the no-supply pattern, use `On n'a pas de…`. The amount-word du changes to de after this negative. That change belongs to the supply construction; the le in our earlier general preferences stayed le.” The scoped amount/negative contrast follows [University of Texas: partitive articles](https://www.laits.utexas.edu/tex/gr/det5.html).

**Model exchange 1:** `Vous avez du lait ?` / `Oui, on a du lait.` Give meanings and roles. **Model exchange 2:** `Vous avez du thé ?` / `Non, on n'a pas de thé.` Teacher: “In vous avez, pronounce the linking z between the words. The spelling still has vous and avez. You can hear a linking n in on a; in on n'a pas, the negative is clear from pas, so do not rely on an n sound alone to decide.” The vous liaison is described with avoir in the [university's avoir lesson](https://www.laits.utexas.edu/tex/gr/virr2.html). Recordings and the on contrast require speaker validation. Avoid teaching the false rule “join every final consonant before every vowel.”

**Meaning check:** “In the second answer, can the host provide tea?” Correct no; misconception response: “Pas is present, and this pattern says there is no tea available.” **Guided production:** “Ask the staff about sugar. Use Vous avez.” Key `Vous avez du sucre ?` Then explicitly switch roles: “You are the host and you have sugar. Answer with On a.” Key `Oui, on a du sucre.` `On avons`: “The on form here is a.” `Vous a`: “For vous use avez.” Hints: identify the role → give on a/vous avez → reveal target. After guided corrections, use a different already-modeled milk exchange.

**Independent A:** “You are a customer. Ask the staff whether they have coffee.” Key `Vous avez du café ?` with optional Bonjour. **Independent B on every A route, including correction/reveal:** “You are now a host speaking for your household. You do not have any sugar. Tell your guest.” Key `On n'a pas de sucre.` optional Non. A partial answer missing du receives the exact note “Keep the amount expression together”; B with du receives “For this no-supply pattern, the amount expression starts with de.” Wrong role receives “You are asking the staff” or “You are speaking for the hosts,” then the relevant form only if more help is chosen. Missing pas reverses the supply message and is not a punctuation error. Hints escalate role/meaning → taught frame → answer. After B correction/reveal, next different supported task is the already-guided sugar-availability question.

**Variants:** informal `On a pas de sucre` communicates absence and can be natural speech; record semantic achievement and the writing/register target separately. `Nous n'avons pas de sucre` can be a natural alternative, but it is untaught here and must be adjudicated as such, not presented as a required answer. Inverted `Avez-vous du café ?` also expresses the question; acknowledge a valid alternative without claiming the learner was taught inversion. **24-hour reserve:** host has tea → `On a du thé.` **7-day reserve:** host has no coffee → `On n'a pas de café.` On each return, first try without a recap; record independent evidence only if the exposure ledger is clear. Reflection prompt: “Why did the supply negative use de when the preference negative kept le?” An English explanation of amount versus general preference suffices; technical terminology is optional.

## Ten-lesson map and later-course conversion

New IDs preserve historical identity/completion. Association numbers expand to `fr-lessonNN` and identify material for review.

| Position / stable new ID | Useful outcome and new ingredients | Legacy association; dependency/revisit |
|---|---|---|
| 1 `fr-starter-01` | Share positive/negative preferences; aimer, le noun pieces | 01, 02, 11; none |
| 2 `fr-starter-02` | Polite drink/preparation request; je voudrais, un, sans/avec chunks | 06, 05, 19; L1 food meanings |
| 3 `fr-starter-03` | Check supply and respond as host; vous avez/on a, du/de | 04, 08, 11; L1–2 |
| 4 `fr-starter-04` | Ask for clarification; Vous pouvez répéter… ?, pardon, encore une fois, plus lentement | 05, 06, 13; reception skill and courtesy review |
| 5 `fr-starter-05` | Introduce self; je m'appelle, j'habite à; Aya/Lina, Paris/Lyon | 04, 20, 01; explicitly teach me→m', subject stays je |
| 6 `fr-starter-06` | Request counted items; une tasse, deux tasses/cafés/thés | 03, 04; L2 serving contrast; no 70–99 requirement |
| 7 `fr-starter-07` | Locate an item; où est…, est ici/là-bas, la tasse | 08, 14; L3 question reception; no unintroduced pronouns |
| 8 `fr-starter-08` | Invite a friend; tu veux…?, boire du café/thé, manger du chocolat, Oui/Non merci | 06, 08; teach tu register explicitly; L4 repair |
| 9 `fr-starter-09` | Arrange a plan/time; on va + taught infinitive; trois, à deux/trois heures | 07, 03; L6 numbers, L8; one future form |
| 10 `fr-starter-10` | Café/host encounter with changed quantity/preparation and missing ingredient | 04, 05, 06, 08, 11; only L1–9 forms; truly unshown role/amount/preparation combinations |

### Prerequisites, reuse, transfer and sequencing — keyed to the same ten IDs

Each task is an **independent candidate** only after the exposure gate passes. Show the English situation alone during assessment; keys stay author-only. L1–3 retain their full scripts. For L4–10, teach every new chunk below with its meaning and reviewed sound, then model other combinations. Reserve the stated complete combinations across previews, examples, other-task hints and tutoring. Later-map rows specify authoring requirements; they do not claim completed scripts or human review.

| New stable ID | Required prerequisite | Reused ingredients | Independent task and author-only key | Why this position |
|---|---|---|---|---|
| `fr-starter-01` | None beyond English instruction comprehension | No prior French required | A: tell someone choosing a snack that you dislike chocolate → `Je n'aime pas le chocolat.` B: tell your breakfast host that you like milk → `J'aime le lait.` | Begin with personal meaning and an audible/written polarity contrast using four stable noun pieces. |
| `fr-starter-02` | L1 café/thé/lait meanings and subject/elision awareness | café, thé, lait; written je; careful article+noun chunk handling | A: politely order one tea without sugar → `Je voudrais un thé sans sucre, s'il vous plaît.` B: order one coffee with milk → `Je voudrais un café avec du lait, s'il vous plaît.` | Distinguish a preference from an actionable request, and a category from one serving, in the same familiar scene. |
| `fr-starter-03` | L1 negative meaning; L2 ingredient meanings and staff address | café, thé, lait, sucre, vous context, pas, Bonjour | A: ask the staff whether they have coffee → `Vous avez du café ?` B: as household host, report no sugar → `On n'a pas de sucre.` | Availability makes amount/negation meaningful; introduce du/de only after le/un have concrete referents. |
| `fr-starter-04` | L2 please/courtesy; L3 everyday question intonation and vous role | vous address, s'il vous plaît, question intent; café/host listening context | Politely ask the staff to repeat more slowly → `Vous pouvez répéter plus lentement, s'il vous plaît ?` | Give the learner a way to repair the interaction before adding more topics; combine a taught request frame with a separately taught speed condition. |
| `fr-starter-05` | L1 subject retention and apostrophes; L2 greeting | Bonjour; je, vowel/elision awareness, first-person meaning | Use the role card “Lina; lives in Lyon”: greet and introduce yourself → `Bonjour. Je m'appelle Lina. J'habite à Lyon.` Greeting is retrieval; identity/location clauses are reserved combinations. | Add identity after interaction repair is available; explicitly distinguish me→m' from je→j' in relevant phrases. |
| `fr-starter-06` | L2 serving request and un; L1 food meanings | je voudrais, un café/un thé, s'il vous plaît | At breakfast, politely ask for two cups → `Je voudrais deux tasses, s'il vous plaît.` | Teach number and noun gender where quantities affect a request; postpone 70–99 and clock arithmetic. |
| `fr-starter-07` | L3 question meaning; L6 tasse meaning and noun chunks | le café, tasse, question intonation; Bonjour if desired | Ask where the coffee is; report the cup as over there → `Où est le café ? La tasse est là-bas.` | After counting items, locating them gives a reason to teach definite reference and a small copular/location pattern. |
| `fr-starter-08` | L3 oui/non; L2 merci and vous contrast; L1 chocolate meaning; L4 repair available | café/thé/chocolat meanings, du café/du thé, question intent, Oui/Non/Merci | Invite a familiar friend to eat chocolate → `Tu veux manger du chocolat ?` | Introduce tu in a clearly different relationship; activity infinitives then support planning without mixing staff and friend address. |
| `fr-starter-09` | L8 activity chunks; L6 deux; L3 on as household/group speaker | on, manger du chocolat, boire du café, deux | State the group's plan to eat chocolate at three → `On va manger du chocolat à trois heures.` | Add a future frame and a time to known activities; avoid requiring a complete future conjugation paradigm. |
| `fr-starter-10` | L1–9 completed or equivalent outcomes demonstrated; specifically L2 request, L3 absence, L6 quantities | je voudrais, deux thés, sans sucre, s'il vous plaît; on n'a pas de, lait; optional known greeting/repair | A friend joins you: request two teas without sugar. Then, in the host role, report that there is no milk → `Je voudrais deux thés sans sucre, s'il vous plaît.` / `On n'a pas de lait.` | Integrate changed quantity/preparation and a supply problem once their separate components are known. Score only the unshown combinations, not repeated greetings or old orders. |

L4 explicitly teaches **Vous pouvez répéter… ?** (“Can you repeat…?”), **plus lentement** (“more slowly”), **encore une fois** (“once again”) and **pardon**. Model a repetition request without the speed condition; reserve the slower-repetition combination. L5 teaches names **Aya/Lina** and cities **Paris/Lyon** as ingredients; the Aya/Paris model leaves Lina/Lyon unshown. L6 teaches **une tasse**, **deux tasses**, **deux cafés** and **deux thés**; model two coffees or one cup, reserving the two-cup request. L7 teaches **la tasse**, **est ici**, **est là-bas** and **Où est… ?**; model the cup question and coffee-here statement, reserving the converse noun/location combinations. L8 teaches **tu veux**, **boire du café**, **boire du thé**, **manger du chocolat**, and **Oui, merci / Non, merci**; model the coffee invitation, reserving the chocolate invitation. L9 teaches **on va**, **trois**, **à deux heures** and **à trois heures** before assessment. L10 adds no vocabulary or grammar: prohibit its two-tea/no-sugar request and negative-milk supply message from earlier examples and reviews. No task relies on untaught inversion, pronoun substitution or clock numbers.

After L10, group people/possession (04/12/17/20), descriptions/comparisons (14/15/18), and past narratives (09/10/24). Commands/object reference (13/21) require pronoun/role prerequisites. Conditional/future (19/07) distinguish routine chunks from tense formation. Connections/complexity (16/22/23/25) need staged reading/production and accuracy review. Chapter completion proves no French level; any answer disclosed by references/tutoring affects exposure.

## French independent-production definition and formative pilot

**Typed independent production:** the learner's first response to a new communicative meaning/form pairing, constructed from previously taught ingredients with no target-language lexical, grammatical or answer cue currently available. All accessible examples, sample lessons, audio, note openings, optional tutor output and learner-entered sentences count toward exposure. New polarity, role, amount or preparation may qualify; a new font, punctuation change, retyped correction, or recognition choice cannot. If a target answer appeared in a learner's earlier misconception, retire it even though the app did not teach it. Self-reported outside help is recorded; independence cannot be guaranteed beyond observed exposure.

Separate message, construction and spelling judgments. Missing accents may preserve meaning; losing pas can reverse it. Informal ne omission differs from the writing target. Preserve natural unmodeled answers for adjudication.

**Assessed speech** is a separate consented novel spoken task, rated by a qualified assessor for intended meaning, crucial polarity/article distinctions and intelligibility; linking, vowel quality and phrase rhythm are feedback dimensions. Transcription alone cannot assess pronunciation/spontaneity. **Self-reported speech** only documents the learner reporting that they spoke. Typed success, assessed speech and self-report have separate counts and denominators.

Recruit **6–8 adult French beginners**; record other languages/prior exposure. Before piloting, a qualified teacher checks scripts/variants/tasks and a proficient speaker checks the selected audio variety, liaison, rhythm and pragmatics. Baseline elicits the later model meanings—like coffee, dislike milk—without cues or answers. Separate prior knowledge from transfer. This formative pilot is not powered for efficacy comparisons.

**Clock contract.** Start the arrival clock at the learner’s actual first app arrival, before language selection, authentication or setup; never restart it at sign-in or lesson entry. Report arrival-to-first-attempt and arrival-to-first-eligible-independent-success separately. A second, active-learning clock starts with the first lesson instruction. It includes foreground, unpaused reading, listening, silent thinking, planning, typing and feedback; lack of keystrokes does not stop it. Exclude explicit pauses, background time and blocking application/network waits from active time, while retaining them in arrival elapsed time. Log both clocks and report learners who do not reach the event; the proposed eight-to-ten-minute script and pilot target refer to active learning, not total arrival time.

Log L1–3 order, both clocks, help, pauses and adaptations. Ask learners to explain le/un/du in English without forms shown. Use immediate A/B tasks, then the designated held-out tasks at **24 hours and seven days**, before recap, with English situations only. Retire contaminated reserves; report missing evidence. Help remains available after first attempts. Log intervening study/audio exposure to qualify delay interpretation.

Use a clause rubric: 0 = assigned meaning absent/reversed; 1 = partly conveyed or essential role/preparation unclear; 2 = intended message and taught construction sufficiently clear. Also record form control and orthography independently (0/1/2) so an accent or informal-ne issue does not erase semantic achievement. For speech, a separate intelligibility rating does not penalize a regional variant simply for differing from the model. Two qualified raters independently rate the small set of transfer responses with lesson route/timepoint concealed where possible, retain disagreements, and adjudicate before reporting. Report individual outcomes, contamination and missing returns with exact denominators. Initial revise/go thresholds: 6/8 or 5/6 learners achieve an immediate score-2 new clause within ten active L1 minutes, and a majority of uncontaminated delayed tasks receive 2. These are proposed design thresholds, not results or proficiency cutoffs.

**Companion and record:** reuse the existing fox's neutral, thinking, coaching, retry and celebration PNGs; no personal name is verified. Keep the image static during typing, use coaching after help is requested, retry without shame, and celebration only after a recorded result. Exact optional L1 lines: “You can think before you answer.” / “Would a small cue help?” / “You changed the preference successfully.” Minimize-companion mode removes those optional lines while retaining instructions. Save stable lesson/version, combination ID, exposure events, prompt/mode, first and revised text, hint tiers, reveal, correction, external-help self-report, score dimensions, assessor and review time. Design only; no application changes.


---

# Hindi (hi): audited content and proposed opening curriculum

Design only. AI-drafted; awaiting a qualified Hindi teacher’s review of grammar, pronunciation, register, assessment variants, and learner-facing explanations. No human validation or learning improvement is claimed. The explanation language is provisionally English, because that is the language used in the inspected lessons. This does not establish the learner’s strongest language or an available Hindi/Telugu teaching-language pack.

## Evidence and coverage

Inspected source: /workspace/sites/lingomitra at clean version2 commit ff6711c; generated/catalog.json and server/courses/hindi/lesson01.md–lesson25.md. Every catalog content field matches its corresponding Markdown after trimming edge whitespace. Catalog fields are id, lessonId, languageCode, title, content, orderIndex. The inventory covers every lesson; the complete text of 01–03, 05, 10, 13 (middle), and 25 (final) was read. Other lessons received structural, exercise, and dependency scanning, not line-by-line linguistic certification. Live behavior is outside this appendix’s inspection scope.

| Stable legacy ID | Current order | Structural subject |
|---|---:|---|
| hi-lesson01 | 1 | Pronouns, copula, habitual verbs, SOV, gender |
| hi-lesson02 | 2 | Vowels, consonants, nasality, pronunciation |
| hi-lesson03 | 3 | Numbers through crore; clock time |
| hi-lesson04 | 4 | Being, possession, introductions |
| hi-lesson05 | 5 | Greetings, register, courtesies |
| hi-lesson06 | 6 | Ability, permission, obligation |
| hi-lesson07 | 7 | Future tense |
| hi-lesson08 | 8 | Information questions |
| hi-lesson09 | 9 | Past tense |
| hi-lesson10 | 10 | Coordination, subordination, correlatives |
| hi-lesson11 | 11 | Postpositions and oblique forms |
| hi-lesson12 | 12 | Comparison |
| hi-lesson13 | 13 | Adverbs and adverbial phrases |
| hi-lesson14 | 14 | Commands and instructions |
| hi-lesson15 | 15 | Present/past continuous |
| hi-lesson16 | 16 | Adjectives and agreement |
| hi-lesson17 | 17 | Pronoun case forms |
| hi-lesson18 | 18 | Negation |
| hi-lesson19 | 19 | Relative clauses |
| hi-lesson20 | 20 | Conditionals |
| hi-lesson21 | 21 | Polite requests |
| hi-lesson22 | 22 | Word formation |
| hi-lesson23 | 23 | Compound verbs |
| hi-lesson24 | 24 | Daily expressions |
| hi-lesson25 | 25 | Review and ten compound translation tasks |

There are 25 lessons, 35,393 whitespace-delimited tokens, and 1,119–1,774 per lesson; this is a reproducible size measure, not a reading-time estimate. L1–3 contain 1,459 / 1,119 / 1,426 respectively. Twenty-two contain Markdown tables; 24 have a “Quick Practice” heading and the final lesson has “Comprehensive Practice.” Twenty-four have answer sections; L2 asks for eight pronunciations without assessed recordings. Practice introductions identify 20 translation sets, two situational expression sets (05,24), one number-writing set, one sound set, and one word-building set. Answers are adjacent in the source, which permits comparison but does not establish unsupported retrieval. There are no audio embeds, media file references, external Markdown links, or explicit prerequisite fields in these lesson files. This is not a finding about separate app audio or assessment services.

## Evidence-to-change audit

Effort bands below are planning estimates: S = 0.5–1 editor day; M = 2–4 editor/teacher days; L = 5–8 days plus recording or product dependencies. P0 prevents teaching a known error; P1 establishes the learning loop; P2 extends it. These are content estimates, not engineering commitments.

| Audit ID / status / disposition | Observed → problem | Proposed change; rationale and limits | Effort / dependency / success / priority |
|---|---|---|---|
| HI-A01 / observed structure; impact hypothesis / split and resequence | L1 combines eight pronoun rows, seven copula rows, six action roots, descriptive vocabulary, habitual gender/person patterns, and six translations. Greetings wait until 05. Learners must coordinate many choices before a modest social exchange. | Start with a check-in using three referents, two copulas, and three invariant predicates. Retain the useful SOV and agreement material as later micro-lessons/reference. Reduced load is a hypothesis, not a demonstrated retention gain. | L; teacher plus scripted task authoring; novices complete two unseen exchanges with assistance recorded; P1. |
| HI-A02 / verified internal inconsistency; phonetic review required / correct | L1 describes मैं using the English word “mine”; L2 labels ए and ओ short, and gives incompatible English cues for ऐ/औ across tables and examples. The learner receives conflicting sound targets. | Replace rhyme prescriptions with one reviewed recording, consistent transliteration, nasality and length cues. Explain common contemporary standard targets while accepting documented variation. Have a phonetics-qualified reviewer resolve every legacy sound claim, including the penultimate-stress generalization. | M plus recorded speaker; no conflicting vowel labels or unreviewed rhyme cues; learner distinguishes taught sound contrasts in a separate task; P0. |
| HI-A03 / verified misleading rule / rewrite | L3 presents 21–99 as a productive “Ten + Unit” formula, then labels the actual numbers special forms. This is not a usable construction rule for an unseen number. | Teach a small useful set in a price/time task, recognize related families, and explicitly learn irregular forms. Put the full list in a reference. Historical relatedness is not a beginner production algorithm. | M; number/clock review; no task expects an untaught irregular numeral; P0. |
| HI-A04 / observed dependency gap / move, narrow, link | L5’s answer for meeting someone adds आपसे मिलकर; L10 requires continuous forms before dedicated L15, while negation is a dedicated topic only at L18. L13 supplies new lexical glosses inside its “practice.” | Teach negative check-ins in opening L2; attach explicit prerequisites and taught chunks to every scored prompt. Glossed translation remains supported practice. Give meeting and clause-building expressions their own rehearsed contexts. | L; vocabulary/structure registry; every scored token/form links to prior instruction and a protected task; P1. |
| HI-A05 / observed assessment limitation / retain practice, add evidence | L25 has ten complex translations with answers and broad completion congratulations. Content completion alone does not demonstrate conversation, listening, or delayed recall. | Add immediate novel recombination and protected 24-hour/7-day checks. Retain advanced translation as an optional writing task. Separate typed composition, script reading, and assessed speech. | M plus evidence model; no “can speak” claim from a typed or self-reported attempt; P1. |
| HI-A06 / observed framing; naturalness hypothesis / revise and review | L5 gives useful formal/informal contrasts, but broad claims about greetings, women/older people, gestures, and partings are presented as general rules. | Preserve आप as the novice default, explain relationship and setting, and use specific role cards. Validate actual greeting and parting choices with contemporary speakers; do not infer gesture preferences from gender. | M; teacher and register review; reviewers can identify setting and alternatives for every social model; P1. |
| HI-A07 / observed script gap / integrate | Script appears throughout, but L2 offers a broad sound survey rather than a sequence of decoding and input accomplishments. Text pronunciation descriptions are not audio evidence. | Pair supported Devanagari recognition with communication from L1; fade transliteration on demonstrated reading rather than elapsed lessons. Add explicit IME practice and separate script checks. | L; fonts/input QA and reviewed audio; learners can read/enter taught chunks without losing composition work; P1. |

Rupert Snell’s university-hosted guide distinguishes vowel nasality from nasal consonants, distinguishes dental/retroflex spellings, and discusses the inherent vowel rather than assuming every written consonant receives a pronounced final vowel. Those distinctions support the sound and transliteration review; they do not validate this draft’s teaching sequence. [UT Austin, Transliterating Devanagari](https://hindiurduflagship.org/wp/wp-content/uploads/2014/06/Transliterating-Devanagari.pdf).

## Teaching contract and access

The opening outcome is a short, polite check-in at a group meeting. Hindi is Indo-Aryan; the opening therefore makes copula choice, politeness, later gender agreement, and habitual aspect visible. It is not a Kannada suffix lesson translated into Hindi. Optional learner-controlled connections: someone who knows Hindi already may bypass elementary checks after demonstrating them; a Telugu speaker may recognize a broad verb-final tendency, but Hindi agreement and postpositions must still be taught. Shared word order is not shared grammar. English remains the actual explanation language until another complete, reviewed teaching track exists.

Use native script plus precise transliteration on teaching cards. Below, accessible typed aliases such as main, hoon, hain, theek, taiyaar are accepted for meaning/composition; they do not certify vowel nasality or pronunciation. The pronunciation display may use maĩ, hū̃, haĩ, ṭhīk, taiyār. Do not read main like English “mine,” or the n in every alias as a full consonant. Teach ठीक’s initial retroflex aspirated sound with a reviewed model, and use तैयार/यहाँ as whole chunks initially. Explain schwa deletion through already-known words as decoding grows; do not pronounce an extra final vowel mechanically or impose a universal deletion formula.

L1 starts with optional script access and audio replay; neither a microphone nor a Devanagari keyboard is a gate. A script view always has accessible text. At L2 recognize मैं / हूँ against हम / हैं and notice nasal marks. L3 trace/read vowel signs in पानी and दूध with speech, then practise entering one already-known word using the learner’s chosen IME. Show the composed preview and allow correction before submission; never evaluate mid-composition keystrokes. L4–6 hide transliteration first on previously mastered chunks; a reveal counts as reading support, not an error. L7–10 offer script-first reading with recovery. A transliteration production path stays available, labelled honestly as such. Reading mastery, typing mastery, and communicative ability remain separate.

## Fully scripted opening lesson 1: “Are we ready?”

New stable ID: hi-checkin-001; version 0.1.0; proposed order 1. Legacy provenance: hi-lesson01, 02, 05. Outcome: greet, report one’s own/group’s state, and check another person’s state politely. Prerequisites: none beyond understanding the English task and choosing an input mode. Approximate 8–10 minutes; support branches can extend the session without a countdown penalty.

All target words taught before use: नमस्ते namaste, greeting; मैं main, I; हम ham, we; आप aap, polite you; यहाँ yahaan, here; ठीक theek, okay; तैयार taiyaar, ready; हूँ hoon, am with main; हैं hain, are with ham/aap; क्या kya, yes/no question opener here. No gender-changing predicate is required in this lesson.

**0:00–0:45, welcome.** Fox neutral; exact English: “You will join a short meeting in Hindi. By the end, you will say whether you or your group are ready, and check on another person. You can type Hindi or transliteration. Speaking is optional. नमस्ते — namaste — is a greeting.” Prompt: “Greet the host.” Likely response: नमस्ते / namaste. Accept a greeting without extra punctuation. This is imitation, not an independent result.

**0:45–2:10, first construction.** Show the individual words मैं, यहाँ, हूँ with their meanings. Teacher: “मैं means I. यहाँ means here. For this sentence, put the description before हूँ. Listen or read: मैं यहाँ हूँ। — main yahaan hoon — I am here.” Model remains available during one copy/say attempt. Teacher: “हम means we; आप is a respectful way to say you, even to one person. Both use हैं here. ठीक means okay; तैयार means ready. These three descriptions keep the same form.” Learner can replay individual words, not a bank of every completed combination.

**2:10–3:15, question.** Teacher: “To turn a statement into a yes/no check, start with क्या. Keep the rest in its usual order. क्या आप तैयार हैं? — kya aap taiyaar hain? — Are you ready?” Prompt: “Does this ask whether the host is ready, or state that you are ready?” Likely response: “Asks the host.” If wrong: “क्या opens the question; आप points to the person you are speaking to.” Repeat the meaning decision with the same model; do not count it as transfer.

**3:15–5:20, guided G1.** Hide models; prompt exactly: “You are doing okay. Tell the host that about yourself.” Target: मैं ठीक हूँ। / main theek hoon. The following are the complete first-session branches:

| Response state | Exact feedback and support | Next task |
|---|---|---|
| Correct, including acceptable transliteration | Fox celebration, once after submission: “You said that you are okay. You chose the ending for I.” | G2 below. |
| Partially complete, e.g. मैं ठीक / main theek | Fox coaching: “Your meaning is clear. Add the ending that goes with I in the pattern we are practising.” If needed: “Choose हूँ or हैं for मैं.” | After correction, G2; mark G1 assisted. |
| Misconception, e.g. मैं ठीक हैं / main theek hain | Fox coaching: “हैं belongs with हम and polite आप here. The ending changes when you speak as I.” If needed: “For मैं, use हूँ.” | After repair, G2; do not award a new independent success for copying the correction. |
| Stuck or asks for help | Fox thinking: “Start with who, then the state, then the ending.” Next requested hint: “Start with मैं; the state is ठीक.” Final requested reveal: “मैं ठीक हूँ। — main theek hoon.” Fox retry: “Read it once. Then we will try a different message.” | G2, never an immediate identical re-entry for mastery credit. |

**5:20–6:15, different task G2.** Prompt: “You and your companion have arrived. Tell the host that your group is here.” Expected: हम यहाँ हैं। / ham yahaan hain. Correct: “You changed from I to we and chose हैं.” Partial/mismatch: “You are speaking for more than yourself. Which word means we?” Then, only if needed, “हम pairs with हैं.” Final reveal is confined to हम यहाँ हैं। Follow a reveal with I1 below; assistance remains attached to G2. A fluent alternative placing यहाँ first can be accepted by the teacher if meaning and agreement remain intact; neutral word order is a teaching target, not a claim that Hindi permits only one order.

**6:15–8:40, independent I1/I2.** Teacher: “Now send two new messages. The examples will stay closed. You can choose your input mode. Ask for help whenever you want; we will then call that supported practice.” No lexical labels, frame, highlighted morphemes, translation of target words, or fox hints appear while composing.

- I1: “Your group has finished setting up and can begin. Tell the host.” Expected: हम तैयार हैं। / ham taiyaar hain.
- I2: “The host seems uncomfortable. Politely check whether they are okay.” Expected: क्या आप ठीक हैं? / kya aap theek hain?

Both combine taught elements in sentences absent from every preceding model and hint. Evaluate both submissions before showing answers. If help is requested, leave this assessment path and mark that item assisted; do not relabel its eventual correction independent. Feedback: “Your first message says your group is ready. Your second checks on the host politely.” If only one succeeds, identify that accomplishment and queue the missing relationship for supported practice. Do not say the learner can hold a general Hindi conversation.

**8:40–9:30, supported script and exit.** Teacher: “Find हैं in the sentence you just used for we. The sign belongs to the word you met as hain. Reading this word is a separate skill from making the message.” With support available, learner selects/enters हैं. Exit: “You practised a polite check-in. We will ask for different check-ins later to see what stays with you.”

Optional English help dialogue, available only on request: learner, “Why use ‘are’ for one person?” Fox, “आप is respectful you and takes हैं here even for one person.” Learner, “Do I need to say whether I am male or female?” Fox, “Not for these three descriptions. यहाँ, ठीक, and तैयार stay the same.” Learner, “I cannot type Hindi.” Fox, “Use transliteration for this attempt. We will record that as transliteration composition.” None reveals I1/I2. All help openings record assistance.

## Fully scripted opening lesson 2: “Say what is not true”

Stable ID hi-checkin-repair-002; proposed order 2. Prerequisite: L1’s main/ham/aap and copula meanings, checked through retrieval or a support detour. Outcome: deny being ready or present, and describe/deny tiredness using a chosen character’s agreement. New vocabulary: नहीं nahin, not; थका thakaa, tired with masculine singular agreement; थकी thakii, tired with feminine singular agreement. No plural tiredness form is required.

**Retrieve, 0:00–1:00.** Teacher: “Before a new pattern: tell the host you are here.” Expected मैं यहाँ हूँ। If needed, ask “Who are you speaking for?” then reveal that sentence and mark retrieval supported. This is a reused retrieval item, not a new transfer claim.

**Explain/model, 1:00–3:00.** Teacher: “नहीं means not. In today’s state sentences, put it before हूँ or हैं. मैं तैयार नहीं हूँ। — main taiyaar nahin hoon — I am not ready.” Teacher: “Some Hindi descriptions change their form. A character using masculine agreement can say मैं थका हूँ। — main thakaa hoon. A character using feminine agreement can say मैं थकी हूँ। — main thakii hoon. Both mean I am tired. You may use either character; you do not need to disclose your identity. ठीक and तैयार did not change. Do not turn every Hindi word ending in aa into ii.” Teacher: “Keep tiredness statements about I today. Respectful-you and group forms need more teaching.”

Prompt: “Which part makes a state negative: नहीं or हूँ?” Expected नहीं. Wrong response feedback: “हूँ connects the statement to I. नहीं reverses the state.” Then ask a different recognition question: “Do थका and थकी mean different states, or forms of the same state?” Expected same state, different agreement.

**Guided, 3:00–5:30.** Prompt: “Speak as the character using masculine agreement. Tell someone that you are not tired.” Expected मैं थका नहीं हूँ। Likely partial मैं थका नहीं: “The negative is there. Finish the pattern for I.” Likely misconception मैं थकी नहीं हूँ: “The negative is correct. This role uses the masculine form of tired.” Hint ladder: “Choose the character’s tired form, then negate it”; “Use थका; place नहीं before the ending”; reveal मैं थका नहीं हूँ। Correct feedback: “You kept the speaker’s agreement while denying tiredness.” All paths then receive a different task: “Your group is somewhere else. Tell the host your group is not here.” Expected हम यहाँ नहीं हैं। Hints: “Speak for the group”; “हम uses हैं; place the negative before that ending”; reveal only this sentence. After reveal continue to the independent block, not another copy task.

**Independent, 5:30–8:00.** Close teaching cards; prompts: (I1) “Use the character with feminine agreement. Someone thinks you are tired; deny that.” Expected मैं थकी नहीं हूँ। (I2) “You think the host is not ready. Politely check that understanding.” Expected क्या आप तैयार नहीं हैं? The negative question is a confirmation of a stated impression; it is not framed as pressuring the host. No gender-changing word with आप is needed. Neither complete target was a lesson model or hint. Accept main thaki nahin hoon, main thakee nahi hoon as meaning-level aliases after reviewer approval; nasal spelling remains a separate literacy issue. Accept omission of initial क्या if an assessed rising question is unambiguous; a text fragment without a question signal may need clarification, not automatic failure.

**Review/exit, 8:00–9:00.** Teacher: “A correct negative sentence keeps the person ending. A describing word may also change, as थका and थकी do. Reading those endings is a separate practice.” Show those two written chunks; learner identifies the feminine form with audio/transliteration support. Tomorrow’s fresh production prompt: “You are elsewhere; tell someone you are not here.” Expected मैं यहाँ नहीं हूँ। Reserve this until review. Record prior exposure if it is used in any remedial material.

## Fully scripted opening lesson 3: “What do you usually drink?”

Stable ID hi-drink-habit-003; proposed order 3. Prerequisites: L1 polite आप / हैं; L2 awareness that agreement choices depend on the represented speaker. Outcome: say a usual drink and ask a specific guest about theirs. New vocabulary: पानी paanii, water; चाय chaay, tea; दूध duudh, milk; पीना piinaa, to drink; पीता piitaa, पीती piitii, पीते piite, the habitual forms used below. Use the common input aliases paani/chai/doodh/peeta/peeti/peete. These aliases are not a second phonetic system.

**Retrieve, 0:00–1:00.** Teacher: “Say you are ready.” Expected मैं तैयार हूँ। Then: “Which respectful word addresses a guest?” Expected आप. Support with L1 explanations if needed; do not silently introduce a new pronoun.

**Explain/model, 1:00–3:30.** Teacher: “For an action sentence, Hindi usually puts the thing before the action. These drink forms describe a usual practice, not ‘I am drinking right now.’ पानी is water; चाय is tea; दूध is milk.” Teacher: “For I, use पीता with masculine agreement or पीती with feminine agreement, followed by हूँ.” Models: मैं चाय पीता हूँ। / main chai peeta hoon; मैं पानी पीती हूँ। / main paani peeti hoon. Teacher: “For the respectful guest in today’s roles, a man’s form is पीते हैं and a woman’s is पीती हैं. Listen: क्या आप पानी पीते हैं? — Does this male guest drink water?” Teacher: “The drink does not choose this agreement; the subject does. We are not learning all Hindi tense patterns today.”

Meaning prompt: “Does the last question ask what the guest wants now, or whether he drinks water as a usual practice?” Expected usual practice. If misconception: “This is a habit question. A request for a drink will use another construction later.” No new Hindi request is inserted here.

**Guided, 3:30–5:30.** Prompt: “Politely ask the guest using feminine agreement whether she drinks tea.” Expected क्या आप चाय पीती हैं? Likely पीते error: “Keep respectful आप and हैं. Change only the habitual form for this role.” Likely object-after-verb response: “Your words convey the idea; practise the neutral pattern with the drink before the action.” Hints: “Start a polite yes/no question, then name the drink”; “The guest’s form is पीती हैं”; reveal this target. Then a different task: “Use masculine agreement for yourself. Say that you usually drink milk.” Expected मैं दूध पीता हूँ। Hints: “Speak as I”; “Use the I ending and the masculine habitual form”; reveal only this target. Correct feedback identifies whose form was used, without labelling accent or speed.

**Independent, 5:30–8:00.** I1: “Use feminine agreement for yourself. Tell the host that milk is a drink you usually have.” Expected मैं दूध पीती हूँ। I2: “Politely check whether the guest using masculine agreement drinks tea.” Expected क्या आप चाय पीते हैं? Both recombine previously taught subject, drink, habitual form, and copula without presenting a target-language frame. Do not infer gender from names or voices. Natural contracted conversational variants need teacher adjudication; do not mark a novel correct variant wrong simply because it is absent from a list.

**Review/exit, 8:00–9:30.** Teacher: “Today you described habits. In your sentence, point to the drink, then the action form, then the person ending.” This is supported analysis, not independent speech. Read पानी and दूध with optional audio; introduce their vowel signs and one IME entry. A later unseen prompt asks a guest using feminine agreement whether she drinks milk: क्या आप दूध पीती हैं? Keep that full target out of correction models. Before teaching habitual negatives, explicitly distinguish them from L2’s state negatives; never assume the learner can invent that additional pattern unaided.

## Ten-lesson route and legacy disposition

New IDs identify outcomes; displayed order is separate. Preserve all hi-lesson01–25 IDs, URLs, and historical completions. Legacy completion means that old material was completed; it must not automatically award the new independent checks. The following mappings describe reuse/rewrite candidates, not a migration already performed.

| New order / stable ID | Communicative result and dependency | Legacy source; change |
|---|---|---|
| 1 hi-checkin-001 | Polite check-in; none | 01,02,05; split/rewrite |
| 2 hi-checkin-repair-002 | Negate a state; 1 | 01,16,18; move/narrow |
| 3 hi-drink-habit-003 | State/ask a drink habit; 1–2 | 01,08; narrow aspect/agreement |
| 4 hi-drink-request-004 | Request one drink with मुझे…चाहिए; 1–3 | 06,21,24; teach pronoun chunk and request register |
| 5 hi-find-item-005 | Locate a book with में/पर; 1 | 11,16,17; teach noun gender and only needed case forms |
| 6 hi-introduce-006 | Name and origin; 1,5 | 04,05,17; rehearse name/से before transfer |
| 7 hi-arrange-time-007 | Arrange one of three offered times; 1,6 | 03,07,08; small number set; no untaught irregulars |
| 8 hi-repair-talk-008 | Ask for repetition/slower speech; 1,4 | 14,21,24; respectful chunks before open dialogue |
| 9 hi-yesterday-009 | Report one completed trip; 5,7 | 09,13; limited intransitive past; explicit agreement |
| 10 hi-meetup-check-010 | Introduce, request, locate, clarify; 1–9 | 24,25; new protected situations and separate skill evidence |

The ingredient/transfer plan below completes the route specification. English task wording supplies the intended meaning, never a target-language gloss or sentence frame. The expected Hindi is an instructor-only key. For L4–10, author all demonstrations and recovery paths around different combinations before release; do not use these targets as examples.

| Order | Introduce | Reuse | Protected independent task → likely response | Why here |
|---|---|---|---|---|
| 1 | नमस्ते; मैं/हम/आप; यहाँ/ठीक/तैयार; हूँ/हैं; क्या | None | “Your group can begin; tell the host.” → हम तैयार हैं। | Gives a social accomplishment with invariant predicates before gender-changing forms. |
| 2 | नहीं; थका/थकी for singular-I roles | L1 people, copulas, state/question patterns | “Use feminine agreement; deny being tired.” → मैं थकी नहीं हूँ। | Adds repair to an already meaningful pattern and introduces one bounded agreement contrast. |
| 3 | पानी/चाय/दूध; पीना and selected पीता/पीती/पीते forms | मैं/आप, हूँ/हैं, क्या; role-based agreement | “Politely ask a guest using masculine agreement whether he drinks tea.” → क्या आप चाय पीते हैं? | Introduces neutral SOV and habitual meaning after person/agreement choices are visible. |
| 4 | मुझे, चाहिए; affirmative request and नहीं चाहिए refusal with previously taught नहीं | Three drinks; polite encounter; L1–3 meaning contrasts | “Request milk for yourself.” → मुझे दूध चाहिए। | Distinguishes a request from L3’s habit. Model wanting/not wanting water, practise wanting tea, reserve wanting milk and retain tea refusal for L10. |
| 5 | किताब (f.), घर (m.), मेज़ (f.), है, में, पर; only the forms needed here | End-position copula and locating something | “Tell someone the book is on the table.” → किताब मेज़ पर है। | Adds third-person singular and postpositions in a task; invariant noun forms avoid an untaught oblique paradigm. Model the book at home instead. |
| 6 | मेरा नाम…है as an analysed name phrase; माया/रवि; दिल्ली/मुंबई; से for origin | मैं…हूँ; है; relation after a noun | “Introduce yourself as Maya from Mumbai.” → मेरा नाम माया है। मैं मुंबई से हूँ। | Origin follows the position of relations; नाम controls मेरा here, not the named person’s gender. Keep this two-message combination unshown. |
| 7 | दो/तीन/चार, बजे, prospective कल, मिलेंगे as a bounded we-will-meet form | हम; social meeting context; names/origin for role continuity | “Tell the group you will meet tomorrow at four.” → हम कल चार बजे मिलेंगे। | A small useful time set precedes irregular numeral families. Model two o’clock, rehearse three, reserve four. |
| 8 | फिर से, धीरे, बोलिए; optionally the explicitly taught repair chunk मुझे समझ नहीं आया | Polite addressing; मुझे; asking for an action | “You missed the message. Ask for it again, slowly.” → फिर से धीरे बोलिए। | Repair enables later conversations; introduce the two requests separately and reserve their combination. |
| 9 | गया/गई; retrospective कल, explicitly distinguished by past context | मैं; role agreement; दिल्ली/मुंबई; time context | “Using feminine agreement, say you went to Delhi yesterday.” → मैं कल दिल्ली गई। | Begins past reference with an intransitive trip, avoiding untaught ने/object agreement. Model another city/role combination. |
| 10 | No new vocabulary or grammar; new role information only | L1–9 question, habit, request/refusal, location, and repair tools | “Ask a guest using feminine agreement whether she drinks water; decline the tea offered to you by name; ask for a repetition if needed.” → क्या आप पानी पीती हैं? मुझे चाय नहीं चाहिए। फिर से बोलिए। | Integrates independently chosen functions. Reserve these first two complete messages across the preceding route; record the repair chunk as contextual retrieval. |

Remaining legacy clusters: 06/07/09/15 become staged modal, future, past, and progressive modules with aspect prerequisites; 10/19/20 become clause modules after basic negatives and questions; 11/12/13/16/17 become reference-linked description/case practice; 14/18/21 feed early repair and later register expansion; 22/23 remain later word/compound-verb work. 03’s full numeral lists stay accessible as corrected reference. 25 becomes a cumulative practice bank, not a general proficiency certificate. Every cluster needs a vocabulary/form registry, realistic model, hint ladder, protected transfer, and scheduled retrieval before promotion into the new route.

## Evidence, fox behavior, and formative evaluation

“Independent Hindi composition” means a first submitted message for an unexposed prompt, with teaching cards/translation/frame/answer generation closed and no content hint since the prompt opened. Native-script typing and transliteration typing receive separate mode labels. IME use alone is ordinary text entry; phrase prediction or translation supplying the answer is assistance. Assessed speech additionally requires an actual recording and qualified evaluation of intelligibility, nasality/contrasts relevant to the taught material, and language choice. A learner saying “I spoke it” is self-report, not assessed speaking. A speech transcript alone cannot establish pronunciation accuracy.

For each item record communicative intent, person/copula agreement, appropriate polite form, attempt count, support level, mode, prompt/version, and prior exposure. Reviewers may separately note spelling/sounds. A correct short conversational answer can communicate successfully while supplying insufficient evidence for the targeted person contrast; label those two facts separately. No general speech score from typing.

Use the existing unnamed fox’s neutral, thinking, coaching, retry, and celebration states only as relevant feedback cues. Keep it static while the keyboard is open, during IME composition, and during independent response preparation. Respect reduced motion. Celebration follows a submitted achievement; a reveal receives “Let’s try a different message,” not a mastery badge. English assistance is optional and bounded by the taught-word registry. An unexpected answer requiring a new form goes to teacher review or a later lesson, not improvised compulsory teaching.

Recruit 6–8 absolute/near beginners for this Hindi track; record strongest explanation language, prior Hindi exposure, Devanagari familiarity, other Indian languages, input choice, and accessibility needs. Include script-new learners and Indic-script-familiar learners without assuming they know Hindi. This is formative usability/learning evidence, not a powered efficacy study. Baseline, before teaching and without feedback: “Tell the host you are here” and “Politely check whether the host is ready”; allow “I do not know.” These later become teaching models and are not post-test items.

Immediately after L1, use I1/I2 exactly as scripted. Keep these delayed prompts entirely absent from demonstrations and all adaptive hints: at 24 hours, “Tell the host you personally can begin” → मैं तैयार हूँ। and “Your whole group is doing okay; report that” → हम ठीक हैं। At 7 days, “Ask your group whether you are all ready to begin” → क्या हम तैयार हैं? and “Politely check whether the host is present here” → क्या आप यहाँ हैं? Offer neither glosses nor a frame. In this L1 pilot, postpone later-course exposure until these checks or mark exposure and use another reviewer-approved reserve pool; do not call a reused item held out.

Timing has two clocks. Arrival time starts when the learner first arrives at the product and includes language selection, authentication, and setup through the first successful independent response. Active learning time includes listening, reading, composing, and silent thinking; it excludes setup, selection, authentication, background time, explicit pauses and technical waits. Record both and never remove setup from the arrival measure. The primary 3–5-minute first-independent-success target is an untested hypothesis. This draft currently opens its protected independent block at approximately 6:15 active minutes, so it has a visible timing risk against that hypothesis; a fast guided answer is not relabelled an independent result. Pilot evidence should decide whether to shorten the opening scope, change the route into the lesson, or revise the target transparently.

Secondary design thresholds: at least 6 of 8 (or 5 of 6) participants finish a protected independent message within ten active minutes; most complete both immediate meanings with correct person/copula; at least 5 of 8 (or 4 of 6) produce both delayed meanings at each follow-up. Report individual trajectories, assistance, dropouts, and modes rather than a blended pass rate. Record script-entry friction, accidental answer exposure, and confusion between आप/हम/मैं. If a participant fails, inspect the first unsupported decision; revise that explanation and test a new prompt with a new participant. These thresholds are proposed revision triggers, not achieved results, and do not replace the 3–5-minute hypothesis.

The companion hi_schema.json is a populated shared-schema L1 example, including exact script, variants, branch destinations, protected prompt IDs, review schedule, and explicit AI-draft review status. It is design data only.


---

# Mandarin Chinese curriculum appendix — design draft

Status: original AI-drafted teaching material, version 0.1.0, English teaching language. Qualified Mandarin teacher/native-speaker review, recorded-audio review, and learner validation are pending. This is a design deliverable, not an implemented course or a claim of learner proficiency.

## Source and evidence boundary

Read the complete source lessons zh-lesson01–03 and systematically sampled complete lessons 05, 10, 15 (midpoint), and 30 (final); also read 09 to examine negation dependencies. Inspected the full catalog inventory. The 30 Chinese records in generated/catalog.json have numeric IDs 115–144 and stable lessonIds zh-lesson01–30; their content exactly matches server/courses/chinese/lessonNN.md. Deployment verification in the shared report establishes version 2, ff6711c. This appendix makes no independent deployed-interface claim.

The actual source uses Mandarin pinyin and Simplified forms such as 我们, 学校, 中国, 这, and 说. Label the target “Mandarin Chinese — Simplified characters,” retain languageCode zh for compatibility, and record variety zh-CN/Mandarin and script Hans separately. This does not imply that every Chinese language is Mandarin. English is the observed explanation language; other teaching-language packs have not been established.

Audit IDs below are durable evidence references. “Defect” means directly observed contradiction, error, or missing teaching dependency. “Hypothesis” means a plausible learner or contextual problem requiring review or research. Effort: S = one focused editorial/reviewer pass; M = one lesson rewrite plus assessment/audio work; L = a cluster rewrite and validation. Effort is a scope estimate, not a delivery promise.

| Evidence ID / source | Exact observed snippet | Problem and disposition | Rationale / limits; effort; success; priority |
|---|---|---|---|
| ZH-A01 / 01 | “No Irregular Verbs: All verbs follow the same pattern” | Defect: morphological nonconjugation is expanded into a universal syntactic claim. Replace with “The verb in this pattern does not change when the person changes.” | Different predicates take different complements and negators. Keep the useful person-invariance insight. S; reviewer finds no unsupported universal; P1. |
| ZH-A02 / 01 | “Translate these sentences into Chinese (characters and pinyin).” | Dependency defect: the lesson supplies characters but teaches no production/input method or character retrieval. Split pinyin construction, character recognition, and character input. | A supplied vocabulary gloss is legitimate support; it is not independent recall or evidence of reading. M; all tasks report support and modality; P0. |
| ZH-A03 / 02 | “For other combinations, the tone typically goes over the first vowel: xiū (修)” | Direct internal contradiction: xiū marks its second written vowel. Replace the rule with checked vowel-priority guidance, including iu/ui marking the second written vowel. | Validate complete orthographic rule against the official pinyin standard before publication. The contradiction itself needs no learner study. S; exhaustive reviewer examples include xiū/liú/guǐ; P0. |
| ZH-A04 / 02 | “Chinese 'b' is less aspirated than English 'b'.”; “Match these Pinyin syllables with their closest English approximations” | Defect in assessment construct: visual approximation matching cannot demonstrate perception or production. The aspiration explanation is misleading across English contexts. Replace with reviewed audio contrasts and an aspiration explanation. | Mandarin b/p contrast is primarily aspiration in this teaching scope; do not call b simply a softer English b. [TUFS aspiration module](https://www.coelang.tufs.ac.jp/mt/zh/pmod/practical/01-04-01.php). M; audio-only discrimination and separately rated speech; P0. |
| ZH-A05 / 03 | “10,000 = 一万 (yì wàn)” | Defect: inconsistent connected-tone convention. The same source uses yí before fourth-tone syllables elsewhere. Retain dictionary yī in a base-reading field and, when provided, yí wàn in a spoken-form field. | Tone sandhi is not a change to the Chinese character. Native audio/pinyin review pending. S; one explicit convention across every example; P0. |
| ZH-A06 / 03 | “Measure Words: Counting Objects” plus “1,984” and “10,500” | Observed breadth: numbers to hundred millions, ordinals, currency and six classifiers precede greetings. Overload is a hypothesis, not a measured fact. Move price/quantity content into small transactions; archive large-number work for later. | Keep number regularities; require a demonstrated use case. L; fewer untaught dependencies and improved unaided delayed tasks in pilot; P1. |
| ZH-A07 / 05 | “These aren't intrusive - they're just friendly conversation starters.” | Pragmatic overgeneralization: meal/destination questions may be literal or relationship-sensitive. Rewrite with specific situations and accept multiple appropriate greetings. | 你好 versus 您好 is not a rigid equivalent of European informal/formal pronoun systems. Teacher review of regional/register claims pending. M; scenario rubrics accept contextually suitable alternatives; P1. |
| ZH-A08 / 09 | “Use 没(有) for possession, existence, or completed past actions” | Wording risks teaching past tense = 没. Scope possession separately from an event that did not happen/has not happened; postpone aspect until taught. | 没有 negates possession; event negation with 没(有) is not a universal past-tense rule. [TUFS possession](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/card/019.html), [event completion](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/card/041.html). M; learner distinguishes “do not drink” from “do not have”; P0. |
| ZH-A09 / 10 | “他没已经吃饭。”; “干干净净 (gāngānjiàjiàng)” | Language defects: malformed negative example and pinyin/character mismatch. Remove from teaching and reauthor with reviewed “hasn't eaten yet” language when that dependency is available. | Do not quietly add 还/yet to a beginner assessment before teaching it. S/M; every example and answer key aligned; P0. |
| ZH-A10 / 10,15 | “我比他更高” struck through and called “redundant” | Defect: valid 更 comparisons are rejected. Teach the minimal 比 frame first but accept appropriate 更 elaboration. | TUFS explicitly models 比 with 更; its availability does not mean every adjective/adverb combination works. [TUFS comparison explanation](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/explanation/058.html). S; reviewer-approved alternatives no longer marked wrong; P0. |
| ZH-A11 / 10 | “He speaks Chinese very well.” → “他说中文说得很好。” | Dependency defect: answer requires a 得 complement and repeated-verb construction before the dedicated 的/得/地 lesson 19. Move task or teach its full prerequisites. | Preserve no-是 adjective explanation but remove the categorical rejection of all bare adjectives. [TUFS adjective predicates](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/card/025.html). M; dependency checker/reviewer finds no unexplained answer forms; P0. |
| ZH-A12 / 15,30 | “我比他常常去图书馆。”; final matching includes “对牛弹琴” and “井底之蛙” | Frequency comparison requires native reauthoring review; final two idioms appear first in the matching question. Replace final recognition worksheet with a scoped transfer task; retain idioms as optional contextual reading. | Matching supplied meanings cannot establish spontaneous idiomatic usage. “All chengyu are four characters” also needs qualification. L; final task assesses taught skills with fresh combinations; P1. |

## Original pathway, identity and script design

New stable IDs name outcomes, never positions: zh.drink-choice, zh.drink-questions, zh.drink-stock, zh.first-meeting, zh.order-cups, zh.temperature, zh.identify-items, zh.locate-stock, zh.time-and-repair, zh.breakfast-exchange. An ordered pathway references these IDs; moving a lesson changes only that list. Keep every legacy ID and historical completion intact. Record explicit replacement relationships; legacy completion does not automatically certify a new assessment.

The first three lessons use no English-only pronunciation spellings. Each taught item displays Simplified text, pinyin, meaning, and a reviewed audio control once audio exists. Pinyin remains available at any time. Recognition trials hide it only for taught items and record reveal use. Character exposure is not character reading. Character production with an IME is distinct from handwriting and from choosing a prepared tile.

Sequence: L1 notices 我/你 and retrieves 茶 versus 水 without pinyin; L2 adds 他, 吗 and the whole word 喜欢; L3 retrieves 有/没有 plus 牛奶 and 果汁. L4–5 add 叫/好/谢/一/两/杯; L6–8 add 热/冷/这/那/是/在/里; L9 adds 今天/明天 and a repair chunk. L10 uses a short menu and message composed only of taught forms. Reading trials precede optional pinyin reveal; meaning must be chosen or supplied without an aligned pinyin line. No all-character or all-pinyin alphabet gate delays communication.

An optional comparison drawer may say: “If you know English, the person–drink–thing order here is familiar. That similarity applies to this pattern.” Never infer a learner's known language. Chinese/Japanese comparisons require an explicitly selected known language and teacher review; a translated English paragraph is not a separately designed teaching pack.

## Fully scripted lesson 1 — zh.drink-choice

Outcome: at a shared breakfast, say which drink you or your companion will have or skip. Prerequisites: none. Duration: about 8–10 minutes, learner paced. Core inventory: 我 wǒ “I”; 你 nǐ “you, one person”; 喝 hē “drink”; 茶 chá “tea”; 咖啡 kāfēi “coffee”; 水 shuǐ “water”; 不 bù “not” in the taught drink pattern. Teach all seven before using them. Characters are visible but character typing is optional.

0:00–0:35, neutral fox, static beside the task. Exact English: “By the end, you can make a drink choice in Mandarin. You can type pinyin or Chinese characters. You can also try speaking. A typed answer tells us about your sentence; it does not tell us how you pronounced it.” English scenario card: “Breakfast choices. State the plan for this breakfast.” This keeps 不喝 an intended nonaction, rather than silently switching between habit and completed past.

0:35–1:40, item cards, one at a time. Exact English: “我, wǒ, means I. 你, nǐ, means you. 喝, hē, means drink. These drinks are 茶, chá, tea; 咖啡, kāfēi, coffee; 水, shuǐ, water.” Each card has its own pending recorded token. “The marks in pinyin show tones. Listen to the whole word. Chá rises; hē stays high; shuǐ is low and may rise at a pause. We will learn these sounds in useful words.” Play only if reviewed recordings are available; otherwise label speech work unavailable, retain text construction, and never simulate a listening score. Third tone is often low in connected speech rather than a full dip-rise. [TUFS third tone](https://www.coelang.tufs.ac.jp/mt/zh/pmod/practical/01-02-01.php).

1:40–2:10, model D1. Exact English: “Put the person first, then drink, then the drink itself. 我喝茶。Wǒ hē chá. Here that means ‘I'll drink tea.’ 喝 stays the same with a different person.” Model text/audio D1 only; do not show an exhaustive permutation table. SVO is a starting frame, not all Chinese word order. [TUFS verb sentences](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/card/001.html).

2:10–3:40, attempt P1. Prompt: “Your card says coffee. Tell your companion: I'll drink coffee.” Expected 我喝咖啡 / wǒ hē kāfēi. For an independent first attempt, close every earlier lexical card, native-script/pinyin pairing, model, pattern and answer-bearing bubble before P1 begins, not only D1. Keep only the English scenario/prompt and response control visible. Help remains available on demand; opening any lexical, pinyin or pattern support changes that attempt to supported and is logged. The first new coffee sentence can provide early independent construction evidence only under this closed-support condition.

| P1 response | Exact feedback | Next prompt, different from corrected one |
|---|---|---|
| Correct | “You put drink before coffee. Now change both the person and the drink.” | P2: “Your companion's card says water. Tell them: You'll drink water.” → 你喝水 / nǐ hē shuǐ. |
| Partial: 喝咖啡 | “That can work when the person is clear. This task asks you to show who. 我 means I.” | P2, same wording as above. Partial construction evidence, successful meaning in context. |
| Misconception: 我咖啡喝 | “You have the right ingredients. In this pattern, 喝 comes before the drink. Put the action before coffee.” | If learner repairs, P2. If they ask to see it: “我喝咖啡。Wǒ hē kāfēi.” Then P2; repair/reveal never becomes independent success. |
| Stuck / Help | “Start with who. Do you want one word, the pattern, or the whole answer?” Word = 我; pattern = person + 喝 + drink; reveal = 我喝咖啡。 | P2 after any whole-answer reveal. Allow “pause” without failure language. |

P2 correct feedback: “You changed who and what.” P2 partial/wrong: “你 is the companion; 喝 is before 水.” Reveal only on request: 你喝水。Next task is P3 below, not another attempt counted as new mastery. Empty response uses the same word/pattern/reveal ladder. Optional speech repetition is explicitly practice, not assessed pronunciation.

3:40–5:20, new item and model D2. “不, bù, means not in this pattern. Put it before 喝. 我不喝茶。Wǒ bù hē chá. ‘I won't drink tea.’ You do not need a separate word like English won't. This pattern does not mean ‘I didn't drink tea earlier.’” D2 is the only negative demonstration. The scope follows the TUFS explanation of 不 for habitual or unrealized actions, with fourth-tone sandhi introduced when relevant. [TUFS negation](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/explanation/001.html).

P3: “Your companion will skip coffee. Tell them: You won't drink coffee.” Expected 你不喝咖啡. Correct: “不 comes before 喝. You kept the person clear.” Partial missing 不: “Your sentence chooses coffee; the card skips it. Add 不 before 喝.” Misordered negative: “Not goes before drink here.” Stuck: “Choose the person first; then 不 + 喝; then the drink.” If requested, reveal P3. All branches next receive P4: “Your card says to skip water. Say your plan.” Expected 我不喝水. P4 feedback uses the same meaning/person/order checks; a reveal retires P4 and proceeds to the script task.

5:20–6:10, script task S1. “These two labels are 茶, tea, and 水, water. Look once; then I'll hide the pinyin.” After a short intervening screen, show 茶 and 水 in a different order, without pictures or pinyin: “Which means water?” Expected 水. This is taught-character recognition, not unseen construction; replay/reveal logs support. A wrong selection gets “水 is water; 茶 is tea” followed by a different check, “Now find tea.” Do not count that corrected trial as independent reading.

6:10–8:10, independent U1. Apply the same closed-support policy as P1: close all lexical cards, native-script/pinyin pairings, models, patterns and answer-bearing fox bubbles. No word bank or translation model remains. “Your companion's card says: no water for this breakfast. Tell them, ‘You won't drink water.’ Build the sentence without the word bank.” Expected 你不喝水 / nǐ bù hē shuǐ. This tuple is reserved: no demo, branch, hint or practice above contains companion + skip + water. An item-help request changes the result to supported. If wrong, say “Check who and whether the card chooses or skips the drink,” then, on request, reveal and retire the item. Follow with a different familiar item, “Your card chooses coffee; state your plan,” as practice only. Do not declare mastery from that repair.

8:10–9:00, exit. “You built [number] sentences without a model and used [help type] on [number]. We checked sentence construction. Your sound practice is [not assessed / reviewed result]. Next time you'll ask about someone else's choice.” Celebration fox only after an independent success; otherwise neutral/coaching. No confetti, streak threat, or invented mascot name.

## Fully scripted lesson 2 — zh.drink-questions

Outcome: ask whether a person drinks/likes a familiar drink and interpret a short negative reply. Prerequisites: L1 vocabulary and positive/negative order; supported review available. New items: 吗 ma, neutral-tone yes/no question particle; 喜欢 xǐhuan “like” (record the selected regional pronunciation and reviewer-approved xǐhuān alternative); 他 tā “he.” Structure: known statement + 吗; subject + 喜欢 + drink; response repeats the predicate. No female-character distinction is assessed before teaching 她 in a later extension.

Opening review R1: “Your card chooses water. State your plan.” Expected 我喝水, now retrieval from known components; this exact affirmative combination was not modeled in L1. Correct: “You retrieved the drink pattern.” Wrong/stuck: “Person, then 喝, then drink”; optionally reveal, then ask a different known L1 sentence before moving on.

Teacher: “吗 turns the statement pattern into a yes/no question. Keep the order and put 吗 at the end. 你喝茶吗？Nǐ hē chá ma? ‘Will you drink tea?’ The light final ma asks the question; do not replace the words' tones with an English rising-question tune.” D3 is this sole question model. “A short reply can repeat the action: 喝, ‘yes, I will,’ or 不喝, ‘no, I won't,’ when the drink and person are clear.” Both reply chunks are explicitly taught before use.

P5: “Ask whether your companion will drink coffee.” Expected 你喝咖啡吗. Likely error 你吗喝咖啡: “The question marker goes at the end.” Missing 吗: “That is a statement; add the question marker at the end.” Correct: “Your sentence asks instead of tells.” After any reveal, next P6 is “Your companion asked whether you'll drink tea. Your card says no. Give a short reply.” Expected 不喝; 我不喝茶 also accepted. A bare 不 receives “The listener may understand no, but practice the complete short reply 不喝.” Supported result remains supported.

Teacher: “喜欢 means like. It describes a preference, not a drink order. 我喜欢茶。Wǒ xǐhuan chá. ‘I like tea.’ 他, tā, means he; the verb still stays the same.” Explain the first of the adjacent third tones in wǒ xǐhuan rises in connected speech; display base-tone spelling separately from a listening note. P7: “His profile says he likes coffee. Report it.” Expected 他喜欢咖啡. Wrong 喝 rather than 喜欢: “This is a preference, not the breakfast plan.” Next after repair/reveal: P8 “Ask whether your companion likes water.” Expected 你喜欢水吗. Its availability for practice does not justify calling it held out later.

Independent U2: “You are asking a friend about another man. Ask whether he likes tea.” Expected 他喜欢茶吗 / tā xǐhuan chá ma. All components are taught; this person/predicate/object/question tuple is unseen. Independent recognition S2: with pinyin hidden, read 你喝咖啡吗？and decide “asking” or “telling”; treat as script-supported if pinyin is revealed. Feedback does not infer audio perception from reading. Close: “Today you changed a statement into a question and separated liking from drinking.” Review tags: question-final-ma, drinks, polarity, character-ma, connected-third-tone. Delayed tasks are specified below, not improvised from revealed examples.

## Fully scripted lesson 3 — zh.drink-stock

Outcome: ask whether drinks are available and distinguish not having from choosing not to drink. Prerequisites: L1–2 taught inventory, 吗, questions and 不; optional earlier review is practice. New inventory: 有 yǒu “have; available in this stock context”; 没有 méiyǒu “do not have; unavailable”; 牛奶 niúnǎi “milk”; 果汁 guǒzhī “fruit juice.” Explicitly teach each word in isolation with meaning/audio and native script before any sentence includes it. No count, classifier, past aspect or new polite request is required.

Teacher: “You are helping at the breakfast table. 有 says something is available or someone has it. 我有茶。Wǒ yǒu chá. ‘I have tea.’ To say you do not have it, use 没有: 我没有咖啡。Wǒ méiyǒu kāfēi. ‘I don't have coffee.’ Do not put 不 before 有 for this meaning. Not drinking and not having are different.” These are D4 and D5. Keep this rule local to possession/existence, not ‘all past negatives.’ [TUFS possession](https://www.coelang.tufs.ac.jp/mt/zh/gmod/contents/card/019.html).

P9: “Your tray has milk. Tell your companion.” Expected 我有牛奶. If 我是牛奶, say “有 says you have milk. Milk is not your identity.” 是 is not a required response and, if spontaneously used, its repair does not become a new grammar lesson. If 我不有牛奶, say “For having, the positive word is 有; the negative expression is 没有.” Correct: “You told us what is available.” After reveal, next P10: “Your companion has no fruit juice. Tell them what their tray lacks.” Expected 你没有果汁. Missing 没: “That says juice is available. This tray has none.” Stuck: word hint 没有, then optional whole answer, then a different P11.

Teacher: “You already know how to make a yes/no question: put 吗 at the end. 你有茶吗？Nǐ yǒu chá ma? ‘Do you have tea?’ A short answer can be 有 or 没有.” These short replies are explicitly defined. P11: “The host asks whether you have coffee. Your tray has none. Answer briefly.” Expected 没有. 不喝 is a misconception: “That says you won't drink it. The question is whether you have it.” After correction, P12: “Ask whether your companion has milk.” Expected 你有牛奶吗. No new vocabulary is smuggled into the next prompt.

Independent U3: “You are checking a man's tray for fruit juice. Ask your companion whether he has any.” Expected 他有果汁吗 / tā yǒu guǒzhī ma. Independent U4: “Your tray has no milk. Tell your companion.” Expected 我没有牛奶. These are withheld until this check. Meaning contrast C1: show 我不喝茶 and 我没有茶, both fully taught; ask which would fit “I have tea, but I am skipping it.” Expected first. This is an English-mediated comprehension check, not a listening task. Script S3: hide pinyin on 有/没有; choose the label for “unavailable.” Close: “You can now distinguish a choice from availability. We have not taught how to describe a past event.” Review tags: possession, mei-you, ma-question, drink-choice, script-negation.

## Ten-lesson map and later migration

The first three scripts above are the authoritative detail for rows 1–3. Each later row includes a small complete teaching contract; a lesson must be fully authored/reviewed before implementation. Examples below are design material, not extra learner exposures before the associated lesson.

| Order / stable ID / legacy links | Outcome; prerequisites and new items | Exact English explanation and model | Prompt → likely response; misconception/hint; unseen task/review |
|---|---|---|---|
| 1 zh.drink-choice / 01,02 | Make drink choice; none; seven listed items | “Put the person first, then drink, then the drink itself.” 我喝茶。 | P1 self/coffee → 我喝咖啡; order hint; U1 companion/skip/water. |
| 2 zh.drink-questions / 01,06 | Ask drink/preference; L1; 吗/喜欢/他 | “Keep the order and put 吗 at the end.” 你喝茶吗？ | Coffee question → 你喝咖啡吗; final-position hint; U2 他喜欢茶吗. |
| 3 zh.drink-stock / 04,09 | Check stock; L1–2; 有/没有/牛奶/果汁 | “Not drinking and not having are different.” 我没有咖啡。 | Have milk → 我有牛奶; possession hint; U3 他有果汁吗. |
| 4 zh.first-meeting / 05,04 | Give a name and greet; L1; 你好 nǐ hǎo, 谢谢 xièxie, 叫 jiào, pre-taught role name 安娜 Ānnà | “我叫 introduces your name. Learn 你好 as a greeting; its first third tone rises in speech.” 我叫安娜。 | Role Anna/name → 我叫安娜; missing 叫 hint; independent greet then supply a separately taught role name 李明 Lǐ Míng; name copying is supported, not literacy. Review question/statement. |
| 5 zh.order-cups / 03,13,14,18 | Order one/two cups; L1,4; 要 yào, 一 yī, 两 liǎng, 杯 bēi | “For cups of a drink, use number + 杯 + drink. In this service situation, say your order and add thanks.” 我要一杯茶，谢谢。 | Two coffees → 我要两杯咖啡，谢谢; missing 杯 hint; unseen two milks. Accept reviewed context-appropriate alternatives; explicitly teach spoken 一杯 yì bēi. Review stock. |
| 6 zh.temperature / 10 | Describe a drink's temperature; L1; 很 hěn, 热 rè, 冷 lěng | “For this neutral description use 很 + temperature, with no 是. 很 need not mean emphatic very here.” 茶很热。 | Water cold → 水很冷; no-是 hint; unseen 咖啡不热 for a card ‘coffee not hot’. Teach 不热 before this check; 不 before fourth-tone 热 is spoken bú. Review negative meaning. |
| 7 zh.identify-items / 04 | Identify what a drink is; L1,3; 这 zhè, 那 nà, 是 shì | “是 links this or that to a noun identity. It is not the drink verb.” 这是茶。 | That is milk → 那是牛奶; identity hint; unseen 那不是果汁 with explicit teaching of 不是 first. Accept base bù/surface bú convention; review temperature without 是. |
| 8 zh.locate-stock / 08 | Say where stock is; L3,7; 在 zài, 这里 zhèlǐ, 那里 nàlǐ | “在 connects the drink to where it is. Put the place after 在 in this location statement.” 茶在这里。 | Coffee there → 咖啡在那里; location-versus-have hint; unseen 牛奶在那里吗. Review script 这/那, taught question marker. |
| 9 zh.time-and-repair / 07,13,17 | Place a plan in time and ask repetition; L1,4; 今天 jīntiān, 明天 míngtiān, 请再说一遍 qǐng zài shuō yí biàn (whole repair phrase) | “In today's frame, put time after the person and before drink. The repair phrase means ‘Please say it again.’” 我今天喝茶。 | Tomorrow coffee → 我明天喝咖啡; time-position hint; unseen 你明天不喝牛奶; independent repair when audio is missed, scored separately. |
| 10 zh.breakfast-exchange / 20 | Complete a short encounter; L1–9; no new words/forms | “Find out what is available, make a choice, and check a detail. You can ask for help.” No new full-dialogue model before check. | New stock card requires a question, order and temperature/location check. Accept any taught appropriate sequence. Feedback names missing purpose; alternate fresh stock card after reveal. Schedule 24-hour/7-day review. |

### Reuse and sequencing rationale, keyed to the map

These are explicit design rationales to test, not claims that one order is optimal for every learner.

| Unit | Ingredients deliberately reused | Why it occupies this position |
|---|---|---|
| 1 | None assumed; everyday drink meanings provide the situation. | Establish one useful action frame and a small polarity contrast before broader grammar. |
| 2 | 我/你, 喝/不喝, 茶/咖啡/水 and person–predicate–drink order from 1. | Add a question purpose to a stable frame, then distinguish preference from action. |
| 3 | 我/你/他, familiar drinks, final 吗 and the choice-versus-negative contrast from 1–2. | Availability now matters in the same encounter; contrast 没有 with known 不喝 before generalizing negation. |
| 4 | 我 and confidence producing a short personal statement from 1–3. | Add greeting/name chunks with little sentence restructuring, and supply 谢谢 before ordering. |
| 5 | 我, familiar drink nouns and 谢谢 from 4. | Put small quantities and 杯 into an immediate order; avoid a detached large-number unit. |
| 6 | Drink nouns and 不 from 1, with familiar affirmative/negative meanings. | Introduce temperature predicates before noun identity so 是 is not learned as a universal English-style is. |
| 7 | Drink nouns, 吗 and 不; the descriptive predicate contrast from 6. | Add 是 for identity with an explicit boundary against the already known adjective frame. |
| 8 | Stock meanings from 3, drink nouns, 这/那 from 7 and 吗. | Distinguish where a drink is from whether it exists; 这里/那里 connect to familiar reference words. |
| 9 | Person + (不) + 喝 + drink from 1, and the accumulated drink inventory. | Add a time slot to an established plan and a repair chunk before the longer exchange. |
| 10 | The question, availability, greeting, order, description, identity, location and plan resources from 1–9. | Integrate purposes using familiar language, leaving new grammar out of the capstone. |

Remaining actual clusters: 11 conjunctions, 12 aspect, 16 ability, 17 word order and 18 preference become separate contextual follow-ons after the relevant frame succeeds; 15 comparisons and 19 的/得/地 require noun modification/complement prerequisites; 21 experience, 22 change, 26 duration need distinct aspect lessons; 23 把 and 24 被 require transitivity, affected-object/result context; 25 reduplication, 27 topic-comment, 28 particles and 29 advanced classifiers become usage modules; 30 idioms becomes optional reading with register context. Mapping records many-to-many relationships, not automatic lesson equivalence. Retain all thirty legacy destinations in a clearly labeled reference archive until reviewed replacements exist. Titles alone do not establish later content quality; only sampled defects above are confirmed.

## Assessment, retention and fox contract

### Mandarin formative pilot: 6–8 adult true beginners

Recruit 6–8 adults with no Mandarin course history, household use or functional Mandarin conversation. Confirm they can understand the English instructions; record other Chinese-variety exposure, prior Hanzi/kanji literacy, pinyin exposure, IME familiarity and accessibility needs. Prior character knowledge is a separate background variable, not Mandarin reading improvement caused by this lesson. Ensure the sample includes learners without character literacy; with this small formative sample, report individual paths and denominators rather than subgroup-effect or efficacy claims.

Before teaching, use a brief baseline of two English situation prompts containing future MODEL meanings only: “At breakfast, tell your companion: I'll drink tea” (later D1) and “At breakfast, tell your companion: I won't drink tea” (later D2). Allow a response or “I don't know”; no word bank, target-language text/audio, hints or corrective answer. Limit the baseline to about 60–90 seconds, stopping sooner if the learner has no response. Never use U1–U4, fresh formative tasks or delayed held-outs in the screener/baseline. Do not rehearse their answers with participants. Log spontaneous extra language too, retiring a reserved tuple if the participant exposes it. Give normal teaching feedback only when the planned model is reached.

Observe Mandarin-specific priorities: whether pinyin is mistaken for English spelling; whether the learner attends to tones without equating transcription with pronunciation; whether 我/你 and word order survive hidden cards; whether 不喝 versus 没有 conveys choice versus availability; and whether 水/茶 recognition succeeds without pinyin. Use reviewed audio and qualified sound assessment before testing any pronunciation outcome; otherwise measure text construction and mark speech unassessed. Check card reopening, hint/reveal use, silent thinking, first independent message, frustration and 24-hour/seven-day retention by modality. These sessions diagnose the design; they have not been conducted.

Use one measurement clock policy. Wall-clock zero is the participant's actual arrival at the experience, before setup, language/course selection or authentication. Never restart that wall clock at lesson start. Active LESSON time is separate: count visible, unpaused lesson instructions, reading, listening, silent thinking, typing/speaking, constructing responses and feedback. Exclude authentication, setup/selection, background time, explicit learner pauses and technical waiting; tag setup and the pre-lesson baseline separately. Do not infer a pause from silence, a lack of clicks or an idle keyboard. Report arrival-to-first-post-teaching-independent-message wall time and the active lesson time accrued before that result, with modality and support. Record baseline success as prior knowledge, separately from learning after teaching. The scripts' 0:00 labels are lesson-content position guides, not an end-to-end stopwatch; the 8–10-minute duration is a content estimate awaiting measurement.

“Independent construction” means a meaning/situation prompt with no sentence model, aligned translation, ordered tiles or answer-bearing hint, using taught ingredients in a withheld combination. Log typed_native_script, typed_pinyin, assessed_speech or self_report separately. Untoned pinyin can receive sentence-meaning/structure credit; tone spelling is a separate result. Pinyin is not Chinese-character literacy. Native-script typing with IME is recorded as such; selecting prepared tiles is supported assembly. Speech needs audio plus a qualified or validated assessor; speech recognition returning expected text is not pronunciation assessment. Without that assessor, record “spoken practice, unassessed,” never pass/fail sounds.

Formative eight-task check after L3: F1 U1 companion/skip/water; F2 U2 third-person/like/tea/question; F3 U3 third-person/have/juice/question; F4 U4 self/no-milk; F5 “You ask whether he drinks milk” → 他喝牛奶吗; F6 “He doesn't like fruit juice” → 他不喜欢果汁; F7 script-only 你有水吗 → supply English meaning; F8 reviewed audio 他没有茶 → report who and what is unavailable. F1–4 are prior checks, so report their original first attempts rather than repeat them as fresh; F5–8 are fresh. If any item has appeared in free practice, retire it from this set. Audio F8 is pending production and cannot be scored now.

24-hour heldouts, unseen in all scripts/hints above: H24a 我喜欢牛奶 for “I like milk”; H24b 他没有水 for “He has no water”; H24c 你有果汁吗 for “Do you have juice?” Seven-day heldouts: H7a 他不喝果汁 for “He will skip juice”; H7b 我没有果汁 for “I have no juice”; H7c 他喜欢牛奶吗 for “Does he like milk?” These use taught combinations; reviews hide examples and word banks until help is requested. Reading and listening add independent presentations only if the combination has not already been exposed in another scored modality; otherwise label them cross-modal retrieval, not fresh transfer. Dates are proposed review intervals, not automations created in this design task.

Score each construction 0–2 meaning (0 wrong purpose/person/polarity, 1 recoverable ambiguity, 2 intended message) and 0–2 target form (0 absent, 1 repairable, 2 appropriate order/marker/negator). Record support as none/word/pattern/reveal, attempts and time without speed pressure. Optional pinyin accuracy 0–2, script recognition 0–2 and speech intelligibility/tones 0–2 each are separate axes. A formative readiness signal: at least five of the six construction items F1–F6 convey the intended meaning on their original unaided first attempt, with no recurring question/negation confusion; otherwise route the specific weak frame to practice. This provisional threshold needs pilot validation and does not establish CEFR/HSK level. Compare first-attempt 24-hour and seven-day results to the immediate results; report denominators, missing reviews and support use.

The existing unnamed fox stays static/quiet. Neutral = presenting; thinking = learner work, with no unsolicited answer; coaching = requested word/pattern help; retry = an actionable correction; celebration = an independently successful attempt. Optional exact help: “Would you like a word, the pattern, or an example?” Help log fields: lesson/step/item ID, support type, revealed content ID, response modality, first response, correction response, independent eligibility and next different prompt ID. Any revealed tuple is excluded from future heldouts for that learner.


---

# Japanese curriculum appendix — design draft

Status: original AI-drafted material, version 0.1.0, teaching language English. Qualified Japanese teacher/native-speaker review of language, register, script guidance and recorded audio is pending. The assessment cutoffs are proposals requiring learner validation. This is a design deliverable; no course has been implemented or published by this appendix.

## Source audit and limits

Read the complete source lessons ja-lesson01–03 and the complete systematic sample 05, 10, 18 (midpoint of 35), and 35 (final). Inspected the full catalog inventory and compared all 35 content strings with their corresponding server/courses/japanese/lessonNN.md files: they match. Catalog numeric IDs are 145–179; stable legacy IDs are ja-lesson01–35. Deployment verification in the shared report establishes version 2, ff6711c. No browser inspection or independent claim about deployed interaction is made here.

The strongest observed teaching path is English explanations with native Japanese text and romaji. The original promise that romaji is always available should become learner-controlled support with explicit script development, respecting the earlier preference to begin without a compulsory script gate. It must not turn into permanent script avoidance or a claim that constructing romaji is Japanese reading.

Evidence IDs identify exact source locations; “defect” is directly supported by the inspected text, while “hypothesis” awaits linguistic or learner review. Effort: S = focused editorial/reviewer correction; M = lesson rewrite with assessment/audio; L = multi-lesson reconstruction. Estimates describe scope, not schedules.

| Evidence ID / source | Exact observed snippet | Problem → proposed disposition | Rationale / limits; effort; success; priority |
|---|---|---|---|
| JA-A01 / 01 | “the verb always comes at the end”; “Japanese doesn't use word order to show the relationships” | Overgeneralization: particles are important, but word order is not unconstrained and natural utterances include omissions and afterthoughts. Replace with a scoped beginner predicate-final frame. | Keep useful contrast with English without claiming universal syntax. S; reviewer finds no categorical word-order claim; P1. |
| JA-A02 / 01 | “Marks the topic/subject of sentence” | Terminological defect: topic は and grammatical subject are conflated. Teach は as marking what is being discussed; distinguish が in a later, contextual lesson. | Omission is already correctly mentioned in source and should be retained. [Japan Foundation, Starter 3 grammar notes](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_L03.pdf). M; learner uses context without adding 私は to every reply; P0. |
| JA-A03 / 01 | “Japanese doesn't use a verb for simple statements” followed by “is a polite copula” | Internal framing confusion. Replace with a simple noun-predicate explanation; retain the useful warning not to append です to every verb. | Do not make learners adjudicate grammatical terminology. S; answer keys distinguish noun+です and verb+ます; P0. |
| JA-A04 / 01 | “This is a new supplied phrase, not something the earlier を examples taught.” | Positive evidence: the later edit honestly supplies 学校に and labels the new destination dependency. Preserve that transparency, but move the destination exercise to its own outcome. | Five translations still combine numerous verbs, pronouns, noun predicates and two particle functions. Overload is a hypothesis. M; each assessed form has an explicit earlier teaching step; P1. |
| JA-A05 / 02 | “ああ, おう (both pronounced as a long 'o')” | Clear phonology defect: ああ is long a. Correct the example and distinguish spelling from sound. | Long vowels retain the vowel quality; katakana ー represents length. [TUFS long vowels](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/02-02-01.php). S; audio/script pairs and explanation agree; P0. |
| JA-A06 / 02 | “Regular stress (generally flat, with slight pitch variations)”; “adding slight emphasis to the first syllable” | Misleading rule: do not train fixed initial stress. Replace with word-specific pitch listening and mora timing. | The learner need not master an accent system before speaking, but pronunciation is not globally flat or initial-stressed. [TUFS accent](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/01-08-01.php), [mora timing](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/01-10-01.php). M; assessed audio distinguishes length/rhythm from transcript matching; P0. |
| JA-A07 / 02 | “we'll always provide the romanized pronunciation” | Observed support commitment; risk hypothesis: no actual-script retrieval progression is specified. Keep optional romaji and add item-specific fading, kana/kanji recognition and IME tasks. | No kana gate; completion reports modalities separately. M; script-only checks have no aligned romaji and record reveals; P0. |
| JA-A08 / 03 | “What time is it? 3:30” → “今何時ですか？三時半です。” | Dependency defect: 今/何時/半 and question construction appear in the answer without being taught for this task; 三百's sanbyaku is also first supplied in the answer. Teach the needed form or narrow assessment. | The lesson spans 0–100 million, counters and time. Breadth concerns need learner testing, but answer dependencies are observable. M; every answer uses explicitly introduced ingredients; P0. |
| JA-A09 / 05 | “Goodbye (general)” for さようなら | Pragmatic simplification: farewells, hierarchy and intimacy need contextual choices. Replace universal labels with scenario-specific guidance. | Do not claim all casual language is rude or all greetings require fixed behavior. Teacher review of social nuance pending. M; multiple suitable responses accepted; P1. |
| JA-A10 / 10 | “When talking about what other people want, it's more natural to use がほしい” | Misleading third-person desire rule. Rewrite distinguishing direct personal access, reported desire and observed behavior; avoid implying bare ほしい solves the issue. | Context can license third-person descriptions; native review decides examples, not a blanket ban. [TUFS desire scope](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/069.html). M; information-source scenarios and keys agree; P0. |
| JA-A11 / 10 | “using を … instead of が … with potential verbs” under mistakes | Internal contradiction: earlier note permits を with potential forms, then mistakes section rejects it. Accept reviewer-approved を/が variants; separate ability from visible/audible expressions. | Permission, potential, desires and advanced combinations should be split by outcome. M; equivalent valid variants no longer penalized; P0. |
| JA-A12 / 18 | “Let's not go today.” → “今日は行かないようにしましょう。” | Dependency defect: answer requires a negative ようにする construction beyond the presented plain/polite volition patterns. Move or explicitly teach it. | Seven future/intention/conditional patterns in one lesson are not evidence of a usable future skill. M; unseen tasks use already taught forms; P0. |
| JA-A13 / 35 | “休んだらどうですか。(*Yasunda dō desu ka.*)” | Direct script–romaji mismatch: ra is omitted from yasundara. Correct it, then review every aligned reading. | No native judgment needed to establish mismatch. S; alignment review catches missing mora; P0. |
| JA-A14 / 35 | “かな/かしら … (male/female)” and “お伺いすることができかねます” | Review hypotheses: categorical gender labels and stacked business refusal wording risk unnatural guidance. Reauthor by relationship/context with qualified review; do not classify all variants as grammatical impossibilities. | Source's business/casual final tasks need contextual rubrics, not one-answer imitation. L; role-appropriate alternatives and fresh scenario assessment; P1. |

## Original lesson identity and script pathway

New stable IDs: ja.table-identification, ja.confirm-and-correct, ja.order-at-table, ja.first-meeting, ja.drink-actions, ja.preferences, ja.find-place, ja.order-quantities, ja.tomorrow-plan, ja.cafe-exchange. Store sequence in a separate ordered ID list. Legacy ja-lessonNN IDs remain immutable, including historical completion. A mapping links multiple legacy sources to an original lesson; moving one never changes its identity or retroactively turns a legacy completion into new mastery.

Actual Japanese text appears from the first item. In L1 teach これ as こ ko + れ re, それ as そ so + れ re, です as で de + す su; は is pronounced wa in the topic function. Teach 水 as the written word read みず mizu here; not every kanji has just one reading. Show お茶 with おちゃ ocha; small ゃ combines with ち in ちゃ. コーヒー is katakana; each ー extends the preceding vowel. パン ends with the timing unit ン. Learners may initially use romaji for construction; the script strand measures word recognition separately. The whole word can be supported before its constituent symbols are independently retrievable.

L2 adds か, じゃないです, はい, いいえ and script-only readings of taught sentences. L3 adds を (o), く/だ/さ/い and と while using familiar nouns. L4 introduces a reviewed name spelling and 学生 with がくせい; L5 links 飲みます/飲みません to のみます/のみません; L6 links 好き to すき and が; L7 introduces トイレ, どこ, ここ/そこ; L8 teaches 一つ/二つ/三つ with their complete irregular readings and small っ; L9 introduces 明日/駅/行きます with furigana; L10 reads a small menu and exchange in familiar forms. Unknown symbols always retain readings. Romaji fades only on demonstrated items and can be restored; script assessment never silently counts that restore as unaided reading.

This is a progression of usable words, kana features and kanji in context, not an entire syllabary before communication. Typing with an IME is a separate skill from handwriting. [Japan Foundation, Starter 3](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_L03.pdf) includes contextual kanji recognition and keyboard input alongside communication. No score here implies general kanji literacy.

## Fully scripted lesson 1 — ja.table-identification

Outcome: identify familiar food/drink in a simple polite noun sentence, making the near-you/near-listener reference explicit when needed. Prerequisites: none. Duration: about 8–10 minutes. New inventory: これ kore “this thing near me”; それ sore “that thing near you” in the pictured setup; は wa topic marker; です desu polite noun-predicate ending; 水／みず mizu “water”; お茶／おちゃ ocha “tea”; コーヒー kōhī “coffee”; パン pan “bread.” No noun modifiers, questions, negation or object particles are required. “Near you” is the initial concrete use of それ, not its exhaustive meaning.

0:00–0:35, neutral static fox. Exact English: “You are helping a visitor identify things on a table. By the end, you can say what this or that is in Japanese. Type romaji or Japanese if you like. We will look at a few real Japanese words as we go; you don't need to learn an alphabet first.” No task clock pressures the learner.

0:35–1:45, vocabulary cards. “水, みず, mizu, is water. お茶, おちゃ, ocha, is tea. コーヒー, kōhī, is coffee. パン, pan, is bread.” Show each meaning and reviewed audio when available, with no full bread sentence. “これ means this thing near me. それ means that thing near you in this picture.” Use a stable two-person tabletop with explicit English labels “you” and “visitor”; do not infer deictic reference from ambiguous screen position.

1:45–2:30, D1. “First say what you are talking about; は marks that topic. Then name it, and finish this polite noun sentence with です. これは水です。Kore wa mizu desu. ‘This is water.’ は is written ha but pronounced wa here. です belongs to this noun pattern; it is not a word to add after every Japanese sentence.” The particles follow their associated words. The noun pattern and は pronunciation have primary support in [TUFS noun predicates](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/001.html) and [topic/subject explanation](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/002.html). Context-based omission is supported by the Japan Foundation reference above.

D2: “For the cup near the visitor: それはお茶です。Sore wa ocha desu. ‘That is tea.’ The ending stays です.” Character/pinyin analogue distinction is explicit: the native sentence and romaji are not two assessed skills just because both are displayed.

2:30–4:20, P1 prompt: “The coffee is beside you. Tell the visitor what it is politely.” Expected examples: これはコーヒーです / kore wa kōhī desu or コーヒーです / kōhī desu. コーヒーです is itself a grammatical complete polite noun sentence. If this first coffee+です combination is built unaided, it earns independent meaningful sentence-construction credit; deictic/topic use remains untested. An optional task explicitly asking for これ/それは may separately score its omission as partial target-frame evidence. Accept kōhī and koohii for the romaji task; sound length still requires audio evidence.

For an independent P1 attempt, close all earlier lexical cards, native-script/romaji pairings, models, patterns and answer-bearing bubbles before the prompt. Retain only the English scenario, unlabelled objects with speaker/listener positions, and response control. Any reopening of words, readings or examples makes that attempt supported and is logged. A picture gives communicative context, not the Japanese wording.

| P1 branch | Exact English feedback | Next different prompt |
|---|---|---|
| Correct | “You identified this cup and kept the polite ending. Now the object is near the visitor.” | P2: “The water is beside the visitor. For this frame practice, include ‘that’ and tell them what it is.” → それは水です / sore wa mizu desu. |
| Short noun sentence: コーヒーです | “That is a complete polite sentence. You built coffee plus です. To practise making the reference explicit, you can add これは.” | P2; award independent noun-sentence credit if unaided and unseen. Topic/deictic target remains untested unless explicitly elicited. |
| Partially correct for the polite target: これ、コーヒー | “I can tell you mean this coffee. The polite noun ending is not shown yet. Put です after コーヒー.” Word hint: “です is the polite ending here.” Pattern hint: “item name + です.” | P2: “The water is beside the visitor. For this frame practice, include ‘that’ and tell them what it is.” → それは水です. Keep the identifiable-message evidence; polite noun construction is not yet demonstrated on P1. |
| Misconception: これですコーヒー | “The polite ending comes after the name of the thing. Say the topic, then coffee, then です.” | Repair allowed; if answer requested, reveal これはコーヒーです。 Then P2, never rescoring the revealed response as independent. |
| Stuck / Help | “Would you like one word, the pattern, or the whole example?” Word = これ; pattern = thing + は + name + です; reveal = P1 answer. | P2 after a reveal; pause is available without penalty. |

P2 correct: “You changed this to that.” If これ, say “This cup is near the visitor, so use それ in this picture.” If missing は, say “To practice the full topic frame, put は after それ.” Do not claim particles can never be omitted in conversation. If stuck, offer one word/pattern/reveal; after reveal of それは水です, move to P3 “The tea is beside you. Identify it.” Expected これはお茶です. Correct P3: “You kept the frame and changed the noun.” Error P3: explain only the mismatched piece, optionally reveal, then P4 “The coffee is beside the visitor. Identify it.” Expected それはコーヒーです. P4 can receive the same local corrective ladder; afterwards move to script recognition, not a duplicate supposedly independent answer.

4:20–5:30, sound and script microstep. “Coffee has two long vowels: kō-hī. A long vowel lasts longer; it does not turn into a different vowel. In コーヒー, the bars show the length. Listen and tap four timing units: ko-o-hi-i.” Playback is a pending reviewed recording, never imaginary audio. “Japanese rhythm uses small timing units called morae. Do not add a strong English stress to the first part of every word.” No instant pronunciation grade. [TUFS long vowels](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/02-02-01.php), [mora timing](https://www.coelang.tufs.ac.jp/mt/ja/pmod/practical/01-10-01.php).

Script S1: briefly display 水 and パン with meanings/readings, hide them, then show the two native labels alone in a changed order: “Which label means water?” Expected 水. This is learned-word recognition. If wrong, “水 means water; パン means bread,” followed by different S2 “Find bread.” That immediate repaired trial is supported, not proof of reading. Learners can skip script practice and continue; script evidence remains “not attempted,” not a construction failure.

5:30–7:45, independent U1: “A visitor points to the bread beside you. Tell them what it is politely. Build your sentence without the word bank.” Expected これはパンです / kore wa pan desu or パンです / pan desu. Bread has been taught only as an item; no demo, correction, clue or guided sentence uses this+bread+polite identification before U1. Apply the same closed-support policy as P1: close all lexical cards, native-script/romaji pairings, models, patterns and ordered tiles. Correct: “You built a new sentence from the words you learned.” パンです is a complete grammatical noun sentence and this first unseen bread+です composition can earn independent meaningful sentence-construction credit. Its topic/deictic target is untested, not evidence of an incomplete Japanese sentence. If a separate prompt explicitly requests これは, omission affects only that prompt's target-frame score. Wrong: “Check what is being pointed to, and put です after its name.” Any answer-bearing help changes eligibility to supported. Reveal retires U1. Next task is different, previously practiced coffee-near-visitor, and is labeled practice.

7:45–9:00, exit. “Today you practiced identifying things politely. Your result: [construction attempts and support], [script recognition result], [speech unassessed or reviewed result].” Short contextual addition, no new required target language: “If someone already knows which cup you mean, just naming it with です can be natural. We used the full frame to make the reference clear.” Fox celebration only for an unaided successful construction; otherwise a quiet neutral/coaching state. No invented mascot name.

## Fully scripted lesson 2 — ja.confirm-and-correct

Outcome: check a food/drink identity and politely correct a wrong label. Prerequisites: L1 inventory, full noun frame and deictic scene; optional retrieval support available. New forms: か ka sentence-final question marker; はい hai “yes” in affirmative identity questions; いいえ iie “no”; じゃないです ja nai desu “is not” in this noun pattern. Teach ではありません dewa arimasen as an accepted more formal alternative only if the learner asks; never require it before explanation. No negative question is assessed.

Opening R1, familiar coffee by visitor: “Tell the visitor what that is.” Expected それはコーヒーです; already practiced retrieval, not fresh transfer. If stuck, restore the L1 pattern, then change the drink before continuing.

Teacher: “To ask a polite yes/no question in this pattern, put か after です. これはコーヒーですか。Kore wa kōhī desu ka. ‘Is this coffee?’ Keep the rest of the order.” D3. “はい confirms an affirmative question. いいえ disagrees.” Play/print both newly taught words. [TUFS noun questions](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/card/003.html). P5: “Tea is near the visitor. Ask whether that is tea.” Expected それはお茶ですか. Missing か: “That tells; the task asks. Add か after です.” か before noun: “The question marker comes at the end.” Correct: “You made the sentence a question.” After any reveal, P6 is “You are asked whether this is water. It is water. Answer briefly and politely.” Expected はい; はい、水です accepted; construction credit only if a sentence was requested. Do not turn a one-word confirmation into a full-sentence mastery claim.

Teacher: “For a negative noun statement, replace です with じゃないです. それは水じゃないです。Sore wa mizu ja nai desu. ‘That isn't water.’ Keep じゃないです together for now. It is a polite conversational negative. It is not a general negative ending for every verb or adjective.” D4. The source grammar notes teach noun negation; their range does not authorize a universal rule. [Japan Foundation, Starter 3](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_L03.pdf).

P7: “The cup near you is tea. Someone labels it coffee. Say ‘This isn't coffee.’” Expected これはコーヒーじゃないです. Incorrect これじゃないですコーヒー: “Finish with the negative ending after coffee.” Partial いいえ: “That disagrees, but say which label is wrong in this task.” Correct: “You rejected the wrong identity.” If stuck, word/pattern/reveal help; next different P8: “The cup near the visitor is water. Say ‘That isn't tea.’” Expected それはお茶じゃないです. Then invite separate 水です as an optional already-taught correction; no new frame needed.

Independent U2: “The item near you is bread. Someone calls it tea. Politely say ‘This isn't tea,’ then identify it.” Expected これはお茶じゃないです。パンです。 The combination this+negative+tea has not appeared in any demonstration or hint; the second part is contextual retrieval. Do not count previously seen bread identification as additional unseen transfer. Script S3: native-only これは水ですか, ask “What is being asked?” Expected whether this is water. Pinyin-equivalent romaji reveal logs support. Close: “You checked a label and corrected it. The ending changed because the meaning changed.” Review tags: noun-question, noun-negative, deictic-reference, polite-scope, kana-ka.

## Fully scripted lesson 3 — ja.order-at-table

Outcome: get attention and request one or two familiar items at a counter. Prerequisites: L1 nouns and demonstratives; L2 optional confirmations; no verb conjugation prerequisite. New items/forms: すみません sumimasen “excuse me” for attention here; を o object marker; ください kudasai “please give me” in item requests; と to joining nouns “and”; ありがとうございます arigatō gozaimasu “thank you” (a full expression). Teach the sound, meaning and script of each before requesting it. They are usable chunks; the learner is not expected to derive their morphology.

Teacher: “First get the server's attention with すみません. To ask for an item, say the item, then を, then ください. 水をください。Mizu o kudasai. ‘Water, please.’ を is written wo and pronounced o in this use. Do not add です to ください.” D5. “In a simple counter exchange, you may also hear 水、ください. Our practice includes を so you can notice the object marker.” The omission variant is acceptable communication, not a universal license to delete particles. [TUFS item requests](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/card/054.html) models the を version; [Japan Foundation, Starter 6](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_L06.pdf) supports contextual omission. This original lesson explicitly accepts both in the stated counter exchange.

P9: “Get attention, then request bread.” Expected すみません。パンをください。 Correct: “The item comes before the request.” If パンです, “That identifies bread. To request it, use をください.” If くださいをパン, “Item first, then を, then ください.” If stuck, reveal the smallest useful chunk, then the full answer only on request. Next different P10: “Request tea.” Expected お茶をください. After repair, practice thanks with the newly taught expression; do not score its immediate imitation as independent retrieval.

Teacher: “と joins the two items before the request: お茶とパンをください。Ocha to pan o kudasai. ‘Tea and bread, please.’ The request covers both items.” D6. P11: “Request water and bread.” Expected 水とパンをください. Missing と: “Use と between the two item names.” Correct: “You requested both.” After correction/reveal, next P12 is “Request coffee and water.” Expected コーヒーと水をください. These two pairs are never used as unseen review pairs. A learner may reverse the pair order, and either order is equivalent; do not count a reversed pair as a new combination.

Independent U3: “You want coffee and tea. Get the server's attention and request both. Use a sentence you have not copied.” Expected すみません。コーヒーとお茶をください。 Either noun order accepted. Coffee+tea is reserved from all demos, branches and hints. Optional U4: “The server brings the items; what do you say?” Expected ありがとうございます; this is phrase retrieval, not novel sentence construction. If a learner uses お願いします from prior knowledge, mark for teacher-reviewed semantic acceptance and explain it before adding it to required vocabulary.

Script S4: display を and は alone, after explicit teaching: “Which is pronounced o when it marks the requested item?” Expected を. This is script-function recognition, not pronunciation production. Close: “You can request items and join two with と. We used a request expression, so we did not attach the noun ending です.” Next practice after any U3 reveal uses a previously trained pair and is labeled supported retrieval; heldout review pairs remain untouched.

## Ten-lesson map and legacy migration

Rows 1–3 refer to the full scripts above. Later rows are concrete teaching contracts that still require full authoring and review before implementation. Any required new word appears with a reading and meaning; if a learner contributes another word, supply and teach it before asking for independent use.

| Order / stable ID / legacy links | Outcome; prerequisites; new material | Exact explanation and model | Prompt → likely response; correction; independent task/review |
|---|---|---|---|
| 1 ja.table-identification / 01,02 | Identify table items; none; listed eight items | “Finish this polite noun sentence with です.” これは水です。 | Coffee nearby → これはコーヒーです; noun before ending; unseen this/bread. |
| 2 ja.confirm-and-correct / 04,09 | Check/correct identity; L1; か/はい/いいえ/じゃないです | “Replace です with じゃないです for this negative noun statement.” それは水じゃないです。 | Ask tea near visitor → それはお茶ですか; final か hint; unseen this/not-tea. |
| 3 ja.order-at-table / 09 | Request items; L1; すみません/を/ください/と/ありがとうございます | “The request covers both items.” お茶とパンをください。 | Water+bread request; と between nouns; unseen coffee+tea. |
| 4 ja.first-meeting / 05,04 | Give name/role; L1; はじめまして hajimemashite, 学生 gakusei student, reviewed role names マヤ Maya / リナ Rina | “When it is clear you mean yourself, your name plus です is enough.” マヤです。学生です。 | Role Rina → リナです; reject self-added さん only after explaining why; unseen role/name combination with greeting. Real-name transcription is supported until taught. Review です scope. |
| 5 ja.drink-actions / 01,06 | Say which drink you consume/avoid; L1,3; 飲みます nomimasu, 飲みません nomimasen | “These are polite drink/do-not-drink forms. を follows what is drunk. They do not take です after them.” 水を飲みます。 | Tea avoidance → お茶を飲みません; action versus request hint; unseen コーヒーを飲みます. Interpret nonpast in a stated everyday-choice context. Review noun-negative distinction. |
| 6 ja.preferences / 08,10 | Share drink preference; L1; 好き suki liked/favored, が ga in preference frame | “Japanese 好き is not an English-style action verb. Use drink + が好きです here.” お茶が好きです。 | Coffee preference → コーヒーが好きです; が-before-好き hint; unseen パンが好きです. Negation waits until explicitly modeled with noun/na-type predicate scope. Review omission of obvious speaker. |
| 7 ja.find-place / 12 | Ask restroom location; L1–2; トイレ toire restroom, どこ doko where, ここ koko here, そこ soko there near listener | “Put どこ in the location slot, and keep the question ending.” トイレはどこですか。 | Picture restroom here → トイレはここです; これ versus location ここ hint; unseen restroom there. Teach location です separately; not existence/ownership. Review question end. |
| 8 ja.order-quantities / 03,16 | Request one/two/three servings; L3; 一つ hitotsu, 二つ futatsu, 三つ mittsu | “For these servings, use the whole counter word after the item. These are not ichi/ni/san plus tsu.” お茶を二つください。 | One coffee → コーヒーを一つください; use whole counter hint; unseen three waters. Accept お茶二つください and reviewed conventional counter variants. Review small っ and timing. |
| 9 ja.tomorrow-plan / 11,18,12 | State tomorrow's destination; L1,5; 明日 ashita tomorrow, 駅 eki station, 学校 gakkō school, に ni destination, 行きます ikimasu go | “明日 sets tomorrow; に follows the destination. 行きます is nonpast and works for this plan.” 明日、駅に行きます。 | ‘Tomorrow, school’ → 明日学校に行きます; put に after the destination, not after 明日 in this frame. Heldout question 駅に行きますか with no new future marker. Review long vowel/small っ in 学校. |
| 10 ja.cafe-exchange / 01,03,09,35 | Identify, check, request and thank in a short encounter; L1–8; no new forms | “Use what you know to get the right items. You can ask to see a word.” No complete assessed dialogue is modeled first. | New menu/stock card; likely これは…ですか, …をください, ありがとうございます; feedback identifies missing purpose. Alternative fresh card after any reveal; 24-hour/7-day scenario review. |

### Reuse and sequencing rationale, keyed to the map

These are testable design rationales, not a universal claim about the best Japanese sequence.

| Unit | Ingredients deliberately reused | Why it occupies this position |
|---|---|---|
| 1 | None assumed; familiar table-item meanings anchor the scene. | Establish a useful noun sentence and real-script contact without a syllabary gate. |
| 2 | これ/それ, は, です and all four item nouns from 1. | Change the speech act and polarity while keeping reference and vocabulary stable. |
| 3 | All four item nouns and understanding of an identified item from 1–2. | Turn identification into a practical request; introduce を and と where their purposes are visible. |
| 4 | Noun + です and context-based omission from 1; polite interaction from 2–3. | Apply a familiar noun sentence to oneself while supplying name/greeting chunks in context. |
| 5 | Drink nouns and object-marker を from 3. | Introduce polite action/negative-action forms after the learner has a reason to notice the object. |
| 6 | Familiar nouns and です from 1, plus the action-predicate contrast from 5. | Teach preference in its Japanese predicate frame rather than forcing an English verb-like pattern. |
| 7 | は, ですか and concrete reference contrasts from 1–2. | Ask location through a known question frame while distinguishing ここ/そこ from object words これ/それ. |
| 8 | Item nouns, をください and optional と from 3. | Add whole counter forms to a familiar transaction, rather than requiring abstract number mastery first. |
| 9 | Understood-speaker omission and polite action framing from 5; familiar question-final か from 2. | Test transfer beyond the table with a small time/destination frame and explicitly taught に. |
| 10 | Identification, confirmation, correction, requests, quantities and thanks from 1–8. | Integrate the core encounter without new grammar; unit 9 is transfer practice, not a hidden prerequisite for the café task. |

Remaining actual lessons: 06 verb forms and 07 particles become contextual modules with explicit dictionary/polite/negative prerequisites; 08 adjectives splits i/na predicate and attributive functions; 10 desire/ability/permission splits into separate goals; 11 time and 12 location remain functional rather than exhaustive lists; 13 connections and 14 te-form precede chained requests/actions; 15 honorific language receives relationship-specific review; 16 counters and 17 comparisons build from quantity/descriptions. Later 18 future, 19 feelings, 20 change, 21 giving/receiving, 22 obligation, 23 attempts, 24 conditionals, 25 explanation, 26 advice, 27 probability, 28 experience, 29 causative/passive, 30 quotation, 31 verb pairs, 32 onomatopoeia, 33 negative requests, 34 idioms and 35 integration each need a prerequisite audit and scoped assessment. Retain their stable IDs in an optional legacy reference archive; these are cluster dispositions from observed titles, not claims that every unsampled example has been verified.

## Assessment, retention and companion behavior

### Japanese formative pilot: 6–8 adult true beginners

Recruit 6–8 adults with no Japanese course history, household use or functional Japanese conversation. Confirm comprehension of the English instructions; record incidental Japanese exposure, kana/kanji familiarity, Chinese-character literacy, romaji habits, IME familiarity and accessibility needs. Include learners without kana or kanji knowledge. Treat prior script knowledge as a separate baseline condition; this small formative sample supports observation of individual difficulties, not statistical efficacy or subgroup claims.

Before teaching, use a brief baseline containing future MODEL meanings only: point to water near the speaker and ask in English, “Tell the visitor: This is water” (later D1); then point to tea near the visitor and ask, “Tell the visitor: That is tea” (later D2). Accept an attempt or “I don't know.” Show no Japanese text, romaji answer, target audio, vocabulary bank, hint or corrective model. Limit the baseline to about 60–90 seconds. Never use U1–U3, fresh formative tasks or delayed held-outs in screening/baseline, and do not rehearse them. Log any extra spontaneous construction and retire its tuple if it overlaps a reserved assessment. Feedback waits for the corresponding planned teaching model.

Observe Japanese-specific priorities: object reference without obligatory pronouns/topics; whether a learner can independently build a grammatical Nです sentence, including パンです; whether です is overextended onto requests/actions; は/を readings and functions; mora/vowel-length attention; and actual-script recognition when romaji closes. Separate unfamiliar input-method friction from language knowledge. Use reviewed audio before sound tasks and qualified assessment before pronunciation claims. Examine support use, silent thinking, first independent message, noun-question/negation, and delayed unordered-pair transfer by modality. These sessions are proposed, not completed.

Use one measurement clock policy. Wall-clock zero is the participant's actual arrival at the experience, before setup, language/course selection or authentication. Never restart that wall clock at lesson start. Active LESSON time is separate: count visible, unpaused lesson instructions, reading, listening, silent thinking, typing/speaking, constructing responses and feedback. Exclude authentication, setup/selection, background time, explicit learner pauses and technical waiting; tag setup and the pre-lesson baseline separately. Do not infer a pause from silence, a lack of clicks or an idle keyboard. Report arrival-to-first-post-teaching-independent-message wall time and the active lesson time accrued before that result, with modality and support. Record baseline success as prior knowledge, separately from learning after teaching. The scripts' 0:00 labels are lesson-content position guides, not an end-to-end stopwatch; the 8–10-minute duration is a content estimate awaiting measurement.

A contextually clear Nです answer is grammatical sentence construction in its own right. A first unseen N+です combination earns independent meaningful sentence credit when produced without support. Score deictic/topic evidence separately as demonstrated, untested, or partial only when the task explicitly elicited that frame; never make an overt topic a condition of grammatical completeness.

Independent construction is response to a meaning/situation prompt with no answer model, aligned translation, ordered tiles or answer-bearing hint, using taught ingredients in a reserved combination. Report typed_native_script, typed_romaji, assessed_speech and self_report independently. Native-script typing can use an IME, explicitly logged; handwriting is not assessed here. Romaji construction supports grammar evidence only. A native-script meaning task without romaji supports limited reading evidence; transcript matching does not assess pronunciation. Speech requires recording plus a qualified or validated assessor, otherwise record “spoken practice, unassessed.” Accessibility settings are not mistakes; support availability remains consistent while its use is visible in the evidence.

Eight-task formative check after L3: F1 original U1 this/bread; F2 original U2 this/not-tea then identify bread; F3 original U3 coffee+tea request; F4 attention+thanks phrase retrieval; F5 fresh question “Is that coffee?” → それはコーヒーですか; F6 fresh negative “That isn't bread” → それはパンじゃないです; F7 native-script only これは水ですか → English meaning; F8 audio-only それはコーヒーです → identify reference and item on a new two-person picture. F1–3 use original first-attempt evidence rather than pretending repeats are fresh; F7 repeats S3 and is labeled reading retrieval; F8 uses a known combination in a new modality and is labeled listening retrieval. Audio F8 is pending reviewed production. This honest mix distinguishes construction, recognition, listening and phrase retrieval.

Reserved 24-hour pair H24a: water+tea request, 水とお茶をください, with either order accepted. Reserved seven-day pair H7a: coffee+bread request, コーヒーとパンをください. Neither unordered pair occurs in teaching or repair above. Additional 24-hour H24b “Is that bread?” → それはパンですか and H24c “This isn't water” → これは水じゃないです. Additional seven-day H7b “Is this tea?” → これはお茶ですか and H7c “That isn't coffee” → それはコーヒーじゃないです. Retire any tuple exposed by free practice or hints before its scheduled first assessment. A new picture alone cannot turn a seen sentence combination into unseen construction. These are curriculum intervals, not scheduled automation tasks.

Score construction 0–2 intended meaning (person/reference, item, polarity and speech act) and 0–2 target form (appropriate topic/object marker, order and polite ending). Contextually clear noun sentences such as パンです can get full meaning, grammatical-construction and independence credit; score an unelicited deictic/topic target as untested. Only an explicitly elicited full frame can receive a partial frame score when omitted. Never label these sentences incomplete or globally wrong. Record none/word/pattern/reveal support, first attempt, subsequent repair and next different prompt. Phrase retrieval, script recognition and audio comprehension each have their own score and denominators. Speech quality is separately rated for intelligibility and the taught sound feature; a learner's self-rating stays self-report. Proposed readiness: four of five construction items F1–3/F5–6 convey the intended message independently, including one question, one correction and one request; otherwise review the weak purpose with a different already-taught prompt. This is formative placement, not CEFR/JLPT certification. Validate the rule in a learner pilot and compare unaided 24-hour/seven-day retention without hiding missing responses.

Use the existing unnamed fox: neutral for presentation; thinking while the learner considers; coaching only when help is requested; retry for precise correction; celebration for independent success. Static composition, quiet by default, no idle animation competing with script. Exact optional dialogue: “Would you like one word, the pattern, or an example?” After a reveal: “You've seen this example. Let's try a different choice.” Help logs include lesson/step/prompt ID, tuple, visible support, response modality, first response, revealed content, scorer status and next prompt ID. Any answer shown by the fox counts as exposure. The animal's visual states are known; a personal name is not verified.

A bounded known-language drawer may say, if English was explicitly selected: “Japanese marks the topic after the word, and finishes this noun statement with です. English usually puts is before the name of the thing.” Do not describe this as the whole grammar of either language. No other teaching-language pack is implied by translating this English sentence.


---

# Kannada (kn): audited content and proposed opening curriculum

Design only. AI-drafted; awaiting a qualified Kannada teacher’s review of naturalness, speech variety, script, pronunciation, accepted variants, and assessment. No human review or improved learning outcome is claimed. English is the provisional explanation language because the inspected course explains in English; the learner’s strongest explanation language still needs confirmation. Optional Hindi/Telugu comparisons do not constitute available teaching-language packs.

## Evidence and coverage

Inspected source: /workspace/sites/lingomitra, clean version2 commit ff6711c; generated/catalog.json and server/courses/kannada/lesson01.md–lesson30.md. All 30 catalog bodies match their Markdown source after trimming edge whitespace. Existing fields are id, lessonId, languageCode, title, content, orderIndex. All files received structural/exercise/dependency inventory; 01–03, 05, 10, 15 (middle), and 30 (final) were read completely. Other lessons were systematically scanned rather than linguistically certified. This appendix does not independently inspect the live app.

| Stable legacy ID | Current order | Structural subject |
|---|---:|---|
| kn-lesson01 | 1 | Pronouns, SOV, nonpast endings, 20 verbs |
| kn-lesson02 | 2 | Vowels, consonant series, pronunciation |
| kn-lesson03 | 3 | Numbers to crore; clock time |
| kn-lesson04 | 4 | Being, existence, introductions |
| kn-lesson05 | 5 | Greetings, politeness, repair phrases |
| kn-lesson06 | 6 | Ability, permission, obligation |
| kn-lesson07 | 7 | Five approaches to future reference |
| kn-lesson08 | 8 | Information questions |
| kn-lesson09 | 9 | Yes/no questions; polite requests |
| kn-lesson10 | 10 | Past conjugations and negatives |
| kn-lesson11 | 11 | Possession and genitive |
| kn-lesson12 | 12 | Adjectives and comparison |
| kn-lesson13 | 13 | Coordination, subordinate/participial clauses |
| kn-lesson14 | 14 | Accusative and dative |
| kn-lesson15 | 15 | Body parts and health |
| kn-lesson16 | 16 | Food and dining |
| kn-lesson17 | 17 | Shopping and money |
| kn-lesson18 | 18 | Travel and transportation |
| kn-lesson19 | 19 | Weather and seasons |
| kn-lesson20 | 20 | Family relationships |
| kn-lesson21 | 21 | Six conversation settings |
| kn-lesson22 | 22 | Hobbies and interests |
| kn-lesson23 | 23 | Education |
| kn-lesson24 | 24 | Work and professions |
| kn-lesson25 | 25 | Technology |
| kn-lesson26 | 26 | Cultural terms and festivals |
| kn-lesson27 | 27 | Conjunct verbs and complex clauses |
| kn-lesson28 | 28 | Reading/listening strategies, colloquial forms |
| kn-lesson29 | 29 | Idioms and proverbs |
| kn-lesson30 | 30 | Six practical phrasebook scenarios |

The 30 files contain 39,787 whitespace-delimited tokens, with 957–2,192 per file; L1–3 contain 1,414 / 1,298 / 1,123. Counts describe source size, not time-on-task. Twenty-nine have tables, 30 have “Quick Practice,” and 28 have answer sections. L2’s pronunciation list and L21’s self-created conversations lack an answer section. Practice introductions identify 23 translation sets; the others are sound repetition, numbers, greeting situations, dialogue creation, reading/context work, idiom matching, and phrase choice. Thus situational content exists, especially 21 and 30, but most practice is still English-to-Kannada production followed by displayed answers. There are no explicit prerequisite fields, audio embeds/media file references, or external Markdown links in these course files. Audio described in prose does not prove audio delivery or assessed listening; separate app services must be verified separately.

## Evidence-to-change audit

Effort is a content planning estimate: S = 0.5–1 editor day; M = 2–4 teacher/editor days; L = 5–8 days plus media/product dependencies. P0 addresses a confirmed teaching defect; P1 establishes a dependable learning loop; P2 extends the course. Learning effects remain hypotheses until tested.

| Audit ID / status / disposition | Observed → problem | Proposed change; rationale and limits | Effort / dependency / success / priority |
|---|---|---|---|
| KN-A01 / observed structure; impact hypothesis / split and resequence | L1 introduces nine pronoun rows, seven conjugation rows, 20 listed verbs, and five translations. Useful greetings arrive at 05; dative case is a dedicated topic at 14 after earlier dative expressions. | Begin with drink needs/refusal and a polite offer. Teach nanage/nimage as meaningful chunks before general case paradigms. Retain selected SOV action examples later. Smaller scope is expected to help coordination but is not demonstrated here. | L; teacher/script author; novices create two unshown drink messages with support tracked; P1. |
| KN-A02 / verified inconsistency / correct | L2 labels long ಏ as ai while ಐ is also ai; long ಓ and long ಊ both receive oo across the course. Its “leg” example is ಕಾಲಿ, while L15 correctly lists ಕಾಲು. These cues cannot consistently recover the intended word or sound. | Establish separate ā/ī/ū/ē/ō and taught ASCII equivalents; replace unverified contrast pairs. Use reviewed speech and script together. Existing informal spellings can remain input aliases for meaning tasks, never the pronunciation specification. | M plus speaker review; zero conflicting canonical vowel mappings and every contrast pair lexically checked; P0. |
| KN-A03 / verified source mismatch; lexical review / correct or quarantine | L1’s take row pairs ತೆಗೆದುಕೊ with tegedukoLLu; its finish row gives ಕೊನೆ/kone as a verb. The base-form discussion calls dictionary roots infinitives, and compares -utt- with English -ing. | Review each root/spelling/meaning and label dictionary base versus infinitive accurately. Explain the selected nonpast construction in its context; do not imply that every -utt- form is exclusively progressive or that every verb follows one mechanical rule. Quarantine doubtful rows pending teacher review. | M; Kannada morphology/lexicon reviewer; script and transliteration agree and sampled learners do not infer “all -utt- = happening now”; P0 for mismatches, P1 for framing. |
| KN-A04 / observed dependency problem / scaffold | L10 moves among three full past paradigms, irregular forms, negatives, and question types; some exercise vocabulary is supplied only in its answers. L15 combines a large anatomy list, health descriptions, treatment instructions, and new forms. | Give a communicative task only the vocabulary/forms it needs; preregister dependencies. Keep anatomy/reference lists optional. Stage past reference and negative formation separately before a combined assessment. | L; taught-item registry; every scored prompt uses explicitly introduced forms/words and an unseen combination; P1. |
| KN-A05 / verified corruption and speaker-role mismatch / correct | L30 contains Japanese ニ inside ಬನ್ニ. Its departing guest says ಬಂದಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು with the English gloss “Thank you for having me,” although the phrase thanks someone for coming. | Correct script corruption and review the role of every speaker in dialogues; use a reviewed hospitality-thanks expression for a departing guest. The later line about hospitality suggests the intended meaning. | S–M; Unicode check plus teacher; no foreign-script corruption and correct speaker roles; P0. |
| KN-A06 / observed register mixture; naturalness review / label and revise | Formal written paradigms dominate 01/10; colloquial speech receives explicit attention at 28. L5 labels ಹೇಗಿದೆ as general “How are you?” despite other person-specific forms. L30 presents broad bargaining, gesture, and hospitality advice as rules. | Choose a reviewed, widely intelligible spoken model with standard-script display, label written/colloquial alternatives, and review person agreement in greetings. Ground social advice in a specific setting; avoid universal behavioral instructions or arbitrary bargaining percentages. | L; Kannada teacher familiar with target region; reviewers identify register and context for every model; P1. |
| KN-A07 / observed measurement gap / preserve practice, add transfer | L21 invites self-created dialogue; L30 asks learners to choose useful phrases with answers. These support rehearsal but do not document independent spoken interaction or delayed recall. | Retain scenario resources and add unshown tasks with a bounded help policy and separate typing/speech measures. Replace unconditional completion-to-confidence language with recorded accomplishments. | M plus evidence model; no typing/self-report counted as assessed speech; protected 24-hour/7-day checks; P1. |
| KN-A08 / observed access gap / integrate script progression | L2 promises transliteration indefinitely but supplies an entire sound inventory rather than a measured decoding path. No file-level IME or supported fading plan is present. | Keep an accessible transliteration route, but attach a small script accomplishment to each lesson and fade support for known material on demonstrated reading. | L; fonts, IME, reviewed audio; learners enter taught chunks and recover support without losing a response; P1. |

The University of Pennsylvania’s Kannada materials identify the language as Dravidian and explicitly teach dative-stative need/liking, polite questions, existence, and location. They support selecting those structures for an opening track, not this draft’s pacing or efficacy. Their older web pages have broken legacy-font Kannada, so their Roman text is evidence for the cited grammatical patterns, not a Unicode spelling source. [Penn Kannada course overview](https://ccat.sas.upenn.edu/plc/kannada/), [need/refusal patterns](https://ccat.sas.upenn.edu/plc/kannada/lesson6.html), [location and dative constructions](https://ccat.sas.upenn.edu/plc/kannada/lesson3.html).

## Teaching contract, sound, and script

Kannada starts at a refreshment table: choose or decline a drink, ask another person, make a courteous request, then locate an item. Kannada is Dravidian; its useful opening distinctions include dative experiencers, predicate-final order, politeness, and attached case endings. Do not import Hindi’s adjective-gender lesson as its organizing principle. The need word in this chosen construction does not change with the requester’s gender. Later personal action verbs have their own agreements.

English explanations are required in this draft. Optional bridge only if the learner says they know it: Hindi’s mujhe…chahiye can make “to me … needed” conceptually familiar; it does not supply Kannada words or conjugations. Telugu also has dative experiencer constructions and broad verb-final patterns, but its case forms and verbs must not be substituted into Kannada. Shared script ancestry/visual similarities do not guarantee decoding, and neither Telugu nor Hindi knowledge is a prerequisite.

Canonical transliteration uses ā ī ū ē ō and ṭ ḍ ṇ ḷ; accessible ASCII uses aa ii uu ee oo and T D N L respectively. L1’s words include ನೀರು nīru, ಟೀ ṭī, ಹಾಲು hālu, ಕಾಫಿ kāfi, ಬೇಕು bēku, ಬೇಡ bēḍa, ಬೇಕಾ bēkā. Use niiru/Tii/haalu/kaafi/beeku/beeDa/beekaa as taught input aliases. The existing neeru spelling may be a reviewed meaning-only alias for ನೀರು; it must not redefine ee as both long i and long e in the sound key. Do not infer pronunciation mastery from ASCII choices. Explain that borrowed ಕಾಫಿ may use an f sound; broad aspirated-consonant claims need a spoken-register review.

Teacher-recorded sound targets should include the long vowel in ನೀರು, ಹಾಲು, and ಬೇಕು and the retroflex consonant in ಬೇಡ. L3 adds gemination in -ಲ್ಲಿ and a dental/retroflex listening contrast only with validated words. Consonant length is not decorative doubling. Unlike Hindi, do not apply Hindi schwa deletion to Kannada or remove Kannada final vowels mechanically. Show standard writing alongside a separately reviewed conversational recording; do not manufacture “spoken” spellings by stripping endings.

L1 offers script, transliteration, and optional audio without requiring an alphabet test or microphone. L2 identifies ಕೊಡಿ and the vowel signs in known drink words; practice one already-known word in the learner’s chosen IME. Keep its composition preview intact until submission. L3 shows ಮನೆ → ಮನೆಯಲ್ಲಿ and ಅಂಗಡಿ → ಅಂಗಡಿಯಲ್ಲಿ as script chunks. L4–6 make already-read chunks script-first with on-demand transliteration; L7–10 expand reading only after successful unsupported recognition. A request for transliteration is reading assistance, not a communicative failure. The learner can retain the transliteration composition path; never silently recategorize it as Kannada-script literacy.

## Fully scripted opening lesson 1: “A drink for you?”

Stable ID kn-drink-choice-001; version 0.1.0; proposed order 1. Legacy provenance: kn-lesson05, 06, 09, 16, 30. Outcome: say which drink one wants/declines and politely ask whether another person wants a drink. Prerequisites: none beyond understanding the English task and choosing an input mode. Designed for 8–10 minutes; extra support is allowed to extend the session.

Complete L1 inventory: ನಮಸ್ಕಾರ namaskaara, greeting; ನನಗೆ nanage, to/for me; ನಿಮಗೆ nimage, to/for you politely; ನೀರು niiru, water; ಟೀ Tii, tea; ಕಾಫಿ kaafi, coffee; ಹಾಲು haalu, milk; ಬೇಕು beeku, wanted/needed; ಬೇಡ beeDa, not wanted in this context; ಬೇಕಾ beekaa, is it wanted? Do not add a general “I am” or “I want” conjugation paradigm.

**0:00–0:45, welcome.** Fox neutral; teacher: “You are at a refreshment table. You will say which drink you want, decline one, and offer a drink to someone else. Type Kannada or transliteration; speaking is optional. ನಮಸ್ಕಾರ — namaskaara — is a greeting.” Prompt: “Greet the host.” Expected ನಮಸ್ಕಾರ / namaskaara. This is imitation. Correct feedback: “You greeted the host.”

**0:45–2:15, explain and model.** Display each drink as a word with English meaning and optional reviewed audio; avoid complete-sentence labels. Teacher: “ನನಗೆ means to me or for me. ಬೇಕು says that something is wanted or needed. Put the drink before that final word: ನನಗೆ ನೀರು ಬೇಕು. — nanage niiru beeku — I want water.” Teacher: “ಬೇಡ means not wanted in this drink situation. Replace the final need word to decline. It does not tell us the speaker’s gender.” Recognition prompt: “Which final word accepts a drink: ಬೇಕು or ಬೇಡ?” Expected ಬೇಕು. If wrong: “ಬೇಕು expresses a need or wish; ಬೇಡ declines.” This supported discrimination is not novel composition.

**2:15–3:20, polite offer.** Teacher: “ನಿಮಗೆ is to you or for you politely. With the drink question we are learning, ಬೇಕು becomes ಬೇಕಾ. This is a change for this word, not a rule to attach aa to every Kannada verb. Listen: ನಿಮಗೆ ಕಾಫಿ ಬೇಕಾ? — nimage kaafi beekaa? — Would you like coffee?” Prompt: “Is the speaker asking about their own drink, or the other person’s drink?” Expected other person. If wrong: “ನಿಮಗೆ points to the person being addressed; ನನಗೆ points to the speaker.”

**3:20–5:25, guided G1.** Close models; prompt: “Tell the host that you want tea for yourself. Make it clear who wants it.” Expected ನನಗೆ ಟೀ ಬೇಕು. / nanage Tii beeku. Complete first-session branches:

| Response state | Exact feedback and requested hints | Next task |
|---|---|---|
| Correct | Fox celebration after submission: “You said that you want tea and made the requester clear.” | G2. |
| Partial relative to the explicit task, e.g. ಟೀ ಬೇಕು | Fox coaching: “That is a natural short request for tea. To make the requester explicit, add the word for for me.” Requested hint: “ನನಗೆ.” | Repair, then G2; meaning credit is preserved and support recorded. |
| Misconception, e.g. ನನಗೆ ಟೀ ಬೇಡ | Fox coaching: “That declines tea. Here you want it. Which final word expresses wanted?” Requested hint: “Use ಬೇಕು.” | Repair, then G2; no independence credit from correction. |
| Stuck | Fox thinking: “Think of the person, the drink, then whether it is wanted.” Next requested hint: “Begin with ನನಗೆ. The drink is ಟೀ.” Final reveal: “ನನಗೆ ಟೀ ಬೇಕು. — nanage Tii beeku.” Fox retry: “Read that once. Now try a different message.” | G2, never repeated copying for mastery credit. |

If the learner writes English-like order nanage beeku Tii, teacher: “The idea is understandable. Practise the neutral order with the drink before ಬೇಕು.” This is word-order coaching, not a claim that Kannada has no contextual reordering. A response that cannot be confidently interpreted is “needs review,” not automatically wrong.

**5:25–6:15, different G2.** Prompt: “Politely offer water to the person beside you.” Expected ನಿಮಗೆ ನೀರು ಬೇಕಾ? / nimage niiru beekaa. Correct: “You changed the requester and made a question.” Partial/misconception: “You are asking about the other person this time.” Then “Use ನಿಮಗೆ and the question form ಬೇಕಾ.” Final reveal only this sentence. After a reveal continue to I1; that revelation does not turn G2 into independent evidence.

**6:15–8:35, independent I1/I2.** Teacher: “Now create two new messages. No word list or sentence frame will be shown. You may ask for help; that changes the attempt to supported practice.” All earlier words, labels, examples, audio models, and hints are closed. The fox stays static during composing.

- I1: “You are offered coffee, but you do not want it. Tell the host which drink you are declining.” Expected ನನಗೆ ಕಾಫಿ ಬೇಡ. / nanage kaafi beeDa. Accept ಕಾಫಿ ಬೇಡ. / kaafi beeDa as a natural complete answer to this situation. Bare ಬೇಡ is a valid refusal but does not establish the explicitly requested drink reference; distinguish those facts.
- I2: “You are helping the host serve drinks. Politely ask the next guest whether they would like tea.” Expected ನಿಮಗೆ ಟೀ ಬೇಕಾ? / nimage Tii beekaa. ಟೀ ಬೇಕಾ? also communicates a natural offer when the addressee is clear; note that it does not directly demonstrate retrieval of ನಿಮಗೆ.

These complete combinations are absent from every earlier model and hint, including recovery branches. Do not reveal either answer until both first attempts have been saved. Correct feedback: “You identified the drink you declined and made an offer.” Partial success identifies the achieved function and schedules the other for practice. Avoid calling this general Kannada conversation ability.

**8:35–9:30, script and exit.** Teacher: “Find the written word ಬೇಕು among the words you learned. We are practising reading it, separately from making a message.” Provide audio/transliteration if requested; log support. Teacher: “Today you chose a drink and asked about someone else’s choice. Different prompts later will show what you remember.”

Optional exact English assistance dialogue: learner, “Does the ending change if a woman wants tea?” Fox, “In this need pattern, ಬೇಕು stays the same. The word ನನಗೆ tells us whose need it is.” Learner, “Why not put want before tea?” Fox, “For the neutral pattern we are practising, the drink comes before the need word.” Learner, “Can I type neeru?” Fox, “That common spelling can be accepted for the water word in a meaning task. Our sound guide uses niiru so long i and long e stay distinct.” No assistant supplies a protected complete answer. All help events remain visible in the evidence record.

## Fully scripted opening lesson 2: “Ask for a little”

Stable ID kn-small-request-002; proposed order 2. Prerequisites: L1 drink meanings and the distinction between wanted/not wanted. Outcome: courteously request a small amount of a drink and revise an offer. New vocabulary: ಕೊಡಿ koḍi / koDi, give, as a respectful request; ಸ್ವಲ್ಪ svalpa, a little/some; ದಯವಿಟ್ಟು dayaviṭṭu / dayaviTTu, please. All drinks remain the L1 set; no new beverage or number is required.

**Retrieve, 0:00–1:00.** Teacher: “Tell the host that you want water.” Expected ನನಗೆ ನೀರು ಬೇಕು. Then: “Which word declines an offered item?” Expected ಬೇಡ. After a failed retrieval, use the L1 explanation or show that known sentence and record support; do not substitute a new person pronoun.

**Explain/model, 1:00–3:00.** Teacher: “ಬೇಕು states what you want. ಕೊಡಿ asks the other person to give it to you. ಕೊಡಿ is already a respectful request form; it does not change with your gender. ನನಗೆ ನೀರು ಕೊಡಿ. — nanage niiru koDi — Please give me water.” Teacher: “ಸ್ವಲ್ಪ means a little or some. Put it before the drink. ಸ್ವಲ್ಪ ಹಾಲು ಕೊಡಿ. — svalpa haalu koDi — Please give a little milk. ದಯವಿಟ್ಟು means please and can make the request more explicit; it can sound more formal. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಹಾಲು ಕೊಡಿ.” Teacher: “You can leave out ನನಗೆ when it is clear that you are requesting for yourself. We will say when a task requires the person to be explicit.”

Meaning prompt: “Which model asks someone to hand over a drink, rather than only naming what is wanted?” Expected the one with ಕೊಡಿ. If confused: “The request asks the other person to act. Point to ಕೊಡಿ.” Next different recognition task: “Does ಸ್ವಲ್ಪ name the drink or the amount?” Expected amount.

**Guided, 3:00–5:30.** Prompt: “Ask the host to give you coffee; make the requester explicit.” Expected ನನಗೆ ಕಾಫಿ ಕೊಡಿ. Likely partial ಕಾಫಿ ಕೊಡಿ: “That is a natural request. Add the requester because this task asks you to make it explicit.” Likely misconception ನನಗೆ ಕಾಫಿ ಬೇಕು: “That names your wish. Use the respectful give-request form to ask for the action.” Hints: “Person, drink, respectful request”; “Use ನನಗೆ and ಕೊಡಿ”; reveal only ನನಗೆ ಕಾಫಿ ಕೊಡಿ. Then a different task: “Ask for a small amount of water.” Expected ಸ್ವಲ್ಪ ನೀರು ಕೊಡಿ. Hints: “Say how much before the drink”; “ಸ್ವಲ್ಪ comes before ನೀರು”; reveal only this sentence. Correct feedback: “You used the request form and specified a small amount.”

**Independent, 5:30–8:00.** Close all language support. I1: “Milk has been offered, but you would prefer a little tea. Say which drink you decline, then ask for the smaller amount of tea.” Expected ಹಾಲು ಬೇಡ. ಸ್ವಲ್ಪ ಟೀ ಕೊಡಿ. / haalu beeDa. svalpa Tii koDi. I2: “The host is pouring a full coffee. Ask for just a little coffee.” Expected ಸ್ವಲ್ಪ ಕಾಫಿ ಕೊಡಿ. / svalpa kaafi koDi. No complete I1/I2 sentence occurs in models/hints. Accept optional ನನಗೆ and/or ದಯವಿಟ್ಟು if the message and structure work; do not demand a literal translation of English please. A bare ಸ್ವಲ್ಪ may be pragmatically adequate while someone pours, but does not demonstrate a composed drink request; report that limitation without calling it ungrammatical. Assess the explicitly requested task evidence consistently.

**Review/exit, 8:00–9:00.** Teacher: “Read ಕೊಡಿ in your request. Notice that its written form is different from ಬೇಕು. Choose the form for asking someone to give.” Learner recognizes/enters the known chunk using the IME if desired. Teacher: “A refusal plus a new request lets the host adjust.” Reserve a later prompt, “Decline water by name, then request a little milk” → ನೀರು ಬೇಡ. ಸ್ವಲ್ಪ ಹಾಲು ಕೊಡಿ. This is a new combined exchange; its individual request sentence was modelled, so report it as combined retrieval/repair, not an entirely unseen sentence-form test.

## Fully scripted opening lesson 3: “Where is the drink?”

Stable ID kn-find-drink-003; proposed order 3. Prerequisites: L1 drink words; L2 request if using its optional dialogue extension. Outcome: ask where a drink is and identify whether it is at home or in the shop. New vocabulary/forms: ಮನೆ mane, house/home; ಅಂಗಡಿ aṅgaḍi / angaDi, shop; ಮನೆಯಲ್ಲಿ maneyalli, at home/in the house; ಅಂಗಡಿಯಲ್ಲಿ angaḍiyalli, in/at the shop; ಇದೆ ide, is/is present for the nonhuman items here; ಎಲ್ಲಿ elli, where; ಎಲ್ಲಿದೆ ellide, where is it. Teach these joined forms explicitly before requesting production.

**Retrieve, 0:00–1:00.** Teacher: “Ask for a little water.” Expected ಸ್ವಲ್ಪ ನೀರು ಕೊಡಿ. Feedback or a supported recall detour uses only the L2 material. Then point to two pictures labelled in English “home” and “shop”; they are teaching materials, not independent-assessment cues.

**Explain/model, 1:00–3:30.** Teacher: “ಮನೆ is home; ಅಂಗಡಿ is shop. Kannada can attach the place relation to the place word. Learn these two complete forms: ಮನೆಯಲ್ಲಿ — at home; ಅಂಗಡಿಯಲ್ಲಿ — in the shop. In these examples a y sound joins the word to -alli. Other words can take different joining forms; do not attach this spelling to every noun.” Teacher: “ಇದೆ tells us that the drink is there. ನೀರು ಮನೆಯಲ್ಲಿ ಇದೆ. — niiru maneyalli ide — The water is at home. You may hear and write the ending joined: ಮನೆಯಲ್ಲಿದೆ, maneyallide.” Teacher: “ಎಲ್ಲಿ asks where. ಎಲ್ಲಿ with ಇದೆ gives ಎಲ್ಲಿದೆ. ಕಾಫಿ ಎಲ್ಲಿದೆ? — kaafi ellide? — Where is the coffee? These are locations of drinks. Saying I am here requires another person form we will learn later.”

Meaning prompt: “Does ಮನೆಯಲ್ಲಿ mean at home or going home?” Expected at home. If wrong: “This ending locates something. We have not learned a destination ending yet.” Next recognition prompt: “Does ಎಲ್ಲಿದೆ tell us where something is, or ask for its location?” Expected asks. No new Kannada motion form appears in the correction.

**Guided, 3:30–5:30.** Prompt: “Tell the host that the tea is in the shop.” Expected ಟೀ ಅಂಗಡಿಯಲ್ಲಿ ಇದೆ. / Tii angaDiyalli ide; joined ಅಂಗಡಿಯಲ್ಲಿದೆ also accepted. Likely bare ಟೀ ಅಂಗಡಿ ಇದೆ: “You named both things. Use the form meaning in the shop.” Hints: “The location word needs its attached relation”; “Use ಅಂಗಡಿಯಲ್ಲಿ”; reveal only this target. If the learner writes nanage Tii…: “You are locating the tea here, not naming who wants it.” Then a different task: “Ask where the milk is.” Expected ಹಾಲು ಎಲ್ಲಿದೆ? Hints: “You need the where-is question”; “Use ಎಲ್ಲಿದೆ”; reveal only this question. Correct: “You asked for a location.”

**Independent, 5:30–8:00.** I1: “The coffee is at home. Send that information to the host.” Expected ಕಾಫಿ ಮನೆಯಲ್ಲಿ ಇದೆ. / kaafi maneyalli ide; joined ಮನೆಯಲ್ಲಿದೆ accepted. I2: “The host cannot find the water. Ask where it is.” Expected ನೀರು ಎಲ್ಲಿದೆ? / niiru ellide. Both use taught elements in unshown complete messages without a bilingual map, noun labels, transliteration, or sentence frame. Optional follow-up after scoring, as rehearsal: host says ಟೀ ಅಂಗಡಿಯಲ್ಲಿ ಇದೆ.; learner requests ಸ್ವಲ್ಪ ಟೀ ಕೊಡಿ. Both were introduced by this point; this is a short meaningful exchange, not independent evidence merely because there are two turns.

**Review/exit, 8:00–9:30.** Teacher: “Notice the doubled consonant in -ಲ್ಲಿ. Keep the locative form together as you read. Choosing an ending and typing its script are related but separate skills.” Supported task: identify the added portion in ಮನೆ → ಮನೆಯಲ್ಲಿ, then enter a known chunk. Later reserve: “Tell the host the milk is in the shop” → ಹಾಲು ಅಂಗಡಿಯಲ್ಲಿ ಇದೆ. Do not expose this complete sentence in L3 corrections. Give human-location agreement, other locative joining forms, and motion/destination their own lessons instead of prompting them early.

## Ten-lesson route and legacy disposition

Stable new IDs are independent of display order. Retain all kn-lesson01–30 IDs, URLs, and old progress; map useful sections to the following outcomes without treating old completion as evidence of the new assessments. None of this mapping has been implemented.

| New order / stable ID | Communicative result and dependency | Legacy candidates and disposition |
|---|---|---|
| 1 kn-drink-choice-001 | Choose/decline/offer a drink; none | 05,06,09,16,30; rewrite/narrow |
| 2 kn-small-request-002 | Ask for a small amount; 1 | 09,16,30; respectful request and quantity |
| 3 kn-find-drink-003 | Ask/tell an item location; 1 | 04,08,18; explicitly teach locative joins |
| 4 kn-drink-preference-004 | Distinguish liking from wanting with ಇಷ್ಟ; 1 | 16,22; retain dative experiencer, new meaning |
| 5 kn-person-location-005 | Say where I am; ask politely; 3 | 01,04,05; introduce human ಇರು forms and register |
| 6 kn-go-to-shop-006 | State a destination; 3,5 | 07,08,14,18; -ಗೆ joins and one reviewed nonpast pattern |
| 7 kn-buy-two-007 | Request one/two/three items; 2 | 03,17; small number set and contextual counting |
| 8 kn-clarify-message-008 | Ask for repetition/slower speech; 2,5 | 05,09,21; rehearsed repair chunks |
| 9 kn-yesterday-trip-009 | Report one completed trip; 6 | 10,18; limited past forms before full paradigms |
| 10 kn-host-visit-check-010 | Offer, request, locate, clarify; 1–9 | 21,30; protected role tasks with individual evidence |

The following keyed table specifies ingredients, retrieval, independent evidence, and sequence logic for every row. Expected Kannada is instructor-only. For L4–10, the future author must keep these complete targets out of demonstrations and recovery branches; the table does not claim those later lessons are fully scripted.

| Order | Introduce | Reuse | Protected independent task → likely response | Why here |
|---|---|---|---|---|
| 1 | Greeting; ನನಗೆ/ನಿಮಗೆ; four drink words; ಬೇಕು/ಬೇಡ/ಬೇಕಾ | None | “You decline the offered coffee. Say which drink you decline.” → ನನಗೆ ಕಾಫಿ ಬೇಡ. | A useful choice exposes the dative experiencer and final predicate without a conjugation survey. |
| 2 | ಕೊಡಿ, ಸ್ವಲ್ಪ, ದಯವಿಟ್ಟು | L1 drinks, refusal, explicit/implicit requester | “Decline milk and request a little tea.” → ಹಾಲು ಬೇಡ. ಸ್ವಲ್ಪ ಟೀ ಕೊಡಿ. | Adds a courteous action request to an established need, with a small meaningful quantity. |
| 3 | ಮನೆ/ಅಂಗಡಿ; ಮನೆಯಲ್ಲಿ/ಅಂಗಡಿಯಲ್ಲಿ; ಇದೆ, ಎಲ್ಲಿ/ಎಲ್ಲಿದೆ | Drink words; predicate-final order | “The host cannot find the water. Ask where it is.” → ನೀರು ಎಲ್ಲಿದೆ? | Teaches two complete locative joins before expecting general case construction. |
| 4 | ಇಷ್ಟ, ಇಷ್ಟ ಇಲ್ಲ, ಇಷ್ಟವಾ; explain liking versus wanting | ನನಗೆ/ನಿಮಗೆ; four drinks; respectful questions | “Politely ask whether the guest likes milk.” → ನಿಮಗೆ ಹಾಲು ಇಷ್ಟವಾ? | Reuses the experiencer while contrasting preference with a current request. Model coffee liking and a tea question; reserve milk. |
| 5 | ನಾನು/ನೀವು; ಇದ್ದೇನೆ/ಇದ್ದೀರಿ/ಇದ್ದೀರಾ; ಇಲ್ಲಿ | Home/shop locatives; polite addressee concept | “Politely check whether the guest is at the shop.” → ನೀವು ಅಂಗಡಿಯಲ್ಲಿ ಇದ್ದೀರಾ? | Separates human-location agreement from L3’s nonhuman ಇದೆ. Choose reviewed careful-spoken models and label colloquial alternatives. |
| 6 | ಮನೆಗೆ/ಅಂಗಡಿಗೆ; ನಾಳೆ; ಹೋಗುತ್ತೇನೆ as one reviewed nonpast form | ನಾನು; home/shop meanings; location versus destination | “Say you will go to the shop tomorrow.” → ನಾನು ನಾಳೆ ಅಂಗಡಿಗೆ ಹೋಗುತ್ತೇನೆ. | Destination comes after location; teach the actual joined form rather than generalizing -ಲ್ಲಿ to motion. Model home as the destination. |
| 7 | ಒಂದು/ಎರಡು/ಮೂರು; ಕಪ್ as the selected counting unit | Drinks; ಕೊಡಿ; optional ದಯವಿಟ್ಟು | “Request three cups of coffee.” → ಮೂರು ಕಪ್ ಕಾಫಿ ಕೊಡಿ. | A small count set serves an existing request. Teach the unit’s use explicitly; do not require untaught item plurals or numeral sandhi. |
| 8 | ಇನ್ನೊಮ್ಮೆ, ನಿಧಾನವಾಗಿ, ಹೇಳಿ; optionally explicitly taught ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ | Polite request purpose; ದಯವಿಟ್ಟು; experiencer chunk | “Ask for the message once more, slowly.” → ಇನ್ನೊಮ್ಮೆ ನಿಧಾನವಾಗಿ ಹೇಳಿ. | Combines separately taught repeat/slow requests so later interaction has a recovery tool. |
| 9 | ನಿನ್ನೆ; ಹೋದೆ, a bounded first-person completed-trip form | ನಾನು; destination forms; contrast with ನಾಳೆ | “Say you went to the shop yesterday.” → ನಾನು ನಿನ್ನೆ ಅಂಗಡಿಗೆ ಹೋದೆ. | Introduces past reference through one known journey before three full paradigms and negatives. Model another destination. |
| 10 | No new words or forms; new roles and item locations | L1–9 need, liking, location, and clarification | “Ask if the guest likes water; tell them the milk is at home; ask for a repetition if needed.” → ನಿಮಗೆ ನೀರು ಇಷ್ಟವಾ? ಹಾಲು ಮನೆಯಲ್ಲಿ ಇದೆ. ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ. | Requires choice among meanings rather than one sentence frame. Reserve the first two full messages; the repair is contextual retrieval. |

Remaining clusters: 01/06/07/10/14 become staged verb/case modules linked to the selected spoken variety; 11/12/13/27 become possession, description, and clause modules with actual prerequisites; 15/16/17/18 become short service encounters after requests and clarification; 19/20/22/23/24/25 become interest-based extensions with bounded vocabulary; 26/29 require a teacher’s cultural/context review and cannot be a promise to “speak like a native”; 28 becomes a graded listening/reading ladder with actual licensed materials and a stated register. Keep 02/03 corrected reference resources alongside integrated practice. Rebuild 21/30 scenario practice into teacher-authored exchanges, retaining stable source attribution. No legacy cluster earns a communication badge until its model, support, transfer, and review content is validated.

## Evidence, fox behavior, and formative evaluation

Independent Kannada composition is a first submitted response to an unexposed prompt after teaching material is closed, using only taught language in a new combination. No live translation, lexical bank, answer-completing hint, or displayed morphology frame is available. Native-script typing and transliteration are distinct evidence modes. Ordinary IME character composition is allowed; a tool predicting/translating the complete message is assistance. Actual assessed speaking requires a recording and a qualified listener’s intelligibility/form review; “I said it aloud” is only self-report. Audio playback recognition, script decoding, and phrase production are separate measures. Transcription alone cannot establish vowel length, retroflexion, or gemination accuracy.

Per item, record communicative intent, requested drink/referent, need versus refusal versus question, respectful form when required, attempt count, hint/reveal level, input mode, prompt/version, and prior exposure. Give credit to naturally omitted experiencers where context permits, while recording whether explicit dative retrieval was demonstrated. Incorrect polarity is a meaning error; an ordinary orthographic alias is not automatically one. A novel valid answer absent from the expected list goes to review rather than a punitive exact-string failure.

Use the existing unnamed fox’s neutral, thinking, coaching, retry, and celebration expressions. Keep it static during response creation, mobile keyboard use, and Kannada IME composition; honour reduced motion. It responds to submitted work and requested help, never judges tentative keystrokes. A corrected/revealed answer gets coaching and a different next task. Optional English help must use the taught inventory and cannot release protected answers. Celebration reflects the specific message achieved, not a general fluency claim.

Run a formative study with 6–8 novice Kannada learners. Record strongest explanation language; prior Kannada, Hindi, or Telugu exposure; script familiarity; input preference; and audio/accessibility constraints. Include script-new participants and a few learners familiar with another Indian script; do not equate Telugu literacy with Kannada knowledge. This small study diagnoses problems, not population-level efficacy. Baseline before instruction: “Say that you want water” and “Politely offer coffee to the host,” with no feedback and an “I do not know” option. These subsequently become models and are not post-test items.

Immediate checks are I1/I2. Reserve the following complete combinations from every L1 example, hint, optional dialogue, and recovery task: at 24 hours, “Politely offer milk to a guest” → ನಿಮಗೆ ಹಾಲು ಬೇಕಾ? and “Milk has been offered; say which drink you do not want” → ನನಗೆ ಹಾಲು ಬೇಡ.; at 7 days, “Tell the host you would like coffee for yourself” → ನನಗೆ ಕಾಫಿ ಬೇಕು. and “Water has been offered; say which drink you decline” → ನನಗೆ ನೀರು ಬೇಡ. The word ಹಾಲು and its meaning were explicitly taught in L1, even though no completed milk sentence was shown. These checks therefore require no new vocabulary or form. The tea-refusal combination is deliberately excluded from the reserve because it can appear as a G1 misconception. For this L1 pilot, postpone further course exposure until the checks, or log the exposure and draw new reviewed reserves. Do not quietly reuse a revealed item as held out.

Timing uses two clocks. Arrival time starts on first product arrival and includes language selection, authentication, and setup through the first successful independent response. Active learning time includes listening, reading, composing, and silent thinking; exclude setup, selection, authentication, background time, explicit pauses and technical waits. Keep both measures; never subtract setup from the arrival result. The primary 3–5-minute first-independent-success target remains an untested hypothesis. This draft’s protected independent block currently starts around 6:15 active minutes, a visible timing risk. A quick guided response is not a replacement independent measure. Test the pacing and entry route, then shorten scope or revise the target transparently if the evidence requires it.

Secondary revision thresholds: at least 6 of 8 (or 5 of 6) learners make a protected independent message within ten active minutes; most produce both immediate meanings and distinguish need/refusal; at least 5 of 8 (or 4 of 6) produce both delayed meanings at each follow-up. Report individual attempts, support, modes, delays, and missing follow-ups. Observe polarity reversals, confusion between nanage/nimage, unnecessary person endings after ಬೇಕು, vowel-key misunderstandings, and IME interruptions. If a learner’s polite short response is wrongly marked unsuccessful, fix the task/rubric before attributing failure to learning. These secondary thresholds do not redefine the primary 3–5-minute hypothesis. All are proposed, not measured.

The companion kn_schema.json is a populated L1 example using the same keys as Hindi: exact teacher lines, vocabulary, branch destinations, variants, protected assessment pools, script policy, review schedule, and explicit AI-draft teacher-review status. It is design data only.


---

# Common schema and populated examples

The editable package contains lesson_schema.json, populated_lesson_examples.json and seven canonical_examples files. The standalone HTML embeds the complete examples in expandable sections. They are author-only design data containing protected keys.

# Complete legacy lesson inventory

All 209 source/catalog records matched. These are legacy identities, not new assessed-activity IDs. Teaching and interface language are English. Whitespace-token counts describe source size, not learning time. Exact hashes and source paths are in lesson_inventory.json.

| Target | Stable ID | Numeric ID | Order | Existing title | Whitespace tokens |
|---|---|---:|---:|---|---:|
| de | de-lesson01 | 1 | 1 | Building Your First German Sentences - Verbs, Pronouns & Pronunciation | 1839 |
| de | de-lesson02 | 2 | 2 | Decoding German Sounds - The Alphabet & Pronunciation | 1678 |
| de | de-lesson03 | 3 | 3 | Counting in German - Numbers (Zahlen) & Basic Time | 1364 |
| de | de-lesson04 | 4 | 4 | The Essentials - 'haben' (to have), 'sein' (to be) & Introducing Yourself | 1264 |
| de | de-lesson05 | 5 | 5 | Saying Hello & Goodbye - German Greetings (Grüße) | 994 |
| de | de-lesson06 | 6 | 6 | Expressing Ability, Permission & Obligation - Modal Verbs (Modalverben) | 1180 |
| de | de-lesson07 | 7 | 7 | Talking About the Future - Using 'werden' | 811 |
| de | de-lesson08 | 8 | 8 | Asking for Information - The 'W-Fragen' (Wh- Questions) | 1142 |
| de | de-lesson09 | 9 | 9 | Yes/No Questions & Making Polite Requests | 945 |
| de | de-lesson10 | 10 | 10 | Talking About the Past - The Simple Past Tense (Präteritum) | 1493 |
| de | de-lesson11 | 11 | 11 | Noun Roles & Changing Articles - Intro to German Cases (Part 1) | 1418 |
| de | de-lesson12 | 12 | 12 | Cases with 'a/an' & Possessives (Part 2) | 1408 |
| de | de-lesson13 | 13 | 13 | Prepositions & Case Control (Cases Part 3) | 1361 |
| de | de-lesson14 | 14 | 14 | Talking About the Past (Again!) - Perfekt & Plusquamperfekt | 1281 |
| de | de-lesson15 | 15 | 15 | Where's the '-ing'? Expressing Ongoing Actions | 1005 |
| de | de-lesson16 | 16 | 16 | Verb Variations - Irregular Patterns & Separable Verbs | 1329 |
| de | de-lesson17 | 17 | 17 | It's All About Me (and You, and Him...) - Personal Pronouns in Cases | 1086 |
| de | de-lesson18 | 18 | 18 | Saying "No" and "Not" - Negation with `nicht` and `kein` | 1150 |
| de | de-lesson19 | 19 | 19 | Connecting Ideas - German Conjunctions & Word Order | 1290 |
| de | de-lesson20 | 20 | 20 | Verbs That Demand Dative (Dative Verbs) | 891 |
| de | de-lesson21 | 21 | 21 | Making Comparisons - Adjective Forms (Positive, Comparative, Superlative) | 1100 |
| de | de-lesson22 | 22 | 22 | Time Flies! Asking & Telling Time in German (Uhrzeit) | 1068 |
| de | de-lesson23 | 23 | 23 | Shifting Focus - The Passive Voice (Passiv) | 1214 |
| de | de-lesson24 | 24 | 24 | Giving Commands & Instructions - The Imperative Mood | 1094 |
| de | de-lesson25 | 25 | 25 | Showing Possession - The Genitive Case (Genitiv) (Cases Part 4) | 1264 |
| de | de-lesson26 | 26 | 26 | Showing Cause & Contrast - `deshalb` & `trotzdem` | 916 |
| de | de-lesson27 | 27 | 27 | Sentences with Two Verbs - Using `zu` + Infinitiv | 1031 |
| de | de-lesson28 | 28 | 28 | Adding Detail - Relative Clauses (Relativsätze) | 1320 |
| de | de-lesson29 | 29 | 29 | Connecting Ideas in Pairs - Two-Part Connectors (Zweiteilige Konnektoren) | 1018 |
| de | de-lesson30 | 30 | 30 | Describing Nouns Directly - Adjective Endings Part 1 (No Article) | 909 |
| de | de-lesson31 | 31 | 31 | Adjective Endings with Articles (Declension Part 2) | 1161 |
| de | de-lesson32 | 32 | 32 | Vague References - Indefinite Pronouns (`man`, `jemand`, `nichts`...) | 977 |
| de | de-lesson33 | 33 | 33 | Expanding Connections - More Subordinating Conjunctions | 1235 |
| de | de-lesson34 | 34 | 34 | Actions Bouncing Back - Reflexive Verbs (Reflexive Verben) | 1212 |
| de | de-lesson35 | 35 | 35 | "Would," "Could," "Should" - The Subjunctive II (Konjunktiv II) | 1150 |
| de | de-lesson36 | 36 | 36 | The Versatile Verb 'lassen' (Let, Leave, Have Done) | 1004 |
| de | de-lesson37 | 37 | 37 | Fixed Pairs - Verbs with Prepositions & Noun-Verb Combinations | 1009 |
| de | de-lesson38 | 38 | 38 | Advanced Forms - Participle I, Future Perfect & Nominalization | 1141 |
| de | de-lesson39 | 39 | 39 | Ordering Information - The TeKaMoLo Guideline | 1019 |
| es | es-lesson01 | 40 | 1 | Building Your First Spanish Sentences - Verbs, Pronouns & Pronunciation | 1991 |
| es | es-lesson02 | 41 | 2 | Decoding Spanish Sounds - The Alphabet & Pronunciation | 1413 |
| es | es-lesson03 | 42 | 3 | Counting in Spanish - Numbers (Números) & Basic Time | 1433 |
| es | es-lesson04 | 43 | 4 | The Essentials - 'tener' (to have), 'ser' & 'estar' (to be) & Introducing Yourself | 1314 |
| es | es-lesson05 | 44 | 5 | Saying Hello & Goodbye - Spanish Greetings (Saludos) | 1192 |
| es | es-lesson06 | 45 | 6 | Expressing Ability, Permission & Obligation - Modal Verbs (Verbos Modales) | 1308 |
| es | es-lesson07 | 46 | 7 | Talking About the Future - Using 'ir + a' and Future Tense | 1340 |
| es | es-lesson08 | 47 | 8 | Asking for Information - The 'Preguntas' (Questions) | 1353 |
| es | es-lesson09 | 48 | 9 | Yes/No Questions & Making Polite Requests | 1303 |
| es | es-lesson10 | 49 | 10 | Talking About the Past - The Preterite Tense (Pretérito Indefinido) | 1345 |
| es | es-lesson11 | 50 | 11 | The Present Continuous - Expressing Ongoing Actions | 1076 |
| es | es-lesson12 | 51 | 12 | Direct and Indirect Object Pronouns - Replacing Nouns | 1398 |
| es | es-lesson13 | 52 | 13 | Describing Things and People - Adjectives and Their Placement | 1377 |
| es | es-lesson14 | 53 | 14 | 'Hay' and 'Estar' - Existence and Location | 1566 |
| es | es-lesson15 | 54 | 15 | Taking Action - Command Forms (Imperative) | 1332 |
| es | es-lesson16 | 55 | 16 | Weather and Seasons - Talking About the Climate | 1550 |
| es | es-lesson17 | 56 | 17 | Definite and Indefinite Articles - Using 'The' and 'A/An' | 1416 |
| es | es-lesson18 | 57 | 18 | Getting Around - Transportation and Travel Vocabulary | 1940 |
| es | es-lesson19 | 58 | 19 | Talking About Your Family - Family Vocabulary and Relationships | 1958 |
| es | es-lesson20 | 59 | 20 | Describing Health and Illness - Medical Vocabulary | 2381 |
| es | es-lesson21 | 60 | 21 | Expressing Likes and Dislikes - 'Gustar' and Similar Verbs | 1622 |
| es | es-lesson22 | 61 | 22 | Daily Routines and Habits - Reflexive Verbs | 1993 |
| es | es-lesson23 | 62 | 23 | Going Shopping - Clothing, Stores, and Transactions | 1931 |
| es | es-lesson24 | 63 | 24 | Emergencies and Safety - Essential Phrases | 1816 |
| es | es-lesson25 | 64 | 25 | Making Plans and Social Invitations | 2260 |
| fr | fr-lesson01 | 65 | 1 | Building Your First French Sentences - Verbs, Pronouns & Pronunciation | 1790 |
| fr | fr-lesson02 | 66 | 2 | Decoding French Sounds - The Alphabet & Pronunciation | 1334 |
| fr | fr-lesson03 | 67 | 3 | Counting in French - Numbers (Les Nombres) & Basic Time | 1318 |
| fr | fr-lesson04 | 68 | 4 | The Essentials - 'avoir' (to have), 'être' (to be) & Introducing Yourself | 1341 |
| fr | fr-lesson05 | 69 | 5 | Saying Hello & Goodbye - French Greetings (Les Salutations) | 1074 |
| fr | fr-lesson06 | 70 | 6 | Expressing Ability, Permission & Obligation - Modal Verbs | 1407 |
| fr | fr-lesson07 | 71 | 7 | Talking About the Future - Using the Future Tense | 1419 |
| fr | fr-lesson08 | 72 | 8 | Asking for Information - Questions in French | 1182 |
| fr | fr-lesson09 | 73 | 9 | Talking About the Past - The Passé Composé | 1627 |
| fr | fr-lesson10 | 74 | 10 | Another Past Tense - The Imparfait (Imperfect) | 1308 |
| fr | fr-lesson11 | 75 | 11 | Saying "No" and "Not" - Negation in French | 1071 |
| fr | fr-lesson12 | 76 | 12 | Showing Possession - French Possessive Adjectives | 1131 |
| fr | fr-lesson13 | 77 | 13 | Giving Commands & Instructions - The Imperative Mood | 1190 |
| fr | fr-lesson14 | 78 | 14 | Adding Detail - French Adjective Placement & Agreement | 1248 |
| fr | fr-lesson15 | 79 | 15 | Making Comparisons - Comparatives & Superlatives | 1254 |
| fr | fr-lesson16 | 80 | 16 | Showing Cause & Contrast - French Connecting Words | 1546 |
| fr | fr-lesson17 | 81 | 17 | Asking "Whose?" - Using Possessive Pronouns | 1143 |
| fr | fr-lesson18 | 82 | 18 | Describing How Things Are Done - Adverbs | 1228 |
| fr | fr-lesson19 | 83 | 19 | Talking About What Might Be - The Conditional Mood | 1180 |
| fr | fr-lesson20 | 84 | 20 | Actions Bouncing Back - Reflexive Verbs (Les Verbes Pronominaux) | 1377 |
| fr | fr-lesson21 | 85 | 21 | Direct & Indirect Object Pronouns - Replacing Nouns in Sentences | 1119 |
| fr | fr-lesson22 | 86 | 22 | The Subjunctive Mood - Expressing Uncertainty & Subjectivity | 1128 |
| fr | fr-lesson23 | 87 | 23 | Relative Pronouns - Creating Complex Sentences | 1093 |
| fr | fr-lesson24 | 88 | 24 | The Pluperfect Tense - Expressing Actions Before Other Past Actions | 1335 |
| fr | fr-lesson25 | 89 | 25 | Reported Speech - Conveying What Others Said | 1470 |
| hi | hi-lesson01 | 90 | 1 | Building Your First Hindi Sentences - Verbs, Pronouns & Basic Structure | 1459 |
| hi | hi-lesson02 | 91 | 2 | Decoding Hindi Sounds - Pronunciation Basics | 1119 |
| hi | hi-lesson03 | 92 | 3 | Counting in Hindi - Numbers (संख्या - Sankhya) & Basic Time | 1426 |
| hi | hi-lesson04 | 93 | 4 | The Essentials - 'होना' (to be), 'पास होना' (to have) & Introducing Yourself | 1469 |
| hi | hi-lesson05 | 94 | 5 | Saying Hello & Goodbye - Hindi Greetings (अभिवादन - Abhivadan) | 1207 |
| hi | hi-lesson06 | 95 | 6 | Expressing Ability, Permission & Obligation - Modal Expressions | 1178 |
| hi | hi-lesson07 | 96 | 7 | Talking About the Future - The Future Tense | 1466 |
| hi | hi-lesson08 | 97 | 8 | Asking for Information - Question Words and Formation | 1237 |
| hi | hi-lesson09 | 98 | 9 | Talking About the Past - The Past Tense | 1497 |
| hi | hi-lesson10 | 99 | 10 | Connecting Ideas - Conjunctions & Compound Sentences | 1420 |
| hi | hi-lesson11 | 100 | 11 | Postpositions - Hindi's Equivalents to Prepositions | 1652 |
| hi | hi-lesson12 | 101 | 12 | Making Comparisons - Comparative and Superlative Forms | 1181 |
| hi | hi-lesson13 | 102 | 13 | Adding Detail - Adverbs & Adverbial Phrases | 1353 |
| hi | hi-lesson14 | 103 | 14 | Giving Commands & Instructions - The Imperative Mood | 1411 |
| hi | hi-lesson15 | 104 | 15 | Advanced Tenses - The Continuous Present and Past | 1742 |
| hi | hi-lesson16 | 105 | 16 | Describing People & Things - Adjectives in Hindi | 1774 |
| hi | hi-lesson17 | 106 | 17 | Personal Pronouns in Cases | 1546 |
| hi | hi-lesson18 | 107 | 18 | Saying "No" and "Not" - Negation in Hindi | 1385 |
| hi | hi-lesson19 | 108 | 19 | Connecting Clauses - Relative Pronouns & Relative Clauses | 1290 |
| hi | hi-lesson20 | 109 | 20 | Conditional Sentences - If-Then Statements | 1238 |
| hi | hi-lesson21 | 110 | 21 | Making Polite Requests - Please and Thank You | 1392 |
| hi | hi-lesson22 | 111 | 22 | Word Building - Common Prefixes and Suffixes | 1543 |
| hi | hi-lesson23 | 112 | 23 | Using Compound Verbs for Natural Expression | 1578 |
| hi | hi-lesson24 | 113 | 24 | Common Expressions & Daily Phrases | 1705 |
| hi | hi-lesson25 | 114 | 25 | Consolidating Your Hindi Knowledge - Review and Practice | 1125 |
| zh | zh-lesson01 | 115 | 1 | Building Your First Chinese Sentences - Pronouns, Verbs & Tones | 1188 |
| zh | zh-lesson02 | 116 | 2 | Decoding Chinese Sounds - Pinyin Pronunciation Guide | 1510 |
| zh | zh-lesson03 | 117 | 3 | Counting in Chinese - Numbers (数字 Shùzì) & Basic Quantities | 1211 |
| zh | zh-lesson04 | 118 | 4 | The Essentials - '是' (to be), '有' (to have) & Introducing Yourself | 1027 |
| zh | zh-lesson05 | 119 | 5 | Saying Hello & Goodbye - Chinese Greetings (问候语) | 1070 |
| zh | zh-lesson06 | 120 | 6 | Making Questions - Yes/No Questions & Question Words | 1078 |
| zh | zh-lesson07 | 121 | 7 | Expressing Time - Hours, Days, Months & Duration | 1107 |
| zh | zh-lesson08 | 122 | 8 | Talking About Places - Location & Direction | 1054 |
| zh | zh-lesson09 | 123 | 9 | Basic Negation - Saying "No" and "Not" | 941 |
| zh | zh-lesson10 | 124 | 10 | Describing Things - Adjectives & Adverbs | 1236 |
| zh | zh-lesson11 | 125 | 11 | Connecting Ideas - Conjunctions & Complex Sentences | 1128 |
| zh | zh-lesson12 | 126 | 12 | Talking About Actions - Expressing Ongoing, Completed & Future Actions | 1153 |
| zh | zh-lesson13 | 127 | 13 | Making Requests & Giving Commands - Imperatives | 912 |
| zh | zh-lesson14 | 128 | 14 | Asking "How Many?" - Numbers with Measure Words | 1224 |
| zh | zh-lesson15 | 129 | 15 | Making Comparisons - "More Than" & "Less Than" | 1100 |
| zh | zh-lesson16 | 130 | 16 | Talking About Ability - "Can," "Could," "Able To" | 1065 |
| zh | zh-lesson17 | 131 | 17 | Chinese Sentence Structure - Basic Patterns & Word Order | 1131 |
| zh | zh-lesson18 | 132 | 18 | Expressing Needs, Wants & Preferences | 1139 |
| zh | zh-lesson19 | 133 | 19 | Connecting with 的 (de), 得 (de), and 地 (de) | 1148 |
| zh | zh-lesson20 | 134 | 20 | Essential Vocabulary for Everyday Survival | 1734 |
| zh | zh-lesson21 | 135 | 21 | Expressing Past Experiences with 过 (guò) | 862 |
| zh | zh-lesson22 | 136 | 22 | Expressing Change with 了 (le) - Sentence-Final Particle | 894 |
| zh | zh-lesson23 | 137 | 23 | Using the 把 (bǎ) Construction for Object Manipulation | 894 |
| zh | zh-lesson24 | 138 | 24 | Passive Voice with 被 (bèi) | 868 |
| zh | zh-lesson25 | 139 | 25 | Reduplication Patterns in Chinese | 979 |
| zh | zh-lesson26 | 140 | 26 | Expressing Duration - How Long Something Takes/Lasts | 866 |
| zh | zh-lesson27 | 141 | 27 | Topic-Comment Structure - A Core Chinese Sentence Pattern | 803 |
| zh | zh-lesson28 | 142 | 28 | Modal Particles - Adding Nuance with 吧, 啊, 呢, etc. | 930 |
| zh | zh-lesson29 | 143 | 29 | Chinese Classifiers Beyond Basics - Advanced Measure Words | 970 |
| zh | zh-lesson30 | 144 | 30 | Idiomatic Expressions and Chengyu (四字成语) | 1135 |
| ja | ja-lesson01 | 145 | 1 | Building Your First Japanese Sentences - Word Order, Particles & Basic Verbs | 1114 |
| ja | ja-lesson02 | 146 | 2 | Sounds of Japanese - Pronunciation & Basic Writing System | 1036 |
| ja | ja-lesson03 | 147 | 3 | Counting & Basic Numbers in Japanese | 1049 |
| ja | ja-lesson04 | 148 | 4 | The Essential Verbs - 'desu' (to be) & 'arimasu/imasu' (to have/exist) | 899 |
| ja | ja-lesson05 | 149 | 5 | Introducing Yourself & Basic Greetings | 1061 |
| ja | ja-lesson06 | 150 | 6 | Modifying Actions - Japanese Verbs & Their Forms | 1138 |
| ja | ja-lesson07 | 151 | 7 | Connecting Ideas - Japanese Particles | 1193 |
| ja | ja-lesson08 | 152 | 8 | Describing Things - Japanese Adjectives | 1163 |
| ja | ja-lesson09 | 153 | 9 | Asking Questions & Making Requests - Question Words & Expressions | 1156 |
| ja | ja-lesson10 | 154 | 10 | Expressing Desires & Abilities - 'want' & 'can' | 1142 |
| ja | ja-lesson11 | 155 | 11 | Expressing Time - When, Duration & Frequency | 1153 |
| ja | ja-lesson12 | 156 | 12 | Moving Around - Direction, Location & Existence | 1274 |
| ja | ja-lesson13 | 157 | 13 | Making Connections - Joining Sentences & Ideas | 1023 |
| ja | ja-lesson14 | 158 | 14 | The Te-Form - The Swiss Army Knife of Japanese Grammar | 1074 |
| ja | ja-lesson15 | 159 | 15 | Respect & Formality - Introduction to Keigo (Polite Language) | 1080 |
| ja | ja-lesson16 | 160 | 16 | Counting Objects - Japanese Counters (助数詞) | 1223 |
| ja | ja-lesson17 | 161 | 17 | Making Comparisons - Japanese Comparative & Superlative Forms | 1139 |
| ja | ja-lesson18 | 162 | 18 | Talking About the Future - Japanese Future Expressions | 1071 |
| ja | ja-lesson19 | 163 | 19 | Expressing Opinions & Feelings - Japanese Emotional Language | 1062 |
| ja | ja-lesson20 | 164 | 20 | Describing Change - Becoming & Transformation | 1075 |
| ja | ja-lesson21 | 165 | 21 | Giving & Receiving - The Art of Exchange in Japanese | 1247 |
| ja | ja-lesson22 | 166 | 22 | Obligation & Necessity - Must, Should & Have to | 1126 |
| ja | ja-lesson23 | 167 | 23 | Trying New Things - Attempting, Testing, and Experiencing | 1161 |
| ja | ja-lesson24 | 168 | 24 | Conditionals - If, When, and Hypothetical Situations | 1255 |
| ja | ja-lesson25 | 169 | 25 | Explaining Reasons - The の/ん (*no/n*) Explanatory Form | 1166 |
| ja | ja-lesson26 | 170 | 26 | Making Suggestions & Giving Advice - Helping Others in Japanese | 1185 |
| ja | ja-lesson27 | 171 | 27 | Expressing Possibility & Probability - "Maybe," "Probably," "I Wonder..." | 1295 |
| ja | ja-lesson28 | 172 | 28 | Talking About Experience - 'Have Done' & Duration | 1241 |
| ja | ja-lesson29 | 173 | 29 | Advanced Verbs - Causative, Passive & Causative-Passive | 1272 |
| ja | ja-lesson30 | 174 | 30 | Quoting & Reported Speech - "He Said," "She Thinks" | 975 |
| ja | ja-lesson31 | 175 | 31 | Transitive & Intransitive Verb Pairs - Understanding Japanese Verb Relationships | 1073 |
| ja | ja-lesson32 | 176 | 32 | Japanese Onomatopoeia - Sound, Action & Feeling Words | 983 |
| ja | ja-lesson33 | 177 | 33 | Polite Negative Request - 〜ないでください & Alternatives | 883 |
| ja | ja-lesson34 | 178 | 34 | Extended Phrases & Idioms - Common Japanese Expressions | 1248 |
| ja | ja-lesson35 | 179 | 35 | Mastering Natural Japanese - Putting It All Together | 1517 |
| kn | kn-lesson01 | 180 | 1 | Building Your First Kannada Sentences - Verbs, Pronouns & Pronunciation | 1414 |
| kn | kn-lesson02 | 181 | 2 | Decoding Kannada Sounds - The Alphabet & Pronunciation | 1298 |
| kn | kn-lesson03 | 182 | 3 | Counting in Kannada - Numbers (ಸಂಖ್ಯೆಗಳು - sankhyegaLu) & Basic Time | 1123 |
| kn | kn-lesson04 | 183 | 4 | The Essentials - 'ಇರು' (to be), 'ಇದೆ/ಇಲ್ಲ' (is/isn't) & Introducing Yourself | 957 |
| kn | kn-lesson05 | 184 | 5 | Saying Hello & Goodbye - Kannada Greetings (ಶುಭಾಶಯಗಳು - shubhaashayagaLu) | 1031 |
| kn | kn-lesson06 | 185 | 6 | Expressing Ability, Permission & Obligation - Modal Words | 963 |
| kn | kn-lesson07 | 186 | 7 | Talking About the Future - Using Future Markers | 988 |
| kn | kn-lesson08 | 187 | 8 | Asking for Information - The 'ಏನು, ಯಾರು, ಎಲ್ಲಿ' (What, Who, Where) Questions | 1196 |
| kn | kn-lesson09 | 188 | 9 | Yes/No Questions & Making Polite Requests | 1068 |
| kn | kn-lesson10 | 189 | 10 | Talking About the Past - The Simple Past Tense | 1305 |
| kn | kn-lesson11 | 190 | 11 | Showing Possession - Possessive Forms & Genitive Case | 1067 |
| kn | kn-lesson12 | 191 | 12 | Adding Detail - Adjectives & Their Placement | 1121 |
| kn | kn-lesson13 | 192 | 13 | Connecting Ideas - Conjunctions & Compound Sentences | 1418 |
| kn | kn-lesson14 | 193 | 14 | Verbs with Objects - Accusative & Dative Case | 1229 |
| kn | kn-lesson15 | 194 | 15 | Body Parts & Health Expressions | 1345 |
| kn | kn-lesson16 | 195 | 16 | Food & Dining - Restaurant Vocabulary & Expressions | 1159 |
| kn | kn-lesson17 | 196 | 17 | Shopping & Money - Market Vocabulary & Transactions | 1134 |
| kn | kn-lesson18 | 197 | 18 | Travel & Transportation - Getting Around | 1306 |
| kn | kn-lesson19 | 198 | 19 | Weather & Seasons - Describing Climate | 1191 |
| kn | kn-lesson20 | 199 | 20 | Family & Relationships - Kinship Terms | 1301 |
| kn | kn-lesson21 | 200 | 21 | Putting It All Together - Basic Conversations | 1374 |
| kn | kn-lesson22 | 201 | 22 | Hobbies & Interests - Leisure Time Activities | 1501 |
| kn | kn-lesson23 | 202 | 23 | Education & School - Learning Environment | 1360 |
| kn | kn-lesson24 | 203 | 24 | Work & Professions - Career Vocabulary | 1564 |
| kn | kn-lesson25 | 204 | 25 | Technology & Modern Vocabulary | 1838 |
| kn | kn-lesson26 | 205 | 26 | Understanding Kannada Cultural Terms & Festivals | 1531 |
| kn | kn-lesson27 | 206 | 27 | Conjunct Verbs & Complex Sentence Formation | 1340 |
| kn | kn-lesson28 | 207 | 28 | Advanced Reading & Listening - Understanding Authentic Materials | 1527 |
| kn | kn-lesson29 | 208 | 29 | Idiomatic Expressions & Proverbs - Speaking Like a Native | 1946 |
| kn | kn-lesson30 | 209 | 30 | Practical Kannada - How to Navigate Real-life Situations | 2192 |


---

# Coverage, open validation, and design-approval checkpoint

## Deliverable coverage by target

“Complete draft” means the requested design content is present and has received an AI consistency review. It does not mean human linguistic approval, recorded audio, implemented software or demonstrated learning. The source inventory covers all 209 lessons; deep linguistic inspection is limited to the samples listed below. Every offered target has its own proposal rather than a translated universal template.

| Target | Inventory and substantive audit | First experience and three scripts | Ten-lesson map and prerequisites | Populated common schema | Interface and fox adaptation | Qualified review / learning tests |
|---|---|---|---|---|---|---|
| German | Complete inventory, 39; full reads 01–03, 05, 06, 09, 18, 20, 30, 39; all three current authored starters | Complete draft; existing starter IDs retained | Complete design map; all 39 legacy references assigned dispositions | Complete draft, version 2.0.0 proposed | Complete proposal | Teacher/audio review required; beginner pilot not run |
| Spanish | Complete inventory, 25; full opening 01–03 and stated teaching/exercise samples 05, 10, 13, 25 | Complete draft | Complete design map and all-course cluster strategy | Complete draft | Complete proposal | Teacher/audio review required; beginner pilot not run |
| French | Complete inventory, 25; full opening 01–03 and stated teaching/exercise samples 05, 10, 13, 25 | Complete draft | Complete design map and all-course cluster strategy | Complete draft | Complete proposal | Teacher/audio review required; beginner pilot not run |
| Hindi | Complete inventory, 25; full reads 01–03, 05, 10, 13, 25 | Complete draft | Complete design map and all-course cluster strategy | Complete draft | Complete proposal | Teacher/audio review required; beginner pilot not run |
| Mandarin Chinese | Complete inventory, 30; full reads 01–03, 05, 09, 10, 15, 30 | Complete draft | Complete design map and all-course cluster strategy | Complete draft | Complete proposal | Teacher/audio review required; beginner pilot not run |
| Japanese | Complete inventory, 35; full reads 01–03, 05, 10, 18, 35 | Complete draft | Complete design map and all-course cluster strategy | Complete draft | Complete proposal | Teacher/audio review required; beginner pilot not run |
| Kannada | Complete inventory, 30; full reads 01–03, 05, 10, 15, 30 | Complete draft | Complete design map and all-course cluster strategy | Complete draft | Complete proposal | Teacher/audio review required; beginner pilot not run |

Across all seven, authenticated browser validation and real account synchronization remain **blocked by unavailable signed-in access** in this audit. Actual mobile keyboards, screen readers, font shaping, speech, listening recordings and cross-device failure recovery remain **outstanding validation**. The desktop public journey and existing source tests were inspected as described in the shared report. Design work proceeded using those explicit limits; no unsupported production account claims fill the gaps.

The shared research synthesis, interface annotations, actual-asset mascot inventory, architecture/migration proposal, cost scenarios, common evidence model, per-pathway evaluation plans and multilingual roadmap are complete design deliverables. Prices have a date and assumptions. Actual hosting invoices and configured provider capabilities are unverified. No new speech assets were created. Lessons 4–10 in each target are concrete curriculum maps, **not another 49 fully scripted lessons**. The remaining 209-lesson conversion has a per-language strategy and requires subsequent authoring, review and implementation.

## Timing hypotheses, separated by pathway

The first new sentence is a meaningful formative milestone, not fluency. The following are **estimated opportunities in the drafted lesson sequence**, not observed achievement times. Actual arrival includes selection, setup and sign-in; active lesson time includes listening and silent thinking. The difference must remain visible in reporting. A label such as “practice” or “check” does not by itself establish independence: the actual prompt, earlier exposure and assistance determine eligibility.

| Target | Earliest intended eligible task and approximate active-lesson location | What must be demonstrated | Specific risk to the 3–5-minute arrival hypothesis |
|---|---|---|---|
| German | Fresh coffee request after isolated word teaching and closing all cues, roughly 2–4 minutes; later two-drink check | Novel request using taught pieces; please-only variation is not a new sentence | Any visible möchte/coffee spelling or replay changes support status; legacy preview exposure affects water |
| Spanish | Need-a-map reserved task, about 5–7 minutes | Need/search meaning plus the correct taught complement | The draft's protected task starts at five active minutes; it is unlikely to meet five minutes from arrival without reducing pre-task work |
| French | Dislike-chocolate reserved task, about 5:20–7:00 | Preference polarity and a taught noun construction; natural informal variants separately recorded | Pronunciation, article and elision explanations may postpone the first uncued attempt |
| Hindi | Protected group-ready / polite check tasks, about 6:15–8:40 | New person/state/copula combination; script mode separate | Ten functional/lexical pieces and role changes create an explicit timing risk; early guided success is not substituted |
| Mandarin | Self-coffee attempt about 2:10–3:40 if all cards are closed; protected negative companion task about 6:10–8:10 | Person/action/drink combination; later person/polarity reuse | Tone/script support can add time; untoned pinyin does not establish sound accuracy |
| Japanese | New coffee identification about 2:30–4:20 if all cards are closed; bread check about 5:30–7:45 | A meaningful new noun-plus-polite-ending sentence; explicit topic/reference measured separately | Script and spatial interpretation add demands; パンです can be a complete qualifying sentence when unseen and contextually appropriate |
| Kannada | Protected coffee-refusal / tea-offer tasks about 6:15–8:35 | New drink/polarity or drink/question combination; natural omitted experiencer allowed | Need/refusal/question and dative chunks may take longer; native-script entry cannot be compared directly with Latin typing |

These timings challenge a universal 3–5-minute promise. The initial pilot should report success by 3, 5 and 10 minutes from arrival for **all starters**, plus active-time distributions, without interrupting or penalizing the learner. For pathways that miss the early milestone, first inspect whether the barrier was setup, task wording, missing vocabulary, the number of simultaneous choices or script entry. Candidate revisions include postponing an optional sound explanation or moving a second contrast into the next lesson. Test those with equivalent unseen tasks; do not strip meaning or relabel cued responses to meet the target.

Within ten minutes, measure the number of genuinely unseen successful combinations as a count, not just whether one sentence passed. Limited reserved pools can prevent a “several unseen combinations” claim, especially when errors expose other combinations. Report pool exhaustion and supported success. A future assessment pool must be large enough for the intended number of independent attempts without sacrificing realistic language. No draft here establishes that every complete beginner will meet either timing hypothesis.

## What has and has not happened

| Category | Status |
|---|---|
| Inspected facts | Live anonymous journey; version/source provenance; seven offered targets; 209 lesson inventory; sampled teaching; actual mascot assets; account/storage/source contracts |
| Research findings | Bounded primary-source synthesis with populations, tasks, outcomes, limitations and access levels; Language Transfer prescriptions distinguished from comparative evidence |
| Proposals | Seven original openings, 21 full scripts, 70 mapped lessons, UX, evidence rules, language-aware schema, migrations, cost/data defaults and evaluation |
| Existing software tests completed | 35 existing tests passed; source-to-catalog comparison found no mismatches; application checkout stayed clean |
| Design artifact checks | Common metadata, JSON parsing, internal step/prompt references, coverage and rendered wireframe inspection; these do not validate language learning |
| Implemented changes | None to the application, accounts, production data or deployed content |
| Publication | None |
| Human validation | No qualified teacher sign-off, human participant tests, interview findings or learning gains claimed |

## Approval decision

The proposed approval covers the shared architecture and evidence rules, all seven language-specific opening pathways, preserved identity/assets/progress, the interface direction, and the staged multilingual implementation plan. It authorizes implementation work only after your approval, with qualified review and technical verification treated as separate gates. It does not approve a German-only scope, subscriptions, retroactive mastery claims or publication.

The next phase should deliver a complete working opening slice for **every one of the seven targets**, including account saving and a return review, while keeping all existing lessons free and unlocked. Source reconciliation, known-content corrections, script support and exposure integrity come first. Public release remains a separate authorization checkpoint after the relevant verification.
