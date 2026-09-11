# Learning Studio implementation

Direction A was approved by the user on 11 September 2026. This supersedes the earlier cool neutral visual direction. Source baseline: c6a1e72ea6448b19526f5cf1020a892939a0106e, deployed version 7. Work takes place in an isolated checkout. Save a review version; do not publish or apply live migrations.

## First integrated slice

Deliver the approved Today composition, a centered sentence workspace, a real Words collection and a Practice destination across German, Spanish, French, Hindi, Mandarin, Japanese and Kannada. Retain every existing course, lesson ID, route, fox asset, authentication path and progress record. Preserve optional conversation, notes and pronunciation features. No new dependency or animation system is needed.

Words reuses the design package's 118 source-derived sense records. Its initial practice bank uses concrete, source-matched words with existing authored contexts. New exercises remain pending qualified language review. This slice adds word recognition and lexical retrieval followed by a sentence from its source lesson. It does not claim to implement all proposed exercise families, certify the draft banks, assess pronunciation, or establish spontaneous proficiency.

## Changes and checks

1. Update `DESIGN.md`, `AGENTS.md`, `client/src/approved-visuals.css`, Today and LessonWorkspace. Compose the existing Watermelon Button, Card, Alert, Input, Select, Dialog and navigation primitives. Keep source-import files intact; document product composition in the existing provenance notes. Use warm paper, forest ink, restrained terracotta actions, serif display headings and system text with intact script marks. One next lesson, compact review rows, four destinations: Today, Learn, Practice, Words. Verify the actual rendered desktop and mobile states if the supported preview permits access.
2. Add `shared/words.ts`, a server-only sense registry and practice builder in `worker/`, and `worker/words.ts` routes. Read encountered words from pinned lesson steps and saved events, without converting old completion into mastery. Bookmark preferences use atomic, owner-scoped JSON updates. Viewing words/examples records exposure. Every practice uses the existing session, draft, event and scheduling pipeline. Add no SQL schema migration.
3. Extend the public step allowlist with a lexical-task discriminator; never expose private variants or semantic keys before assessment. Record lexical recall separately from independent sentence construction. Delayed recall requires at least 24 hours since the relevant exposure and no current support. Immediate repetition does not lengthen the interval. Unrecognized alternatives remain unassessed, not failed proficiency. Correct the reproduced German article bug in the checker without rewriting historical evidence.
4. Add Words and Practice routes, language scope and protected-route handling. Queries are owner/language scoped. Successful lesson saves invalidate all affected projections. Show loading, empty, no-due, unavailable, saved and retry states; keep drafts and IME composition intact.
5. Before behavior changes, add real SQLite/API regression tests for account isolation, atomic bookmarks, exposure versus recall, no answer leakage, all-seven-language word-to-context-to-return flows, immediate versus delayed scheduling, and the German invalid-article case. Baseline: 48 tests pass. Run targeted failures, implement, then run the complete suite, TypeScript and client/Worker build. Audit lesson IDs, fox files, dependencies and migration files against the baseline.
6. Save the exact reviewed commit and a Sites review version without publication. Record browser limitations and remaining content/evaluation gates explicitly. No live database is needed for these checks.

## Approval gates retained

Publication and any live migration require a separate user instruction. Qualified language review, real-device IME/screen-reader checks and learner evaluation remain necessary before making release-readiness or learning-gain claims. The remaining exercise families, audio assets, sense/form tagging and calibrated scheduler are subsequent implementation work, not silently completed by this slice.
