"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Expand, Pin } from "lucide-react";
import { DashboardArticle } from "@/lib/types";
import { isAllowedImageUrl } from "@/lib/utils/images";
import { cn, timeAgo } from "@/lib/utils";

export function FeaturedCard({
  article,
  badge,
  compact = false,
  selected = false,
  pinned = false,
  onOpenBriefing,
  onTogglePin
}: {
  article: DashboardArticle;
  badge: string;
  compact?: boolean;
  selected?: boolean;
  pinned?: boolean;
  onOpenBriefing?: (article: DashboardArticle) => void;
  onTogglePin?: (article: DashboardArticle) => void;
}) {
  const showImage = isAllowedImageUrl(article.imageUrl);
  const imageUrl = showImage ? article.imageUrl! : null;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border bg-slate-950/70 shadow-panel backdrop-blur-xl transition duration-300 hover:-translate-y-1",
        compact ? "p-4" : "p-6",
        selected ? "border-cyan-300/40 ring-1 ring-cyan-300/20" : "border-white/10"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10 opacity-80" />
      {imageUrl && !compact ? (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-white/10">
          <Image src={imageUrl} alt={article.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
              {badge}
            </span>
            {article.freshnessLabel ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                {article.freshnessLabel}
              </span>
            ) : null}
            {article.isDeveloping ? (
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                Developing
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {onTogglePin ? (
              <button
                type="button"
                onClick={() => onTogglePin(article)}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08]"
                aria-label="Toggle pin"
              >
                <Pin className={cn("h-4 w-4", pinned ? "fill-current text-cyan-100" : "")} />
              </button>
            ) : null}
            {onOpenBriefing ? (
              <button
                type="button"
                onClick={() => onOpenBriefing(article)}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08]"
                aria-label="Open briefing"
              >
                <Expand className="h-4 w-4" />
              </button>
            ) : null}
            <Link href={article.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08]">
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-100" />
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="max-w-2xl text-2xl font-semibold tracking-tight text-white">{article.title}</h3>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            {article.summary || "A prioritized briefing selected from the latest trusted coverage."}
          </p>
          {article.intelligenceTags.length ? (
            <div className="flex flex-wrap gap-2">
              {article.intelligenceTags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Why This Matters</p>
            <p className="max-w-2xl text-sm leading-6 text-cyan-100/80">{article.whyThisMatters}</p>
          </div>
          {article.signalSummary ? (
            <p className="max-w-2xl text-xs uppercase tracking-[0.2em] text-cyan-100/75">{article.signalSummary}</p>
          ) : null}
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{ width: `${Math.min(100, Math.round(article.relevanceScore * 100))}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{article.sourceName}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
        {article.relatedCoverage.length ? (
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">More Coverage</p>
            <div className="mt-3 space-y-2">
              {article.relatedCoverage.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm leading-6 text-slate-300 transition hover:text-cyan-100"
                >
                  <span className="text-slate-500">{item.sourceName}</span>
                  <span className="mx-2 text-slate-600">/</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
