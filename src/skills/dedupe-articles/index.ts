import { NormalizedArticle } from "@/lib/types";
import { canonicalizeUrl, normalizeTitle, sha256 } from "@/lib/utils/hash";

export function dedupeArticles(articles: NormalizedArticle[]) {
  const seen = new Map<string, NormalizedArticle>();

  for (const article of articles) {
    const url = canonicalizeUrl(article.url);
    const titleHash = sha256(normalizeTitle(article.title));
    const key = `${url}|${titleHash}`;
    const current = seen.get(key);

    if (!current || new Date(article.publishedAt).getTime() > new Date(current.publishedAt).getTime()) {
      seen.set(key, {
        ...article,
        url,
        dedupeHash: sha256(key)
      });
    }
  }

  return Array.from(seen.values());
}
