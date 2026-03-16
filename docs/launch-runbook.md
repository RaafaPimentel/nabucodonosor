# Oraculum Launch Runbook

This runbook covers the production migration and secret rotation steps for Oraculum on Supabase and Vercel.

## 1. Preflight

Before changing production:

- Confirm the current branch builds locally with:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- Confirm the latest schema file is [supabase/schema.sql](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/supabase/schema.sql).
- Prepare a maintenance window if production traffic already exists.
- Ensure you have owner/admin access to:
  - Supabase project
  - Vercel project

## 2. Supabase Migration

Apply the latest SQL in this order:

1. Open the Supabase dashboard.
2. Go to `SQL Editor`.
3. Open [supabase/schema.sql](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/supabase/schema.sql).
4. Run the full script against the target project.

Expected changes include:

- `articles`
- `sync_runs`
- `feed_sources`
- `admin_users`
- `admin_sessions`
- `admin_login_attempts`
- `admin_audit_logs`
- RLS enabled on all tables

After the script runs, verify:

- all application tables exist
- indexes were created
- RLS is enabled for each table

Suggested SQL verification:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'articles',
    'sync_runs',
    'feed_sources',
    'admin_users',
    'admin_sessions',
    'admin_login_attempts',
    'admin_audit_logs'
  )
order by tablename;
```

## 3. Rotate Secrets

Rotate these values before launch:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `CRON_SECRET`

Rules:

- Use newly generated values, not reused old ones.
- Do not keep old service-role keys active longer than necessary.
- Store rotated secrets in your password manager or secret vault.

Recommended generation:

- `ADMIN_SESSION_SECRET`: at least 32 random bytes, base64 or hex encoded
- `CRON_SECRET`: at least 32 random bytes, base64 or hex encoded

Example local generation:

```bash
openssl rand -hex 32
```

## 4. Vercel Environment Update

In Vercel, update the project environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `CRON_SECRET`

Important:

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.
- Keep it only in server environments.
- Remove any old `SUPABASE_KEY` entry if it was previously used for the same purpose.

After updating env vars:

1. Trigger a redeploy in Vercel.
2. Confirm the deployment uses the new environment values.

## 5. Local Environment

There is no `.env.local` in this workspace currently.

If you want one locally, create it from [.env.example](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/.env.example):

```bash
cp .env.example .env.local
```

Then fill in:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
ADMIN_SESSION_SECRET=
```

## 6. Bootstrap Admin Access

Create the first admin user after the database migration and env setup:

```bash
npm run admin:create -- --username <admin-name> --password <strong-password> --role admin
```

Recommended:

- create at least two admin accounts
- store credentials securely
- use a unique password per account

Verify the admin tables after bootstrap:

```sql
select id, username, role, disabled_at, last_login_at
from public.admin_users
order by created_at asc;
```

## 7. Functional Verification

After deploy:

1. Open `/admin/login`
2. Sign in with the created admin user
3. Confirm `/admin` loads
4. Trigger a manual sync
5. Confirm:
   - `sync_runs` receives new rows
   - `admin_audit_logs` records login and sync activity
   - `admin_login_attempts` records the login event
6. Load `/api/news`
7. Confirm the homepage renders correctly

## 8. Security Verification

Check the following:

- admin cookie is `HttpOnly`
- admin cookie is `SameSite=Strict`
- security headers are present on `/admin` and `/api/admin/*`
- cross-origin POSTs to admin endpoints are rejected
- failed login attempts accumulate in `admin_login_attempts`
- disabling an admin user prevents future login
- `/api/news` returns `429` if aggressively spammed

## 9. Rollback

If deployment fails:

1. Revert the Vercel deployment to the last healthy release.
2. Restore the previous environment variables if needed.
3. Revoke any newly issued service-role key that should not remain active.
4. Inspect:
   - Vercel function logs
   - `admin_audit_logs`
   - `sync_runs`

## 10. Information Needed If You Want Me To Perform The Real Migration

If you want me to help execute the live migration, send one of these:

- the exact commands/tooling you use for Supabase and Vercel
- a local CLI workflow already authenticated on this machine
- the repo/environment process you want me to follow

Concretely, I would need access to:

- a Supabase migration path:
  - `supabase db push`, or
  - dashboard-only manual application, or
  - a SQL execution command you already use
- a Vercel env management path:
  - `vercel env` CLI already authenticated, or
  - manual dashboard-only update instructions

Without that, I can prepare and validate everything locally, but I cannot safely apply live infrastructure changes on your behalf.
