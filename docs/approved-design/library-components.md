> Historical record of the 10 September revision. Direction A approved on 11 September supersedes its palette and page composition. See ../learning-studio-review.md for the current implementation and gates.

# Library component revision

2026-09-10. Implements the user's requirement to reuse a referenced library component whenever one already serves the interaction. This revision is saved for review, separately from the published version 6.

## What changed

The site now uses actual source from pinned official repositories, in place of the previous locally written lookalikes and matching bespoke controls. Nineteen imported source files are recorded in `component-sources.json`, including upstream and local hashes. Their licenses are retained in `THIRD_PARTY_NOTICES.md`.

| Surface | Component source | Integration |
|---|---|---|
| Shared buttons, cards, forms and progress | Watermelon Button, Card, Input, Textarea, Label, Progress | Existing handlers and data contracts; React 18 forwarded refs; semantic progress value |
| Header and Today language pickers | Watermelon Select | Radix combobox, keyboard selection, portal placement, existing target-language routing and saved preference |
| Language catalog | Watermelon Card and Button; Motion Primitives Animated Group | Seven language-specific outcomes, native names, explicit start links and course links; restrained entrance |
| Main navigation | Watermelon Navigation Menu; Motion Primitives Animated Background | Four real destinations; selected state follows the route, including browser navigation; static reduced-motion alternative |
| Welcome action and theme | Kokonut Slide Text Button and Switch Button | Existing Wouter links and ThemeProvider; stable accessible name and immediately visible action |
| Conversation configuration | Watermelon Radio Group and Label | One selected language, context and difficulty; real radio indicators with generous clickable labels |
| Requested help and correction | Watermelon Alert, AlertTitle, AlertDescription | Full text, polite status announcements, meaningful icons and unchanged assistance classification |
| About-this-lesson, privacy and review cues | Watermelon Accordion | Real expanded/collapsed controls; essential guidance stays outside optional disclosures |
| Course lesson picker | Watermelon Dialog and Button | Focus containment, external opener restoration, Escape dismissal and scrollable lesson list; owned completion data still fetched from the existing API |
| Notifications | Watermelon Sonner wrapper and Sonner 2.0.8 | Existing toast hook adapted to library notifications, dismiss controls and existing theme |
| Other course, chat and microphone controls | Shared Watermelon Button and Textarea | Existing behavior, disabled states, IME handling and microphone consent preserved |

No raw bespoke button/select/textarea/input/disclosure implementation remains in application TSX outside the underlying library primitives. This is a source inventory, not a claim that every container or learning feature is a library component. Course logic, authored content, the learning workspace, mascot placements, account integration and screen composition remain application code. Other pre-existing Radix/shadcn controls are retained; they are not presented as newly imported Watermelon source.

## Source and compatibility

- Watermelon: `0099addd50a985bf53bdb81140ab4b72fc0668ce`, 15 source files.
- Motion Primitives: `92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d`, Animated Group and Animated Background.
- Kokonut UI: `83eec6d982d400a18438001a8efdbac1f159dd43`, Slide Text Button and Switch Button.
- Sonner 2.0.8 is the only added package. Existing declared dependencies remain installed; the lockfile change adds Sonner only.

The repositories were cloned from their official GitHub locations and the selected files and licenses examined. The copies retain upstream implementation and component structure with bounded changes: individual installed Radix imports, React 18 refs, Tailwind 3 utility compatibility, Wouter routing, the current theme provider, reduced motion and accessibility. Watermelon's Progress now forwards its value to Radix Root, not just the visual indicator. CardTitle retains the existing semantic heading. Animated Background accepts the authoritative route as a controlled value. Kokonut's arrival action is not initially hidden or translated offscreen; its repeated visual text has one accessible label.

The upstream Transition Panel retains exiting content and is unsuitable for assessment boundaries. It is removed. Teaching content uses an ordinary keyed Motion element with no exit overlap; prior knowledge, recognition and construction steps appear instantly. Product-specific sequencing remains application code, not a newly invented animation component.

Haikei, Refero and Realtime Colors remain design/reference tools. Componentry, Bklit and React Spring are not installed without a missing interaction to justify them. No claim is made to have copied from all ten references.

## Visual treatment

One neutral token set now also drives the libraries' HSL variables in both themes, removing stale warm-colored variables from the final cascade. White/cool-gray surfaces and charcoal text retain the original fox as the warm visual anchor. Language cards use genuine header/content/footer slots, aligned names, comfortable script leading and clear start actions. Cards get a restrained surface shadow and stronger border on interaction. Controls have consistent focus, hover and disabled states.

The mobile catalog is one column. The bottom navigation uses the real menu layout with four equal targets and moves out of the software keyboard's way using the existing viewport behavior. Form text is at least 16px; ordinary action targets are at least 44px. Radio indicators remain compact inside larger labels. The lesson picker is bounded by the dynamic viewport and its list scrolls. These are implemented layout rules; device inspection remains pending.

Kokonut's text slide and theme response are optional, brief interaction details. Reduced motion and touch avoid the sliding text. Navigation has a static reduced-motion selection state. Sonner transitions are suppressed under reduced motion. No mascot movement, autoplay speech, answer-bearing animation or exit overlap enters sentence construction.

## Verification and limits

Completed:

- TypeScript check and production client/Worker build.
- All 48 existing automated tests, including synthetic working flows for all 21 openings and account/migration safeguards.
- Structural React renders: anchor semantics, progress value, selected radio state, combobox role, active navigation route and stable CTA label.
- Rendered construction markup for German, Spanish, French, Hindi, Mandarin, Japanese and Kannada: script attributes and entry preserved; supplied hidden examples/word lists absent; no entry animation. Supported feedback does not claim independent production.
- Source hashes and imported license records; no changes to Worker, shared learning content, lesson catalog, database migrations, hosting configuration or mascot/flag assets.

The supported supervised preview continues to be blocked by the environment (`net::ERR_BLOCKED_BY_CLIENT`). No alternate browser route or production URL was used to bypass that restriction. Actual rendered desktop/mobile composition, focus cycling, keyboard-open behavior, touch, zoom, screen-reader announcements and reduced-motion behavior still require browser/device verification. A successful build or structural render is not a visual-quality verdict or evidence of learning effectiveness.

## Review and release

Review the welcome, all seven language cards, an opening lesson, Today, course picker and conversation controls in both themes at desktop and small-screen sizes. Verify 200% text scaling, keyboard navigation/return focus, the software keyboard, reduced motion and longer script examples. The source change is reversible as a versioned UI update and adds no migration. Publishing this revision requires the user's publishing instruction.
