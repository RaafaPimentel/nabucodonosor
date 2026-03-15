import { countAdminUsers } from "@/lib/db/admin-auth";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ reason?: string; error?: string }>;
}) {
  const params = await searchParams;
  const adminCount = await countAdminUsers().catch(() => 0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#050816_0%,_#030712_100%)] px-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-panel backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Oraculum Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {adminCount
            ? "Use an admin user stored in Supabase to access the internal console."
            : "No admin users exist yet. Bootstrap one with `npm run admin:create -- --username <name> --password <password> --role admin>`."}
        </p>
        {params.error ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{params.error}</p> : null}
        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Username</span>
            <input
              name="username"
              type="text"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 outline-none transition focus:border-cyan-300/40"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Password</span>
            <input
              name="password"
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 outline-none transition focus:border-cyan-300/40"
              required
            />
          </label>
          <button className="w-full rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
