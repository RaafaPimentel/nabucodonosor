import { redirect } from "next/navigation";
import { formatTimestamp } from "@/lib/utils";
import { getAdminDashboardData } from "@/lib/admin";
import { hasRequiredRole, requireAdminSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const data = await getAdminDashboardData();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#050816_0%,_#030712_100%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-panel backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Oraculum operations console</h1>
            <p className="mt-2 text-sm text-slate-400">
              Signed in as {session.user.username} with role {session.user.role}. Review pipeline health and trigger manual syncs.
            </p>
          </div>
          <div className="flex gap-3">
            {hasRequiredRole(session.user.role, "operator") ? (
              <form action="/api/admin/sync" method="post">
                <button className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15">
                  Run manual sync
                </button>
              </form>
            ) : null}
            <form action="/api/admin/logout" method="post">
              <button className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {data.categoryCards.map((card) => (
            <div key={card.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">{card.badge}</div>
              <div className="mt-4 text-3xl font-semibold">{card.count}</div>
              <div className="mt-2 text-sm text-slate-400">{card.title}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Ingestion status</h2>
            <p className="mt-2 text-sm text-slate-400">State-changing admin actions require same-origin POSTs and are audit logged.</p>
            <div className="mt-5 grid gap-3">
              {data.providerSummary.map((run) => (
                <div key={`${run.provider}-${run.id}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div>
                    <div className="font-medium">{run.provider}</div>
                    <div className="text-sm text-slate-400">{formatTimestamp(run.startedAt)}</div>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Recent failures and partial runs</h2>
            <div className="mt-5 grid gap-3">
              {data.latestFailures.length ? (
                data.latestFailures.map((run) => (
                  <div key={run.id} className="rounded-2xl border border-amber-300/10 bg-amber-300/5 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{run.provider}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-amber-100">{run.status}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">{formatTimestamp(run.startedAt)}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{run.errorLog || "No error message recorded."}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                  No recent degraded runs.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Admin users</h2>
            <p className="mt-2 text-sm text-slate-400">Only admins can disable or re-enable accounts. You cannot disable your own account here.</p>
            <div className="mt-5 grid gap-3">
              {data.adminUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                  <div>
                    <div className="font-medium text-white">{user.username}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {user.role} {user.disabledAt ? "• disabled" : "• active"}
                    </div>
                  </div>
                  {hasRequiredRole(session.user.role, "admin") && user.id !== session.user.id ? (
                    <form action="/api/admin/users/toggle" method="post">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="disabled" value={user.disabledAt ? "false" : "true"} />
                      <button className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]">
                        {user.disabledAt ? "Enable" : "Disable"}
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {user.id === session.user.id ? "Current user" : "Restricted"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">Audit log</h2>
            <p className="mt-2 text-sm text-slate-400">Recent administrative activity, including logins and operational changes.</p>
            <div className="mt-5 grid gap-3">
              {data.auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{log.action}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{formatTimestamp(log.createdAt)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{log.resource}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    user: {log.userId ?? "system"} • ip: {log.ipAddress ?? "unknown"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
