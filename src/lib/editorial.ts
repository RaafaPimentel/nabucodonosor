import { feedSources } from "@/lib/config";
import {
  ArticleRecord,
  DashboardArticle,
  DailyBriefingItem,
  FeedSourceTier,
  NewsCategory,
  NewsCategoryId,
  PulseMetric,
  SourceDiversityEntry,
  WatchlistEntry
} from "@/lib/types";
import { normalizeTitle } from "@/lib/utils/hash";

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
  "Xbox",
  "Stripe",
  "Coinbase",
  "Circle",
  "Visa",
  "Mastercard",
  "Databricks",
  "Snowflake",
  "Bitcoin",
  "Ethereum"
];

const crossCategoryPatterns: Array<{ label: string; terms: string[] }> = [
  { label: "AI x Markets", terms: ["ai", "artificial intelligence", "nvidia", "openai", "market", "finance", "economy"] },
  { label: "Gaming x Streaming", terms: ["gaming", "game", "streaming", "netflix", "disney", "playstation", "xbox"] },
  { label: "Policy", terms: ["regulation", "policy", "government", "lawmakers", "antitrust", "fed", "imf"] },
  { label: "Chips", terms: ["chip", "semiconductor", "nvidia", "gpu", "foundry"] },
  { label: "Open Source", terms: ["open source", "github", "linux", "framework", "rust", "python"] },
  { label: "Fintech", terms: ["payments", "fintech", "banking", "stripe", "visa", "mastercard", "block"] },
  { label: "Digital Assets", terms: ["bitcoin", "ethereum", "stablecoin", "crypto", "digital assets", "tokenization"] },
  { label: "Cloud", terms: ["cloud", "aws", "azure", "google cloud", "kubernetes", "devops", "sre"] },
  { label: "Data", terms: ["data", "analytics", "warehouse", "databricks", "snowflake", "vector database", "etl"] }
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
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  return {
    ...article,
    whyThisMatters: buildWhyThisMatters(article, category),
    intelligenceTags: buildIntelligenceTags(article, category),
    watchlistEntities: extractWatchlistEntities(article),
    freshnessLabel: ageHours <= 6 ? "New" : ageHours <= 24 ? "Fresh" : null,
    isDeveloping: false,
    relatedCoverage: []
  };
}

const clusteringStopwords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "for",
  "in",
  "on",
  "with",
  "from",
  "as",
  "at",
  "by",
  "is",
  "are",
  "after",
  "over",
  "into",
  "new",
  "how",
  "why"
]);

function getClusteringTokens(article: DashboardArticle) {
  return new Set(
    normalizeTitle(article.title)
      .split(" ")
      .filter((token) => token.length > 2 && !clusteringStopwords.has(token))
      .slice(0, 8)
  );
}

function isRelatedCoverage(left: DashboardArticle, right: DashboardArticle) {
  const leftTokens = getClusteringTokens(left);
  const rightTokens = getClusteringTokens(right);
  const overlappingTokens: string[] = [];

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlappingTokens.push(token);
    }
  }

  const overlap = overlappingTokens.length;
  const hoursApart = Math.abs(new Date(left.publishedAt).getTime() - new Date(right.publishedAt).getTime()) / (1000 * 60 * 60);
  const hasLongSharedToken = overlappingTokens.some((token) => token.length >= 6);

  return overlap >= 3 || (overlap >= 2 && hasLongSharedToken && hoursApart <= 18);
}

function getArticleSourceTier(article: DashboardArticle): FeedSourceTier {
  const match = feedSources.find((source) => {
    const matchDomains = source.matchDomains ?? [source.siteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]];
    return source.name === article.sourceName || matchDomains.includes(article.sourceDomain);
  });

  return match?.tier ?? "related";
}

function isHigherPriorityTier(candidate: DashboardArticle, current: DashboardArticle) {
  const order: FeedSourceTier[] = ["core", "related", "discussion"];
  return order.indexOf(getArticleSourceTier(candidate)) < order.indexOf(getArticleSourceTier(current));
}

export function clusterCoverage(entries: DashboardArticle[]) {
  const leads: DashboardArticle[] = [];

  for (const article of entries) {
    const articleTier = getArticleSourceTier(article);
    const lead = leads.find((candidate) => isRelatedCoverage(candidate, article));

    if (articleTier === "discussion" && !lead) {
      continue;
    }

    if (!lead) {
      leads.push({
        ...article,
        relatedCoverage: []
      });
      continue;
    }

    if (isHigherPriorityTier(article, lead)) {
      article.relatedCoverage = [
        {
          id: lead.id,
          title: lead.title,
          url: lead.url,
          sourceName: lead.sourceName,
          publishedAt: lead.publishedAt
        },
        ...lead.relatedCoverage
      ].slice(0, 3);

      const leadIndex = leads.findIndex((candidate) => candidate.id === lead.id);
      leads[leadIndex] = article;
      continue;
    }

    if (lead.sourceName === article.sourceName) {
      continue;
    }

    lead.relatedCoverage.push({
      id: article.id,
      title: article.title,
      url: article.url,
      sourceName: article.sourceName,
      publishedAt: article.publishedAt
    });
  }

  return leads.map((lead) => ({
    ...lead,
    isDeveloping: lead.relatedCoverage.length >= 2,
    relatedCoverage: lead.relatedCoverage
      .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
      .slice(0, 3)
  }));
}

export function buildDailyBriefing(entries: DashboardArticle[], categories: NewsCategory[]): DailyBriefingItem[] {
  return entries.slice(0, 5).map((article) => {
    const category = categories.find((item) => item.id === article.category)!;

    return {
      id: article.id,
      title: article.title,
      category: article.category,
      badge: category.badge,
      sourceName: article.sourceName,
      whyThisMatters: article.whyThisMatters,
      url: article.url
    };
  });
}

export function buildPulse(sections: Array<{ id: NewsCategoryId; featured: DashboardArticle | null; articles: DashboardArticle[] }>, categories: NewsCategory[]) {
  return sections.slice(0, 4).map<PulseMetric>((section) => {
    const category = categories.find((item) => item.id === section.id)!;
    const entries = [section.featured, ...section.articles].filter(Boolean) as DashboardArticle[];
    const newCount = entries.filter((entry) => entry.freshnessLabel === "New").length;
    const developingCount = entries.filter((entry) => entry.isDeveloping).length;
    const tone: PulseMetric["tone"] = newCount >= 2 ? "hot" : developingCount >= 1 ? "steady" : "cautious";

    return {
      label: category.badge,
      tone,
      summary:
        tone === "hot"
          ? `${newCount} fast-moving stories now`
          : tone === "steady"
            ? `${developingCount} clustered story lines building`
            : "Quieter cycle with slower-moving updates"
    };
  });
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
