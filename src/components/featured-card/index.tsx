import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DashboardArticle } from "@/lib/types";
import { isAllowedImageUrl } from "@/lib/utils/images";
import { timeAgo } from "@/lib/utils";

export function FeaturedCard({ article, badge }: { article: DashboardArticle; badge: string }) {
  const showImage = isAllowedImageUrl(article.imageUrl);
  const imageUrl = showImage ? article.imageUrl! : null;

  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-panel backdrop-blur-xl transition duration-300 hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10 opacity-80" />
      {imageUrl ? (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-white/10">
          <Image src={imageUrl} alt={article.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
            {badge}
          </span>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-100" />
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
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{article.sourceName}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
