# EduLearn

EduLearn is a Next.js App Router learning experience for Nigerian secondary students. The current build includes the public landing page, curriculum explorer, study-mode lesson view, quiz flow with server-independent deterministic scoring in the UI, progress view, responsive styling, metadata, manifest, icon, and robots route.

## Run locally

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm build
```

## Deploying to Vercel

The Docker database used locally is reachable only from your computer. A Vercel Function **cannot** connect to `localhost`, `127.0.0.1`, or the local Docker hostname. Before deploying, configure these Production environment variables in Vercel:

```text
DATABASE_URL=<managed PostgreSQL connection URL, including sslmode=require when supplied>
AUTH_SECRET=<a new long random secret, e.g. generated with openssl rand -base64 48>
GROQ_API_KEY=<your Groq server API key>
```

Use a managed Postgres provider that Vercel can access (for example Vercel Postgres/Neon or Supabase), then apply every SQL file in `drizzle/` to that database in order before testing signup. `DATABASE_URL` and `AUTH_SECRET` are mandatory in Production; the local file store is deliberately disabled there. Never place these values in a `NEXT_PUBLIC_*` variable.

The account routes return a safe JSON `503` if that service is misconfigured or unavailable; inspect Vercel **Functions** logs for the exact connection/configuration cause.
