import { NewsCategory, NormalizedArticle, ProviderArticle } from "@/lib/types";
import { canonicalizeUrl, extractDomain, normalizeTitle, sha256 } from "@/lib/utils/hash";

function cleanSummary(summary?: string) {
  return (summary ?? "").replace(/\s+/g, " ").trim().slice(0, 220);
}

export function normalizeArticle(article: ProviderArticle, category: NewsCategory): NormalizedArticle | null {
  if (!article.title || !article.url) {
    return null;
  }

  const url = canonicalizeUrl(article.url);
  const title = article.title.trim();
  const sourceDomain = article.sourceDomain || extractDomain(url);

  if (!sourceDomain) {
    return null;
  }

  return {
    title,
    url,
    sourceName: article.sourceName?.trim() || sourceDomain,
    sourceDomain,
    category: category.id,
    summary: cleanSummary(article.description),
    imageUrl: article.imageUrl || null,
    publishedAt: article.publishedAt || new Date().toISOString(),
    language: article.language || "en",
    relevanceScore: 0,
    signalSummary: "",
    dedupeHash: sha256(`${url}|${normalizeTitle(title)}`)
  };
}
