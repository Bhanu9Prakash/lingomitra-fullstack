# German pilot: teaching, interface and evaluation

This is an original LingoMitra adaptation. It does not reproduce Language Transfer scripts, recordings, distinctive wording or branding. English is the actual explanation language in the inspected application, including this pilot. Native/first language and other known languages are separate optional preferences. There is no Hindi or Telugu explanation curriculum yet; translating English strings alone would not create one.

## Teaching model and evidence boundary

Use a meaningful example, a brief explicit explanation, a supported attempt when needed, a fresh combination, use in a situation, and later retrieval. Teach arbitrary words directly. Ask the learner to infer only a small change whose ingredients are already present. A requested answer remains immediately available; never force repeated guessing. Understanding makes reconstruction possible; practice and retrieval strengthen access; repeated meaningful use can make responding less effortful. Memory and practice remain necessary.

The [official Language Transfer course instructions](https://www.languagetransfer.org/courses) emphasize pausing, thinking and responding; selected [Thinking Method guidebook sections](https://www.languagetransfer.org/guidebook) informed the proposed sequencing, cues and attention to known-language connections. Those are the method's own principles, not comparative evidence of superiority.

The earlier audit distinguishes independent research: Karpicke & Roediger (2008) studied delayed foreign-word retrieval, not German sentence generation; Nassaji & Swain (2000) was a very small negotiated-help tutorial study; Erlam (2003) concerns a particular French structure and assessments; Ellis, Loewen & Erlam (2006) supports targeted feedback under its classroom conditions; Mackey (1999) concerns interaction and ESL question development; Kakitani & Kormos (2024) compares distributed speaking practice schedules. These motivate testing the design, not promising its success. Full source links, access limits and claims are in the delivered audit.

Pilot defaults: one communicative outcome per activity; roughly two or three new items per teaching step; six lexical items in lesson 1, used immediately. These are design choices, not cognitive capacity laws. Do not introduce case paradigms, alphabet drills, all greetings or a conjugation table before the first request.

Reading and optional audio connect sound, written form and meaning. Writing makes a constructed response reviewable. Saying it aloud is optional and self-practice; ASR transcription is not a pronunciation assessment. Device speech has a text fallback. Initial English meaning prompts later become choices for oneself and a visitor, followed by a different situation using the same taught German ingredients. Open roleplay remains unassessed.

## First 5–10 minutes: intended pacing, not a countdown

The canonical complete first lesson is `/de/lesson/1` or `/learn/de-starter-01`; its exact script is exported in `german-pilot-script.md`. Public `/try/de` offers the same first idea before sign-in and honestly labels the attempt self-practice. Its revealed water sentence is excluded from subsequent new-combination evidence when the exposure flag survives sign-in. Cross-browser exposure and outside help cannot be detected; research must observe them.

| Approximate minute | Learner sees/hears and does | Teacher/companion role |
|---|---|---|
| 0–1 | Start German or choose another language; no feature tour; optional prior-knowledge water request in the account lesson | “We can start from the beginning.” No microphone required |
| 1–2 | `ich`, `möchte`, `Tee`; one model `Ich möchte Tee.`; optional Listen / Slower / Stop | Explain words, order, request meaning and noun capital. No full table |
| 2–3 | One meaning check, then isolated `Wasser = water`; model put away | Explain that only the drink changes |
| 3–5 | Type an unseen full request for water | “You have the pieces. Try putting them together.” Fox stays still and silent while typing. Hint or answer can be requested |
| 5–6 | `Kaffee = coffee`, followed by a new full request without the model | After independent target success: “You made a new sentence without a hint.” Assisted success uses different wording |
| 6–8 | `bitte = please`; tea model demonstrates two natural positions; new water/coffee requests include please | Explain directly, then remove examples. Each help request is recorded |
| 8–9 | Choose a drink for oneself and write the request | Personal meaningful reuse; not necessarily a novel sentence |
| 9–10 | Save, see a suggested return date, proceed to lesson 2 or choose any course | “Bring this pattern back later.” Completion is not fluency |

The 3–5 minute and 10 minute goals remain hypotheses. Some learners will need longer. Arrival-to-first independent sentence includes navigation and sign-in; active time is a separate foreground, unpaused lesson estimate excluding save waits and the tutor panel. No timer is displayed. First successful self-practice, recognition and assisted completion do not substitute for the independent metric.

## Complete branch: first water request

Prompt: “At a café, ask for water in a full German sentence.” Taught ingredients: `ich`, `möchte`, `Wasser`; order demonstrated with tea. No model or answer words remain on the task screen.

| Response / action | Exact response or available help | Next action and evidence |
|---|---|---|
| `Ich möchte Wasser.` on first attempt without support | “You made a new sentence without a hint.” | Save independent evidence if not previously exposed/baseline; teach Kaffee and ask a fresh request |
| `ich moechte Wasser!` | Same target success, plus “The sentence pattern works. In writing, capitalize the first word, German nouns, and polite Sie.” | Pattern success retained; spelling convention gets its own note |
| `Ich Wasser möchte.` | “Put möchte after Ich, and the drink after möchte.” | Record diagnostic support, allow repair; corrected water is supported; fresh coffee checks understanding |
| `Ich möchte Tee.` | “Your sentence uses a different drink or language. The prompt asks for Wasser.” | Meaning correction, not a word-order lecture; correction marks support |
| `Ich mochte Wasser.` | “The dots change the meaning: möchte is ‘would like’; mochte is ‘liked’. You can type moechte for möchte.” | Verb-form correction; keep the meaningful distinction |
| Stuck: first Hint | “Start with the person making the request. What comes after ‘I’?” | Small cue, mark assistance |
| Stuck: second Hint | “Use ‘would like’ before the drink in this pattern.” | More specific cue |
| Stuck: third Hint | `Ich möchte …` | Partial worked example |
| Show an answer, at any point | `Ich möchte Wasser.` | Full answer immediately; no penalty or gate. Subsequent copied answer is supported |
| Different potentially valid request | Explain that it may work but this checker assesses the taught möchte pattern | Keep as unassessed or attempt the target. Do not manufacture correctness |
| Unrecognized input | “I cannot reliably assess this version. You can keep it as unassessed practice or request help. This is a limit of the checker, not a judgment that your sentence is wrong.” | No false failure judgement; this nondiagnostic response alone is not an answer hint |

Accepted target variants include punctuation/case differences, `moechte`, optional `gern/gerne`, and natural drink articles (`ein Wasser`, `einen Tee/Kaffee`). For please tasks, `bitte` may follow the finite verb or close the sentence. These additions do not create extra independent combinations. The checker is intentionally bounded and requires human review of its accepted grammar.

## Dependencies and ten-lesson map

| Pilot lesson | Outcome and new ingredients | Why here / prerequisites | Independent task and review |
|---|---|---|---|
| 1, implemented; linked `de-lesson01` | Request a drink. `ich, möchte, Tee, Wasser, Kaffee, bitte`; one request frame | No prerequisites; introduce meaning and a productive substitution | New water/coffee combinations; return in a host/office situation |
| 2, implemented; linked `de-lesson06` | Say what one would like to do. `trinken, lernen, Deutsch, Englisch`; action at the end | Explicit recap supplies lesson 1 when entered directly. Contrast German action-last order with English | Water/coffee drinking and English learning; adviser/course context at review |
| 3, implemented; linked `de-lesson09` | Ask a visitor politely. `Sie, möchten, ja, nein, danke`; finite-verb-first question, action remains last | Recap supplies earlier words/actions; Sie is formal/polite, not informal du | Water offer, English-learning and coffee-drinking questions; reserved water-drinking/German-learning questions in later workshop/course contexts |
| 4, planned | State what I do: `ich lerne`, `ich trinke` | Contrast actual action with möchten; teach finite forms before eliciting them | New combinations only from supplied vocabulary |
| 5, planned | State what we do: `wir lernen/trinken` | One subject/form contrast; do not reuse ich inflection | Ask learner to speak for a pair/group |
| 6, planned | Informal `du` statements/questions | Explain social register and `lernst/trinkst` before use | Exchange with a friend; never silently mix Sie/du forms |
| 7, planned | Scoped predicate negation with `nicht` | Explicit examples establish placement for only the chosen frame; no hidden `kein` requirement | Correct a false statement using taught forms |
| 8, planned | Add `heute/morgen` without fronting | Time meanings first; one taught word order | Express a simple plan; do not introduce inversion in held-out tasks |
| 9, planned | `wohnen` with `in Berlin/Hamburg` | Supply verb forms, city names and preposition before use | Say/ask where someone lives within the taught scope |
| 10, planned | Mixed communicative exchange; no new forms | Integrate the preceding repertoire | Held-out combinations and delayed retrieval |

Only 1–3 are implemented as authored pilot activities. The original numeric curriculum stays accessible. New activities must link to stable original IDs, reuse accurate sections, split overloaded chapters and retire misleading automatic scoring—not delete the curriculum. Each additional language needs a separate language-pair dependency and correctness audit.

## Annotated interface and mascot integration

One centered workspace has course navigation and Pause above a thin step-progress indicator. The current concept/prompt comes next; a labelled sentence field is the primary interaction. Check is followed by optional Hint / Show an answer. Feedback stays adjacent to the input. A single Continue action appears after an attempt or reveal. Account save status and companion preference sit below; original notes and optional tutor are secondary controls that record assistance. No assessment answer appears in audio, captions, character expression or hidden client keys before assistance.

Existing reusable assets: `mascot-neutral.png`, `mascot-thinking.png`, `mascot-coaching.png`, `mascot-retry.png`, `mascot-celebration.png` (1024×1024 PNGs) and existing logo components. The character is the existing fox; no verified personal name was found. No additional poses or replacement character are needed. The previous radial progress decoration is simplified into readable course counts.

| Moment | Purpose / trigger | Exact dialogue | Visual state | Dismissal / accessibility |
|---|---|---|---|---|
| Public first arrival | Start an idea, on opening the starter | “We can work this out together.” | Neutral, static | Ordinary text; no autoplay; proceed immediately |
| Account starting point | Avoid intimidation, prior check | “We can start from the beginning.” | Neutral | Global/minimize preference removes commentary; main instructions remain |
| First concept | Frame the narrow idea | “Let’s work out one small pattern.” | Neutral | Decorative image uses empty alt; teacher explanation remains accessible |
| Sentence attempt | Invite effort once | “You have the pieces. Try putting them together.” | Neutral, still | No new bubble, expression change, animation or speech while learner thinks |
| Requested hint | Make help easy to find | First water cue shown in branch above | Thinking, still | Help text announced politely; saved as assistance; full answer still available |
| Error | Explain the relevant issue after Check | “Put möchte after Ich, and the drink after möchte.” | Retry, still | No disappointment or color-only meaning; text identifies the issue |
| Supported correction | Acknowledge useful repair | “That sentence works with support. Try the next combination with the examples put away.” | Coaching, still | No independent claim; next task supplies fresh evidence |
| Independent target success | Name demonstrated action | “You made a new sentence without a hint.” | Celebration pose, still | No motion/confetti; textual status remains when mascot minimized |
| Return visit | Resume without guilt | “Welcome back.” | Neutral | Resume action and status are separate text; no missed-streak blame |
| Loading/error | Preserve attention and useful recovery | “Preparing your saved lesson…” / concrete error and retry | No mascot required | Status/alert text and reachable recovery controls |

Images do not carry essential information, do not obstruct mobile entry and stay still during assessment. Shared reduced-motion rules apply. Hiding commentary never hides a prompt, hint or correction. Compare optional companion on/off during formative work; more visibility is not presumed to improve learning.

## Measurement and evaluation

Operational independent construction: a correct target meaning/pattern assembled from taught ingredients, not shown as a whole before that attempt, without a visible answer, requested hint, diagnostic correction or recorded notes/tutor help. Accepted variants share a semantic key. Known baseline and public-preview exposures cannot earn new-combination credit. Recognition, supported construction, independent construction, later retrieval and application in another situation are separate records. An unassisted contextual answer can be both retrieval and application; it is not automatically a novel sentence. Outside assistance cannot be proven absent by telemetry.

`learning_events` stores the actual attempt, step/content version, assistance, semantic evidence, prior-knowledge classification, arrival/begin timestamps and accumulated active time. Use the earliest qualifying independent event for first-sentence timing. Report prior success separately, and do not attribute it to instruction. `draft` heartbeats record quiet thinking separately from correctness. Existing generic self-practice has no comparable automatic accuracy score.

Start with 6–8 consenting true beginners with different devices and literacy/keyboard backgrounds. Observe a short prior-knowledge task, time from arrival and active engagement, prompts requiring explanation, help/reveal frequency, confusion, confidence and abandonment. Score held-out tasks with a teacher rubric. Record failures and technical blockages; this is exploratory usability/teaching work, not proof of superiority. Counterbalance companion visibility across comparable tasks and ask whether it clarified or distracted.

For a subsequent randomized parallel comparison, use the same target meanings, vocabulary, exposure time, prior check, scoring rubric and held-out tasks in both the original and redesigned presentation. Block assignment by prior knowledge and relevant explanation-language proficiency. Blind human scorers to condition. Do not compare redesigned taught möchte with an unrelated baseline lesson and call that a method effect. Choose sample size with a prespecified meaningful difference and anticipated attrition after formative variance estimates; 6–8 cannot establish comparative effectiveness.

Primary outcome: independent success on held-out taught combinations, with first-sentence time reported alongside it. Secondary: amount/type of help, meaning understanding, delayed retention, confidence calibrated to performance, confusion and abandonment. Record right-censored time for learners who never qualify; do not calculate timing only among successes. Return behavior is useful only alongside learning outcomes.

At about 24 hours and seven days, administer the reserved tasks **before** opening review, examples or hints. Record the actual interval and intervening practice. The 24-hour test itself is retrieval practice and can affect day-seven results; keep this schedule equal across conditions or plan a separately powered retention-only arm. Report invitations, completions, missing reasons when available, failures and sensitivity to missing outcomes. Do not silently exclude no-shows or technical failures. The app's optional normal review schedule is a product feature, not an experimental protocol.

Normal review defaults: one day after completion or a round needing help; 3, 7 and then 14 days after successive genuinely delayed unassisted rounds. Immediate review is always allowed but does not advance that schedule or claim delayed retrieval. Due activities needing support are prioritized, then older due dates; Today shows up to three, and learners can choose any activity/course. These intervals and recommendations remain hypotheses.

No participants, observations, learning gains, pronunciation validity or pedagogical superiority are claimed in this release.
