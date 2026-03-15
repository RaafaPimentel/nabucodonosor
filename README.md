# Oraculum

Oraculum is a premium full-stack technology intelligence dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase. It ingests articles from multiple news APIs through a provider adapter architecture, normalizes and deduplicates them, ranks them, and renders an editorial homepage backed by PostgreSQL.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Vercel Cron
- Protected internal admin console

## Project Structure

```text
src/
  agents/
    ingestion-agent/
    processing-agent/
    ranking-agent/
  app/
    api/
      news/
      sync/
  components/
    article-card/
    featured-card/
    news-section/
  jobs/
    news-sync-job/
  lib/
    db/
    utils/
  providers/
    currents-provider/
    gnews-provider/
    newsapi-provider/
    newscatcher-provider/
  skills/
    dedupe-articles/
    normalize-article/
    score-article/
supabase/
  schema.sql
```

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the API keys and Supabase credentials.
3. Create the database tables by running the SQL in [supabase/schema.sql](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/supabase/schema.sql).
4. Start the app with `npm run dev`.
5. Trigger an initial sync with `npm run sync:news` or `GET /api/sync`.
6. Create the first admin user with `npm run admin:create -- --username <name> --password <password> --role admin`.

## Environment Variables

```bash
NEWS_API_KEY=
GNEWS_API_KEY=
NEWSCATCHER_API_KEY=
CURRENTS_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
ADMIN_SESSION_SECRET=
```

## Sync Flow

1. `NewsIngestionAgent` fetches provider data for each editorial category.
2. `ContentProcessingAgent` normalizes input and filters low-quality or off-domain articles.
3. `Deduplication Skill` removes duplicates using canonical URL and normalized title hash.
4. `NewsRankingAgent` assigns a relevance score using recency, keyword match, and source credibility.
5. Articles are upserted into Supabase and each provider run is written to `sync_runs`.

Each ranked article now also stores a `signal_summary` string so the UI can explain why a story is elevated.

## Provider Adapter

Each provider implements the same interface:

```ts
interface ProviderAdapter {
  name: string;
  getArticles(category: NewsCategory, keywords: string[], limit: number): Promise<ProviderArticle[]>;
}
```

The frontend only reads from the database through the internal data layer and never calls news providers directly.

## Deployment

- Deploy the app to Vercel.
- Add the same environment variables to Vercel.
- Keep [vercel.json](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/vercel.json) so `/api/sync` runs every 5 minutes.
- Point the project at a Supabase PostgreSQL instance.

## Admin

- Create users in Supabase-backed admin tables with `npm run admin:create -- --username <name> --password <password> --role admin`.
- Visit `/admin/login` and sign in with that stored account.
- The admin console shows per-category inventory, latest provider status, degraded runs, and a manual sync trigger.
- Route protection is enforced by [middleware.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/middleware.ts).

## Security Notes

- Admin sessions are stored server-side in PostgreSQL and signed in an `HttpOnly` cookie with `SameSite=Strict`.
- Admin login attempts are rate-limited using persisted attempt history in the database.
- Admin logins, logouts, and manual sync triggers are written to audit logs.
- Admin POST routes enforce same-origin requests and middleware attaches baseline security headers.
- Row Level Security is enabled on all application tables; this app expects a server-side Supabase service-role key and does not expose direct browser DB access.
- The public `/api/news` JSON endpoint has a lightweight IP-based rate limit.
- Apply the updated SQL in [supabase/schema.sql](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/supabase/schema.sql) before using the hardened admin flow.

## Launch Checklist

- Use a distinct `SUPABASE_SERVICE_ROLE_KEY` only on the server and never expose it to the browser.
- Rotate `ADMIN_SESSION_SECRET`, `CRON_SECRET`, and provider API keys before production launch.
- Create at least two admin accounts so one disabled or lost account does not lock you out.
- Review `admin_audit_logs` and `admin_login_attempts` tables regularly.
- Restrict who can call `/api/sync` and prefer Vercel cron plus a secret header only.
- Confirm your Vercel project does not expose server env vars to the client bundle.
- Keep CSP reviewed if you later add third-party scripts, analytics, or external font/CDN assets.
- Follow the full launch runbook in [docs/launch-runbook.md](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/docs/launch-runbook.md).

## Testing

- Run `npm test` for unit tests covering normalization, deduplication, and scoring behavior.

## Allowed Domains Seed

The editorial domain seed configuration lives in [src/lib/config.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/lib/config.ts).

It maps trusted domains per category and is used by the processing and ranking stages.
