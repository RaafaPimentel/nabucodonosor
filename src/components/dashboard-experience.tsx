"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BookOpenText, Command, DatabaseZap, Pin, Radio, Search, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewsSection } from "@/components/news-section";
import { DashboardArticle, DashboardData } from "@/lib/types";
import { cn, formatTimestamp, timeAgo } from "@/lib/utils";

const PINBOARD_STORAGE_KEY = "oraculum-pinboard";
const VIEW_STORAGE_KEY = "oraculum-view";

export function DashboardExperience({ data }: { data: DashboardData }) {
  const [viewMode, setViewMode] = useState<"editorial" | "compact">("editorial");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [activeArticle, setActiveArticle] = useState<DashboardArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const allArticles = useMemo(
    () =>
      data.sections.flatMap((section) => [
        ...(section.featured ? [section.featured] : []),
        ...section.articles
      ]),
    [data.sections]
  );

  useEffect(() => {
    const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY) as "editorial" | "compact" | null;
    const storedPins = window.localStorage.getItem(PINBOARD_STORAGE_KEY);

    if (storedView) {
      setViewMode(storedView);
    }

    if (storedPins) {
      try {
        setPinnedIds(JSON.parse(storedPins));
      } catch {
        setPinnedIds([]);
      }
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        document.getElementById("dashboard-search")?.focus();
        return;
      }

      const visibleArticles = getVisibleArticles(data, searchQuery);
      const currentIndex = activeArticle ? visibleArticles.findIndex((article) => article.id === activeArticle.id) : -1;

      if (event.key === "j" && visibleArticles.length) {
        event.preventDefault();
        setActiveArticle(visibleArticles[Math.min(visibleArticles.length - 1, currentIndex + 1)] ?? visibleArticles[0]);
      }

      if (event.key === "k" && visibleArticles.length) {
        event.preventDefault();
        setActiveArticle(visibleArticles[Math.max(0, currentIndex - 1)] ?? visibleArticles[0]);
      }

      if (event.key === "Enter" && activeArticle) {
        event.preventDefault();
        setActiveArticle(activeArticle);
      }

      if (event.key === "Escape") {
        setActiveArticle(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeArticle, data, searchQuery]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data.sectionGroups;
    }

    return data.sectionGroups
      .map((group) => ({
        ...group,
        sections: group.sections
          .map((section) => ({
            ...section,
            featured:
              section.featured &&
              `${section.featured.title} ${section.featured.summary}`.toLowerCase().includes(query)
                ? section.featured
                : null,
            articles: section.articles.filter((article) => `${article.title} ${article.summary}`.toLowerCase().includes(query))
          }))
          .filter((section) => section.featured || section.articles.length)
      }))
      .filter((group) => group.sections.length);
  }, [data.sectionGroups, searchQuery]);

  const pinnedArticles = useMemo(
    () => pinnedIds.map((id) => allArticles.find((article) => article.id === id)).filter(Boolean) as DashboardArticle[],
    [allArticles, pinnedIds]
  );

  function toggleViewMode(mode: "editorial" | "compact") {
    setViewMode(mode);
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }

  function handleTogglePin(article: DashboardArticle) {
    setPinnedIds((current) => {
      const next = current.includes(article.id) ? current.filter((id) => id !== article.id) : [article.id, ...current].slice(0, 8);
      window.localStorage.setItem(PINBOARD_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

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
          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                Editorial signal, refreshed periodically
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Trusted coverage across AI, software, markets, gaming, streaming, and the builder economy.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                Oraculum ingests official feeds and ranked industry blogs, organizes them into a premium intelligence surface, and helps you move from scanning to understanding quickly.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <HeroStripCard title="Now" description={data.topSignals[0]?.title ?? "No live headline yet"} icon={<Radio className="h-4 w-4" />} />
                <HeroStripCard title="Important" description={data.briefing[0]?.whyThisMatters ?? "Daily briefing will appear here"} icon={<Sparkles className="h-4 w-4" />} />
                <HeroStripCard title="Watch" description={data.watchlist[0]?.name ?? "Pin recurring names to watch them"} icon={<Pin className="h-4 w-4" />} />
              </div>
            </div>
            <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleViewMode("editorial")}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
                      viewMode === "editorial" ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-300"
                    )}
                  >
                    Editorial
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleViewMode("compact")}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
                      viewMode === "compact" ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-300"
                    )}
                  >
                    Compact
                  </button>
                </div>
                <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-slate-400 sm:items-center sm:self-auto">
                  <Command className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />
                  <span>`/` search, `j/k` move, `esc` close</span>
                </div>
              </div>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="dashboard-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search the current intelligence surface"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/30"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.pulse.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-white">{item.label}</div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
                          item.tone === "hot"
                            ? "bg-rose-400/10 text-rose-200"
                            : item.tone === "steady"
                              ? "bg-cyan-400/10 text-cyan-200"
                              : "bg-slate-400/10 text-slate-300"
                        )}
                      >
                        {item.tone}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-panel backdrop-blur-xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Daily Briefing</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">If you read only five things today</h2>
              </div>
              <BookOpenText className="h-5 w-5 text-cyan-200/70" />
            </div>
            <div className="mt-5 grid gap-3">
              {data.briefing.map((item, index) => (
                <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-slate-300">
                      {index + 1}
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                      {item.badge}
                    </div>
                    <div className="text-xs text-slate-500">{item.sourceName}</div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.whyThisMatters}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-panel backdrop-blur-xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Pinboard</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Stories you want to keep on top</h2>
              </div>
              <Pin className="h-5 w-5 text-cyan-200/70" />
            </div>
            <div className="mt-5 grid gap-3">
              {pinnedArticles.length ? (
                pinnedArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-300/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">{article.title}</div>
                      <span className="text-xs text-slate-500">{timeAgo(article.publishedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{article.sourceName}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-10 text-sm text-slate-400">
                  Pin any article to keep a private watchlist here.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Top Signals</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Highest-priority stories across the dashboard</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              A cross-category shortlist ordered by freshness, source credibility, and topical signal strength.
            </p>
          </div>
          <div className={cn("grid gap-4", viewMode === "compact" ? "md:grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3")}>
            {data.topSignals.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setActiveArticle(article)}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 text-left shadow-panel transition hover:-translate-y-1 hover:border-cyan-300/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">{article.sourceName}</span>
                  <div className="flex items-center gap-2">
                    {article.freshnessLabel ? <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">{article.freshnessLabel}</span> : null}
                    <span className="text-xs text-slate-500">{timeAgo(article.publishedAt)}</span>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-7 text-white">{article.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{article.whyThisMatters}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{ width: `${Math.min(100, Math.round(article.relevanceScore * 100))}%` }} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-panel backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Explore</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Move across the editorial map quickly</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                Core coverage stays on top, while Market Intelligence and Builder Stack add higher-signal business and infrastructure coverage without turning the page into an undifferentiated feed.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-400">
              {data.sections.length} live sections
            </div>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {data.sectionGroups.map((group) => (
              <div key={group.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{group.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/80">{group.sections.length} sections</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{group.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.sections.map((section) => (
                    <Link
                      key={section.id}
                      href={`/#${section.id}`}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
                    >
                      {section.badge}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 space-y-16">
          {filteredGroups.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-28 space-y-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">{group.name}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{group.name}</h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-400">{group.description}</p>
              </div>
              <div className="space-y-14">
                {group.sections.map((section) => (
                  <NewsSection
                    key={section.id}
                    sectionId={section.id}
                    title={section.name}
                    description={section.description}
                    badge={section.badge}
                    featured={section.featured}
                    articles={section.articles}
                    compact={viewMode === "compact"}
                    selectedArticleId={activeArticle?.id ?? null}
                    pinnedIds={pinnedIds}
                    onOpenBriefing={setActiveArticle}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {activeArticle ? <ReadingPanel article={activeArticle} onClose={() => setActiveArticle(null)} /> : null}
    </main>
  );
}

function getVisibleArticles(data: DashboardData, query: string) {
  const articles = data.sections.flatMap((section) => [section.featured, ...section.articles].filter(Boolean) as DashboardArticle[]);
  if (!query.trim()) {
    return articles;
  }

  const normalized = query.trim().toLowerCase();
  return articles.filter((article) => `${article.title} ${article.summary}`.toLowerCase().includes(normalized));
}

function HeroStripCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/80">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function ReadingPanel({ article, onClose }: { article: DashboardArticle; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-4xl items-end px-4 py-6 lg:items-center">
        <div className="max-h-[90vh] w-full overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                {article.intelligenceTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{article.title}</h2>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
                <span>{article.sourceName}</span>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span>{timeAgo(article.publishedAt)}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
              Close
            </button>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <p className="text-base leading-8 text-slate-300">{article.summary || "Open the original source for the full article."}</p>
              <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/10 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/80">Why This Matters</p>
                <p className="mt-3 text-sm leading-7 text-cyan-50/90">{article.whyThisMatters}</p>
              </div>
              <Link href={article.url} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]">
                Open original reporting
              </Link>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Story Evolution</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div>First report: {timeAgo(article.publishedAt)}</div>
                  <div>Latest update: {article.relatedCoverage[0] ? timeAgo(article.relatedCoverage[0].publishedAt) : "No follow-up yet"}</div>
                  <div>{article.relatedCoverage.length} additional coverage links</div>
                </div>
              </div>
              {article.relatedCoverage.length ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">More coverage</p>
                  <div className="mt-3 space-y-2">
                    {article.relatedCoverage.map((item) => (
                      <Link key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block text-sm leading-6 text-slate-300 transition hover:text-cyan-100">
                        <span className="text-slate-500">{item.sourceName}</span>
                        <span className="mx-2 text-slate-600">/</span>
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  highlighted = false
}: {
  icon: React.ReactNode;
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
