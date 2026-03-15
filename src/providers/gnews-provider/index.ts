import { env } from "@/lib/env";
import { NewsCategory, ProviderArticle } from "@/lib/types";
import { extractDomain } from "@/lib/utils/hash";
import { BaseNewsProvider } from "@/providers/base";

interface GNewsResponse {
  articles?: Array<{
    title?: string;
    url?: string;
    description?: string;
    image?: string;
    publishedAt?: string;
    source?: {
      name?: string;
      url?: string;
    };
  }>;
}

export class GNewsProvider extends BaseNewsProvider {
  readonly name = "gnews";

  async getArticles(category: NewsCategory, keywords: string[], limit: number): Promise<ProviderArticle[]> {
    if (!env.GNEWS_API_KEY) {
      return [];
    }

    const params = new URLSearchParams({
      q: keywords.slice(0, 5).join(" OR "),
      lang: "en",
      max: String(limit),
      token: env.GNEWS_API_KEY
    });

    const domains = category.allowedDomains.slice(0, 10).join(",");
    if (domains) {
      params.set("in", "title,description");
      params.set("expand", "content");
      params.set("nullable", "image");
    }

    const payload = await this.request<GNewsResponse>(`https://gnews.io/api/v4/search?${params.toString()}`);

    return (payload.articles ?? []).map((article) => ({
      title: article.title,
      url: article.url,
      description: article.description,
      imageUrl: article.image,
      publishedAt: article.publishedAt,
      sourceName: article.source?.name,
      sourceDomain: article.source?.url ? extractDomain(article.source.url) : article.url ? extractDomain(article.url) : ""
    }));
  }
}
