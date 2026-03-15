import { NewsCategory, NormalizedArticle, ProviderArticle } from "@/lib/types";
import { dedupeArticles } from "@/skills/dedupe-articles";
import { normalizeArticle } from "@/skills/normalize-article";

export class ContentProcessingAgent {
  run(input: { category: NewsCategory; articles: ProviderArticle[] }) {
    const normalized = input.articles
      .map((article) => normalizeArticle(article, input.category))
      .filter((article): article is NormalizedArticle => Boolean(article))
      .filter((article) => input.category.allowedDomains.includes(article.sourceDomain));

    return dedupeArticles(normalized);
  }
}
