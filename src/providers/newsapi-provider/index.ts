import { env } from "@/lib/env";
import { NewsCategory, ProviderArticle } from "@/lib/types";
import { extractDomain } from "@/lib/utils/hash";
import { BaseNewsProvider } from "@/providers/base";

interface NewsApiResponse {
  articles?: Array<{
    title?: string;
    url?: string;
    description?: string;
    urlToImage?: string;
    publishedAt?: string;
    source?: {
      name?: string;
    };
  }>;
}

export class NewsApiProvider extends BaseNewsProvider {
  readonly name = "newsapi";

  async getArticles(category: NewsCategory, keywords: string[], limit: number): Promise<ProviderArticle[]> {
    if (!env.NEWS_API_KEY) {
      return [];
    }

    const params = new URLSearchParams({
      q: keywords.slice(0, 6).join(" OR "),
      language: "en",
      pageSize: String(limit),
      apiKey: env.NEWS_API_KEY,
      sortBy: "publishedAt",
      domains: category.allowedDomains.slice(0, 20).join(",")
    });

    const payload = await this.request<NewsApiResponse>(`https://newsapi.org/v2/everything?${params.toString()}`);

    return (payload.articles ?? []).map((article) => ({
      title: article.title,
      url: article.url,
      description: article.description,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      sourceName: article.source?.name,
      sourceDomain: article.url ? extractDomain(article.url) : ""
    }));
  }
}
