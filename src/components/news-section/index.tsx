"use client";

import { ArticleCard } from "@/components/article-card";
import { FeaturedCard } from "@/components/featured-card";
import { DashboardArticle } from "@/lib/types";

export function NewsSection({
  sectionId,
  title,
  description,
  badge,
  featured,
  articles,
  compact = false,
  selectedArticleId,
  pinnedIds = [],
  onOpenBriefing,
  onTogglePin
}: {
  sectionId: string;
  title: string;
  description: string;
  badge: string;
  featured: DashboardArticle | null;
  articles: DashboardArticle[];
  compact?: boolean;
  selectedArticleId?: string | null;
  pinnedIds?: string[];
  onOpenBriefing?: (article: DashboardArticle) => void;
  onTogglePin?: (article: DashboardArticle) => void;
}) {
  return (
    <section id={sectionId} className="scroll-mt-36 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">{badge}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
        </div>
        <div className="max-w-2xl space-y-2 text-sm leading-7 text-slate-400">
          <p>{description}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {featured ? 1 + articles.length : articles.length} editorial picks
          </p>
        </div>
      </div>
      {featured ? (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.95fr]">
          <FeaturedCard
            article={featured}
            badge={badge}
            compact={compact}
            selected={selectedArticleId === featured.id}
            pinned={pinnedIds.includes(featured.id)}
            onOpenBriefing={onOpenBriefing}
            onTogglePin={onTogglePin}
          />
          <div className="grid gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                badge={badge}
                compact={compact}
                selected={selectedArticleId === article.id}
                pinned={pinnedIds.includes(article.id)}
                onOpenBriefing={onOpenBriefing}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          No articles available yet for this section. The next sync will populate it once matching feeds produce valid stories.
        </div>
      )}
    </section>
  );
}
