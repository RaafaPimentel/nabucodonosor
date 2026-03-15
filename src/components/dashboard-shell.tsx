import type { ReactNode } from "react";
import { Activity, DatabaseZap, Radio, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewsSection } from "@/components/news-section";
import { getDashboardData } from "@/lib/news";
import { formatTimestamp } from "@/lib/utils";

export async function DashboardShell() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,_#08101d_0%,_#030712_46%,_#02040a_100%)] text-ink">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10">
        <header className="sticky top-4 z-20 mb-12 rounded-[2rem] border border-white/10 bg-slate-950/55 px-5 py-4 shadow-panel backdrop-blur-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/80">Oraculum</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Global technology intelligence dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatPill icon={<Radio className="h-4 w-4" />} label="Last updated" value={formatTimestamp(data.stats.lastUpdatedAt)} />
              <StatPill icon={<Activity className="h-4 w-4" />} label="Sync status" value={data.stats.syncStatus} highlighted={data.stats.syncStatus === "Healthy"} />
              <StatPill icon={<DatabaseZap className="h-4 w-4" />} label="Sources processed" value={String(data.stats.sourcesProcessed)} />
              <StatPill icon={<ShieldCheck className="h-4 w-4" />} label="Fallback mode" value={data.stats.syncStatus === "Healthy" ? "Nominal" : "Provider degraded"} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] px-6 py-8 shadow-panel backdrop-blur-xl lg:px-8 lg:py-10">
          <div className="absolute inset-0 bg-hero-grid bg-[size:36px_36px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-blue-400/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                Editorial signal, refreshed every 5 minutes
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Trusted coverage across AI, software, markets, gaming, and streaming.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                Oraculum ingests reputable global reporting through interchangeable news providers, normalizes and scores each story, and keeps a live front page sourced from the database.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-400">
                Each featured story carries a signal summary combining source credibility, recency, and topical relevance.
              </p>
            </div>
            <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5">
              {data.stats.latestRuns.length ? (
                data.stats.latestRuns.slice(0, 4).map((run) => (
                  <div key={run.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-white">{run.provider}</p>
                      <p className="text-slate-400">{formatTimestamp(run.startedAt)}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                      {run.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm leading-7 text-slate-400">
                  No sync history yet. Add provider API keys and Supabase credentials, then call `/api/sync` to seed the dashboard.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-12 space-y-14">
          {data.sections.map((section) => (
            <NewsSection
              key={section.id}
              title={section.name}
              description={section.description}
              badge={section.badge}
              featured={section.featured}
              articles={section.articles}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function StatPill({
  icon,
  label,
  value,
  highlighted = false
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm backdrop-blur-xl ${
        highlighted
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
          : "border-white/10 bg-white/[0.05] text-slate-200"
      }`}
    >
      {icon}
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
