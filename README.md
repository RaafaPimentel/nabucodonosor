# Oraculum

Oraculum is a full-stack technology intelligence dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase. It ingests articles through an official RSS/Atom feed adapter architecture, normalizes and deduplicates them, ranks them, and renders an editorial homepage backed by PostgreSQL.

Paid news APIs remain optional future extensions. They are no longer required core dependencies for the MVP.

The editorial surface now covers the original core sections plus expanded intelligence topics such as Product, DevOps & Cloud, Data & Analytics, Fintech, and Crypto & Digital Assets.

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
    classification-agent/
    feed-health-agent/
    feed-ingestion-agent/
    ingestion-agent/
    processing-agent/
    ranking-agent/
    source-registry-agent/
  app/
    api/
      news/
      sync/
  components/
    article-card/
    featured-card/
    news-section/
  feeds/
    rss-feed-adapter/
  jobs/
    news-sync-job/
  lib/
    db/
    utils/
  skills/
    dedupe-articles/
    normalize-article/
    score-article/
supabase/
  schema.sql
```

See [docs/rss-agent-migration.md](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/docs/rss-agent-migration.md) for the RSS-first agent split and migration sequence.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the Supabase credentials and admin secrets.
3. Create the database tables by running the SQL in [supabase/schema.sql](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/supabase/schema.sql).
4. Start the app with `npm run dev`.
5. Trigger an initial sync with `npm run sync:news` or `GET /api/sync`.
6. Create the first admin user with `npm run admin:create -- --username <name> --password <password> --role admin`.

## Environment Variables

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
ADMIN_SESSION_SECRET=

# Optional future extensions
NEWS_API_KEY=
GNEWS_API_KEY=
NEWSCATCHER_API_KEY=
CURRENTS_API_KEY=
```

## Sync Flow

1. `SourceRegistryAgent` selects enabled official feeds for the sync.
2. `FeedIngestionAgent` fetches RSS/Atom items source by source through the feed adapter.
3. `ClassificationAgent` maps broad feeds into the internal editorial categories when needed.
4. `ContentProcessingAgent` normalizes input and filters low-quality or off-domain articles.
5. `Deduplication Skill` removes duplicates using canonical URL and normalized title hash.
6. `NewsRankingAgent` assigns a relevance score using recency, keyword match, and source credibility.
7. Articles are upserted into Supabase, configured feed sources are synced into `feed_sources`, and each ingestion run is written to `sync_runs`.

Each ranked article now also stores a `signal_summary` string so the UI can explain why a story is elevated.

## Feed Adapter

Each feed adapter implements the same interface:

```ts
interface FeedAdapter {
  name: string;
  getFeedItems(source: FeedSource, limit: number): Promise<FeedItem[]>;
}
```

The frontend only reads from the database through the internal data layer and never calls external feeds directly.

## Free-Tier Mode

- The project is configured by default to use curated official RSS/Atom feeds only.
- Vercel cron is disabled by default so the project works on the Hobby plan without paid scheduling.
- Sync is expected to be triggered manually from the admin console or via `npm run sync:news`.
- Homepage/API revalidation is reduced to every 30 minutes.
- This keeps the project usable without paying for third-party news APIs, but it should be treated as a periodically updated prototype rather than a real-time terminal.

## Deployment

- Deploy the app to Vercel.
- Add the same environment variables to Vercel.
- In the default free-tier mode, use the admin console or `npm run sync:news` for manual syncs instead of Vercel cron.
- Point the project at a Supabase PostgreSQL instance.
- Apply the latest [supabase/schema.sql](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/supabase/schema.sql) so the `feed_sources` table exists.

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
- On Vercel Hobby, do not depend on cron. Use manual/admin-triggered syncs or an external free scheduler if needed later.
- Confirm your Vercel project does not expose server env vars to the client bundle.
- Keep CSP reviewed if you later add third-party scripts, analytics, or external font/CDN assets.
- Follow the full launch runbook in [docs/launch-runbook.md](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/docs/launch-runbook.md).

## Testing

- Run `npm test` for unit tests covering normalization, deduplication, and scoring behavior.

## Allowed Domains Seed

The editorial domain seed configuration and the official feed source registry live in [src/lib/config.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/lib/config.ts).

It maps trusted domains per category and defines the enabled RSS/Atom sources used by the sync job.
