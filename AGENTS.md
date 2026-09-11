# LingoMitra project instructions

Read DESIGN.md before changing the interface. The user requires using a component from their referenced libraries whenever it already provides the needed control or interaction. Do not write a competing bespoke component, or rename an original implementation as a library component.

Use the verified Watermelon primitives in client/src/components/ui, the pinned Motion Primitives, and Kokonut components first. Inspect the upstream implementation and license before importing another component. component-sources.json records the actual upstream path, commit and hashes. Update the provenance record and THIRD_PARTY_NOTICES.md when changing these files. Other existing Radix/shadcn primitives may be reused; they are not claims of source imported from the user's ten references.

Product-specific composition, routing, learning state, account integration, content and validators remain application code. Minimal React 18, Tailwind 3, router, accessibility and reduced-motion compatibility changes are permitted and must be documented. Preserve the upstream component structure and interaction contract where compatible. Do not install every reference library for the sake of using its name.

Keep the approved Direction A Learning Studio palette (approved 2026-09-11), original fox, all seven target languages, lesson IDs, account records, unlocked lessons and free access. Controls must be clear and comfortable across mouse, keyboard, touch and script input. Keep assessment screens still, remove outgoing examples immediately, and never reveal answers through motion or labels. Software tests and screenshots do not establish learning gains.

Do not publish an edited existing Site unless the user requests publishing that revision. Save a version for review. If the supported browser preview is blocked, report that limitation and leave browser visual and interaction checks explicitly outstanding.
