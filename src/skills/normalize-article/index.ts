import { allowedImageHosts } from "@/lib/config";
import { FeedItem, NewsCategory, NormalizedArticle, ProviderArticle } from "@/lib/types";
import { canonicalizeUrl, extractDomain, normalizeTitle, sha256 } from "@/lib/utils/hash";

function cleanSummary(summary?: string) {
  return (summary ?? "").replace(/\s+/g, " ").trim().slice(0, 220);
}

function cleanImageUrl(imageUrl?: string) {
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    return allowedImageHosts.includes(hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeArticle(article: ProviderArticle | FeedItem, category: NewsCategory): NormalizedArticle | null {
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
    imageUrl: cleanImageUrl(article.imageUrl),
    publishedAt: article.publishedAt || new Date().toISOString(),
    language: article.language || "en",
    relevanceScore: 0,
    signalSummary: "",
    dedupeHash: sha256(`${url}|${normalizeTitle(title)}`)
  };
}
