import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DashboardArticle } from "@/lib/types";
import { isAllowedImageUrl } from "@/lib/utils/images";
import { timeAgo } from "@/lib/utils";

export function ArticleCard({ article, badge }: { article: DashboardArticle; badge: string }) {
  const showImage = isAllowedImageUrl(article.imageUrl);
  const imageUrl = showImage ? article.imageUrl! : null;

  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-panel backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
          {badge}
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-cyan-200" />
      </div>
      {imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={imageUrl} alt={article.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-base font-semibold leading-6 text-white">{article.title}</h3>
        <p className="text-sm leading-6 text-slate-300">{article.summary || "Open the original reporting for the full story."}</p>
        {article.intelligenceTags.length ? (
          <div className="flex flex-wrap gap-2">
            {article.intelligenceTags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <p className="text-xs leading-5 text-slate-400">{article.whyThisMatters}</p>
        {article.signalSummary ? <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">{article.signalSummary}</p> : null}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{article.sourceName}</span>
        <span>{timeAgo(article.publishedAt)}</span>
      </div>
    </Link>
  );
}
