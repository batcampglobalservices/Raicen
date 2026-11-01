# EduLearn Tutor Implementation

## What it does

The Tutor is available at `/tutor`. It provides a guided conversation for a selected secondary-school topic.

For each learner message it can:

- Explain one idea at a time.
- Ask a targeted follow-up question.
- Detect likely difficulty areas from the conversation.
- Track readiness as `starting`, `building`, or `ready`.
- Recommend a focused quiz plan with a question count and focus areas.
- Continue the conversation with context from previous messages.

## Runtime flow

1. The learner selects a topic.
2. The tutor sends the conversation, topic, and class level to `/api/tutor`.
3. The server validates every message and bounds the conversation length.
4. Groq returns a structured response through the Vercel AI SDK and Zod.
5. The UI displays the teaching reply, difficulty signals, readiness, and suggested next question.
6. The learner can accept the suggested question or write a new one.
7. The learner can move to a focused quiz setup from the insight panel.

## Safety and quality behavior

- API keys remain server-side.
- Messages are size-limited and validated.
- The tutor is instructed not to shame learners or reveal answers without explanation.
- Inference errors return a safe retry message.
- When Groq is unavailable, the development fallback still demonstrates the teaching loop and difficulty detection.

## Files

- `src/app/tutor/page.tsx` — interactive tutor interface.
- `src/app/tutor/tutor.css` — tutor-specific visual system.
- `src/app/api/tutor/route.ts` — structured tutor API.

## Verification

The real local Groq-backed tutor endpoint was tested with an Algebra difficulty question and returned:

- `source: groq`
- `readiness: starting`
- Multiple detected difficulty areas.

The endpoint is ready for the next iteration: persist tutor sessions and difficulty signals to PostgreSQL, then use those signals to generate the quiz questions themselves rather than only preparing the quiz plan.
