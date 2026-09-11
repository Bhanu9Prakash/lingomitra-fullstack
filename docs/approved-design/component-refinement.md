> Historical record. The current implementation and review status are in ../learning-studio-review.md.

# Component refinement, 2026-09-10

The user requested actual component reuse and animation from the ten supplied references, extending the approved neutral visual direction. This revision preserves the seven target languages, 209 original lessons, 21 guided openings, original mascot assets, account data and free access.

## Implemented

| Surface | Component / treatment | Purpose and guardrail |
| --- | --- | --- |
| Welcome | Existing Kokonut Slide Text Button adaptation; neutral fox surface | Clear primary action with voluntary hover response. Accessible label and both visible copies say the same thing. Original fox is still. |
| Language selection | Existing Motion Primitives Animated Group adaptation | Seven aligned cards enter with an 8px settle over 240ms, staggered by 25ms. No card moves on hover. Keyboard focus, outcome and native language name stay visible. |
| Primary navigation | Existing Motion Primitives Animated Background adaptation | Shared Today/Learn/Talk/Profile destinations on desktop and mobile. The selected background follows the actual route. A modified click cannot leave a false active state. |
| Teaching and return | Existing Motion Primitives Transition Panel adaptation | A 160ms opacity change acknowledges new content. No blur, displaced text, outgoing content overlap or delayed help. |
| Assessment | Quiet Transition Panel; MotionConfig around existing Watermelon Progress | Prior knowledge, recognition and sentence construction appear immediately. Progress indicates current activity position only. |
| Theme switch | Brief CSS icon turn | Confirms an explicit theme change without moving the button. |
| Saved learning | Existing history/recommendations with refined card hierarchy | Current account data remains authoritative. No progress or recommendation algorithm changes. |

## Preservation and access

- No changes to Worker routes, authentication, shared curriculum, migrations, dependencies, lockfile, or mascot assets.
- Native sentence input, composition handlers, focus handling and draft-save logic are retained.
- Transition keys use authored step IDs, so draft saves and feedback updates within the same step preserve the input subtree.
- Old panels unmount immediately. No AnimatePresence exit retains examples during a new assessment.
- Reduced motion uses static selection markers, instant panels, zeroed entrance transforms and disabled CSS movement. Essential labels never require hover or completion of an animation.
- All sizes use the same destinations. At narrower widths, navigation uses the existing bottom placement with safe-area padding and remains absent during lessons.
- Retained upstream MIT notices identify the adapted components. The other reference sites inform style choices without adding unused libraries or claiming affiliation.

## Verification

The existing 48 automated learning, persistence, account-isolation and migration tests passed. These primarily verify application and learning behavior, not visual animation quality. `npm run check` and the supported Sites production build both completed successfully. `git diff --check` passed. The dependency lockfile, Worker, shared curriculum, migrations and original assets have no changes in this revision. The production catalog still contains 209 lessons across seven languages.

Browser testing was attempted through the supported preview. Navigation failed with `net::ERR_BLOCKED_BY_CLIENT`, so no desktop/mobile screenshots, real keyboard/IME interaction, dynamic reduced-motion change or cross-device sign-in verification are claimed. The source retains script-aware text treatment, visible focus and existing keyboard/viewport protections; those still need rendered verification.

No human language review or learner study was performed in this visual follow-up. This revision is saved without replacing the current published version.
