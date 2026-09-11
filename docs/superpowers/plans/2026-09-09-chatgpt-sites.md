# LingoMitra Sites migration

Goal: run the existing learning application on ChatGPT Sites, using ChatGPT identity for all learner data and no paid access restrictions.

Architecture: retain React, Wouter, the existing theme, mascots, and seven course libraries. Replace the Express/Postgres/session server with a Worker API preserving the frontend contracts. D1 owns user profiles, progress, learning reviews, tutor history, conversations, support submissions and blog records. R2 holds uploaded blog images. Build the course catalog from the tracked Markdown at build time.

- [ ] Add request-level tests using real SQLite for anonymous rejection, stable ChatGPT identity, no automatic email linking, cross-account isolation, full lesson access, completion validation, reset/deletion, and missing AI credentials.
- [ ] Replace app-owned login with dispatcher-owned top-level ChatGPT sign-in/sign-out. Never trust an account ID submitted by the browser. Prevent private API caching and cross-origin writes.
- [ ] Replace the runtime backend, generate and inspect D1 migrations, retain all lesson content, implement provider calls with server-only environment credentials and clear unavailable states.
- [ ] Remove lesson locks, subscription UI, billing endpoints, legacy password forms and Replit startup requirements. Preserve the visual design and learning flow.
- [ ] Verify the tests, type checking, and production build; save the exact source and publish the complete app.

Existing database content is not present in this repository. Do not manufacture prior progress or link legacy accounts by email. An authorized export and verified legacy-account mapping are required for a later historical data import. Admin grants require an explicit server-side allowlist or an existing admin, never first-visitor ownership. Model API credentials are independent of ChatGPT sign-in.
