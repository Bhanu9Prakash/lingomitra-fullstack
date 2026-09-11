# LingoMitra visual contract

Updated 2026-09-11. Read this with AGENTS.md and `docs/approved-design/library-components.md`. The user has approved Direction A, Learning Studio and explicitly requires using components from the supplied references when a matching component exists.

## Design direction

A calm language workspace with the original, familiar fox. Beginners should see what to read, what to try and how to ask for help. Use warm paper (#F6F2E9), near-white surfaces (#FFFEFA), forest ink (#243C36), and terracotta primary actions (#994325). The new approval supersedes the earlier cool neutral palette. Give hierarchy, typography, whitespace, proportions and state clarity as much attention as component choice.

Use actual library components for matching controls and interactions. Product-specific composition, routing, authored teaching, validation and account state remain application code. Do not build a bespoke equivalent or describe an original implementation as imported source. Minimal framework, accessibility and data-wiring adaptations are documented in `component-sources.json`.

Use restrained visual variation, moderate density and purposeful motion outside assessment. Sentence construction is still. Preserve all seven targets: German, Spanish, French, Hindi, Mandarin, Japanese and Kannada. English is currently the teaching/interface language. All lessons remain open and free; lesson IDs, account records and language histories remain stable.

## Reference map

| Reference | Role here |
|---|---|
| [Watermelon UI](https://ui.watermelon.sh/) | Core controls, cards, selectors, disclosures, feedback, navigation, dialog and notifications. Fifteen files imported from its [official registry](https://github.com/WatermelonCorp/watermellon-registry), with a pinned revision and license. |
| [Motion Primitives](https://motion-primitives.com/) | Actual Animated Group and Animated Background from the [official repository](https://github.com/ibelick/motion-primitives). Route selection stays authoritative; reduced motion is explicit. |
| [Kokonut UI](https://kokonutui.com/) | Actual Slide Text Button and Switch Button from the [official repository](https://github.com/kokonut-labs/kokonutui), integrated with the existing router and theme. |
| [Refero Styles](https://styles.refero.design/) | Coherent type, color, spacing and hierarchy. The earlier reference pass examined the catalog and Linear/Calendly pages; these are third-party style interpretations. |
| [Realtime Colors](https://www.realtimecolors.com/?colors=050315-fbfbfe-2f27ce-dedcff-433bff&fonts=Inter-Inter) | In-context color comparison and contrast. The example purple URL does not replace the user's approved Learning Studio palette. |
| [Haikei](https://haikei.app/) | Optional graphic generator when a specific graphic is needed. No decorative background is necessary in the current learning workspace. |
| [Componentry](https://componentry.dev/) | Selective interaction reference. Its catalog was examined in the earlier pass. Inspect an individual component and license before importing it. |
| [Bklit](https://bklit.com/) | Potential reference for useful evidence charts. Full component inspection remains pending; no chart library or decorative dashboard is added. |
| [Motion](https://motion.dev/docs/react-accessibility) | Existing runtime for selected components. Prefer its reduced-motion controls and short, purposeful movement; keep essential actions immediately visible. |
| [React Spring](https://www.react-spring.dev/) | Reference for spring behavior, with no extra runtime installed where existing Motion already serves the need. |

The current component pass inspected pinned source and licenses from the three official repositories above. It does not claim interactive inspection or use of all ten libraries. Some are reference tools rather than component packages. The earlier pass's blocked/timed-out web pages were not treated as inspected demos.

## Color
Use the shared tokens in client/src/approved-visuals.css. Decorative dividers use #C8CDC2. Essential control boundaries use #768176; focus uses #285748 with a visible outline. The light and dark themes share the same roles. Contrast calculations and rendered checks belong in the current review record, not the previous palette's audit.

## Typography, spacing and shape

- Use Georgia/system serif for the English display headings, and preserve the system sans stack for instructions, controls and target-language text. Do not introduce a remote font solely because it appears in a demo; Inter alone would not cover every target script.
- Use 16–18px-equivalent body/instruction text, routine labels around 14px or larger, and 18–24px examples. Small metadata may be 12–13px. Respect user text scaling.
- Use normal-weight explanatory prose and selective semibold emphasis. Keep explanations at comfortable reading widths, roughly 45–65 Latin characters, and judge the other scripts individually.
- Hindi and Kannada need generous leading, intact vowel marks and normal letter spacing. Japanese and Mandarin need appropriate wrapping and punctuation. Preserve accents, umlauts and meaningful vowel distinctions.
- Use a 4/8/12/16/24/32px spacing rhythm, with more space between tasks than between a field and its label.
- Keep controls around 10px radius and major panels around 20px. Use a quiet surface shadow when it helps group an interactive card, with stronger elevation for actual overlays.
- Desktop has a centered workspace. Mobile keeps prompt, sentence entry and action together. Aim for 44px ordinary action targets; compact indicators sit inside larger labels. This is a product usability target, not a restatement of WCAG's minimum.

## Components and motion

| Moment | Treatment |
|---|---|
| Arrival | Original still fox, one primary language-entry action, Kokonut sliding text only on voluntary pointer hover. One stable accessible name; no hidden initial CTA. |
| Language choice | Watermelon Card/Header/Content/Footer and Button, meaningful native names/outcomes, clear start actions. Animated Group settles by 8px over 240ms with 25ms staggering. |
| Teaching | One relevant example, optional audio, complete text. A keyed Motion element may use a brief opacity transition with no retained exit content. |
| Prior knowledge, recognition and sentence construction | Instantly visible, still workspace. No animated answer cues, exiting examples, moving words or mascot chatter during construction. |
| Requested help | Watermelon Alert beside the task. Full explanation appears immediately and assistance is recorded. |
| Correction and verified success | Specific text and a meaningful icon. Only existing independent evidence permits the still companion success statement. No confetti, sound or disappointed expression. |
| Return | Watermelon recommendation cards, real saved language/draft/history and an override path. Short optional entrance, without invented urgency. |
| Navigation | Watermelon Navigation Menu and Animated Background follow the actual route. Reduced motion uses a static selection marker. |
| Lesson selection | Watermelon Dialog with focus containment, explicit opener restoration and a scrollable list. Every lesson stays available. |
| Notifications | Watermelon Sonner wrapper with the existing theme, dismiss controls and reduced-motion treatment. |

Motion is not a substitute for clear selected states. Essential controls and content appear immediately. Reduced motion suppresses cosmetic transitions; touch does not depend on hover. JavaScript motion needs explicit controls in addition to CSS. The [Motion accessibility guide](https://motion.dev/docs/react-accessibility) documents the relevant runtime behavior.

The upstream Transition Panel was removed because it retains exiting content. Do not reintroduce it around assessment boundaries. Changes in draft-save state must not remount a sentence field or replay a transition. Listening and quiet thinking are active learning, without countdown pressure.

## Implementation and review

`client/src/approved-visuals.css` is the final visual layer after legacy styles. Match the library markup and slots when composing a page. Remove superseded selectors instead of layering competing custom component implementations. Preserve existing notices and update source hashes when imported code changes. Sonner 2.0.8 is the only added package in this pass; other runtime dependencies are retained.

For each change, inspect the existing learner task, choose the relevant library component, connect it to the product's state, then check empty/loading/error/selected/focus/disabled states. Include all affected scripts. A template translated seven times does not replace language-specific teaching content.

Current implementation status and validation are recorded in docs/learning-studio-review.md. The earlier version passed 48 automated tests; that result does not certify this revision. Publication remains a separate approval gate.
