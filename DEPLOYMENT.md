# Deployment checklist

1. Create separate Vercel preview and production projects.
2. Configure `DATABASE_URL` with the Supabase pooled runtime connection and use a direct migration connection for release jobs.
3. Configure `AUTH_SECRET` with a rotated high-entropy secret and `GROQ_API_KEY` only as server-side secrets.
4. Run `pnpm db:migrate` against the target database, then `pnpm db:seed` only for an approved empty environment.
5. Run `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm e2e` against the release candidate.
6. Verify `/api/health`, security headers, authentication, quiz scoring, progress persistence, and PWA installability.
7. Record migration ID, deployment URL, rollback target, and release owner.

Never place database credentials, `AUTH_SECRET`, or `GROQ_API_KEY` in client-exposed variables.
