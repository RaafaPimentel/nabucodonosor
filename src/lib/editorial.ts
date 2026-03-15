import { ArticleRecord, DashboardArticle, NewsCategory, NewsCategoryId, SourceDiversityEntry, WatchlistEntry } from "@/lib/types";

const watchlistDictionary = [
  "OpenAI",
  "NVIDIA",
  "Microsoft",
  "Apple",
  "Meta",
  "Sony",
  "Nintendo",
  "Netflix",
  "Disney",
  "IMF",
  "Fed",
  "Anthropic",
  "Amazon",
  "Google",
  "Tesla",
  "Steam",
  "PlayStation",
  "Xbox"
];

const crossCategoryPatterns: Array<{ label: string; terms: string[] }> = [
  { label: "AI x Markets", terms: ["ai", "artificial intelligence", "nvidia", "openai", "market", "finance", "economy"] },
  { label: "Gaming x Streaming", terms: ["gaming", "game", "streaming", "netflix", "disney", "playstation", "xbox"] },
  { label: "Policy", terms: ["regulation", "policy", "government", "lawmakers", "antitrust", "fed", "imf"] },
  { label: "Chips", terms: ["chip", "semiconductor", "nvidia", "gpu", "foundry"] },
  { label: "Open Source", terms: ["open source", "github", "linux", "framework", "rust", "python"] }
];

export function buildWhyThisMatters(article: ArticleRecord, category: NewsCategory) {
  const [sourceSignal, recencySignal, topicSignal] = article.signalSummary.split(" • ");
  const topic = topicSignal ? topicSignal.toLowerCase() : "strong topical relevance";
  const recency = recencySignal ? recencySignal.toLowerCase() : "fresh coverage";
  const source = sourceSignal ? sourceSignal.toLowerCase() : "high-signal sourcing";

  return `${category.badge} signal: ${topic}, backed by ${source}, with ${recency}.`;
}

function getText(article: ArticleRecord) {
  return `${article.title} ${article.summary}`.toLowerCase();
}

export function extractWatchlistEntities(article: ArticleRecord) {
  const text = getText(article);
  return watchlistDictionary.filter((entity) => text.includes(entity.toLowerCase()));
}

export function buildIntelligenceTags(article: ArticleRecord, category: NewsCategory) {
  const text = getText(article);
  const tags = new Set<string>([category.badge]);

  for (const pattern of crossCategoryPatterns) {
    const matches = pattern.terms.filter((term) => text.includes(term)).length;
    if (matches >= 2) {
      tags.add(pattern.label);
    }
  }

  if (article.sourceDomain.endsWith(".org")) {
    tags.add("Institutional");
  }

  if (text.includes("earnings") || text.includes("revenue") || text.includes("profit")) {
    tags.add("Business");
  }

  return Array.from(tags).slice(0, 4);
}

export function toDashboardArticle(article: ArticleRecord, category: NewsCategory): DashboardArticle {
  return {
    ...article,
    whyThisMatters: buildWhyThisMatters(article, category),
    intelligenceTags: buildIntelligenceTags(article, category),
    watchlistEntities: extractWatchlistEntities(article)
  };
}

export function buildWatchlist(entries: DashboardArticle[]): WatchlistEntry[] {
  const grouped = new Map<string, DashboardArticle[]>();

  for (const article of entries) {
    for (const entity of article.watchlistEntities) {
      const current = grouped.get(entity) ?? [];
      current.push(article);
      grouped.set(entity, current);
    }
  }

  return Array.from(grouped.entries())
    .map(([name, articles]) => ({
      name,
      articleCount: articles.length,
      latestPublishedAt: articles
        .map((article) => article.publishedAt)
        .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]!,
      articles: articles
        .sort((left, right) => right.relevanceScore - left.relevanceScore)
        .slice(0, 3)
    }))
    .sort((left, right) => {
      if (right.articleCount !== left.articleCount) {
        return right.articleCount - left.articleCount;
      }

      return new Date(right.latestPublishedAt).getTime() - new Date(left.latestPublishedAt).getTime();
    })
    .slice(0, 8);
}

export function buildSourceDiversity(entries: DashboardArticle[]): SourceDiversityEntry[] {
  const grouped = new Map<string, SourceDiversityEntry>();

  for (const article of entries) {
    const key = `${article.sourceDomain}|${article.sourceName}`;
    const current = grouped.get(key);
    if (current) {
      current.articleCount += 1;
      if (!current.categories.includes(article.category)) {
        current.categories.push(article.category);
      }
      continue;
    }

    grouped.set(key, {
      sourceName: article.sourceName,
      sourceDomain: article.sourceDomain,
      articleCount: 1,
      categories: [article.category as NewsCategoryId]
    });
  }

  return Array.from(grouped.values())
    .sort((left, right) => right.articleCount - left.articleCount)
    .slice(0, 8);
}
