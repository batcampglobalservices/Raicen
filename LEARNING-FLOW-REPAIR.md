# EduLearn learning-flow repair
Date: 31 October 2026
Project: /home/batombari/Documents/EduLearn

## Current status
The central learning journey has been rebuilt and exercised locally. Earlier statements that the whole product was complete were too broad. This report records the narrower, verified state of this repair.

## Problems confirmed in the prior implementation
- Topic selection opened repeated generic lesson text.
- Every topic used the same static mixed-subject quiz.
- Tutor practice links returned to the homepage without preparing a quiz.
- Refresh lost the selected flow and conversation.
- The account UI defaulted to a fictitious learner and attempted registration after failed login.
- Progress accepted client-supplied scores and displayed database identifiers.
- A plain user ID cookie was accepted as identity.
- The service worker cached pages too broadly and could retain old UI.
- The handmade topic map was attributed to Syllabus.ng without page-level source verification.

## Repaired journey
1. Homepage → /learn: choose from the four supported starter topics.
2. /learn → /tutor?topic=…: the selected topic carries through.
3. Tutor: receive real explanations and worked examples; optionally add notes.
4. Practice: generate five original questions from the topic, notes, discussion and suggested areas.
5. /practice?id=…: answer one question at a time, revisit answers, and refresh without losing selections.
6. Submit: server grades against private persisted keys in a transaction.
7. Review: see explanations and correct answers after submission.
8. Return to tutor: mistakes are placed into a review message draft.
9. /progress: authenticated results display real topic titles, dates and scores.

## Quality and recovery
- Rich teaching text renders through react-markdown with HTML disabled.
- Failed tutor requests restore the message for retry.
- Conversation, notes and drafts persist in the current browser tab.
- Practice generation has bounded timeouts and one correction attempt if independent AI review rejects the first set.
- Questions must contain four distinct options. Option order is shuffled on the server.
- A separate review request independently checks correctness and ambiguity before publication.
- Generated quiz keys and explanations are excluded from pre-submission responses.
- Practice ownership is checked using an unpredictable httpOnly browser cookie.
- Repeated submission returns the original result instead of creating another attempt.
- Guest results explicitly explain that they are not saved to an account.
- Account creation and sign-in are separate actions.
- Identity cookies are signed and expire. Forged plain user IDs are rejected.
- The old client-score write endpoint now rejects writes.
- Offline fallback is explicit; private API pages and learning pages are not cached.
- Mobile navigation stays visible. Keyboard focus follows the current practice question.

## Evidence
- Drizzle migration 0002_true_daredevil.sql applied successfully.
- Five Playwright browser tests passed: context and recovery; account/forged identity; quiz privacy/idempotency/refresh/review; mobile/guest progress; offline cache isolation.
- Lint, TypeScript checking, unit tests and production build passed during this repair.
- scripts/verify-live-flow.mjs passed against the actual local Groq-backed app, without mocked inference:
  real teaching → reviewed quiz → server grading → persisted progress → mobile tutor.
- An earlier live quiz contained two correct options. That run was rejected as quality evidence, and a separate review gate was introduced. The reviewer was also checked against that ambiguous example and correctly rejected it.
- The successful live run's five published questions were inspected for arithmetic and ambiguity.

## Limits and remaining work
- The catalog currently has four SSS 1 starter topics. It is not a complete national curriculum.
- The topic map is not a verified import of Syllabus.ng notes. Page-level provenance, permissions, edition/term mapping and teacher review are still needed.
- AI review reduces errors but is not proof of educational accuracy. A teacher-reviewed evaluation set is still required.
- Session restoration currently uses browser-tab storage; cross-device tutor history is not implemented.
- Production identity operations such as password recovery, email verification and server-side session revocation remain unfinished.
- The older study and fixed-score endpoints still exist for compatibility but are not used by the new student journey.
- Deployment has not been performed by this repair.

## Repeatable commands
From /home/batombari/Documents/EduLearn:
- pnpm db:migrate
- pnpm lint
- pnpm exec tsc --noEmit
- pnpm test
- pnpm e2e
- pnpm build
- BASE_URL=http://localhost:3003 node scripts/verify-live-flow.mjs

The live verification requires the configured Groq key, incurs inference usage and creates a uniquely named verification account. Automated browser tests use isolated fixtures for inference while exercising real database grading and account APIs.

