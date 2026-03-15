import { env } from "@/lib/env";
import { NewsCategory, ProviderArticle } from "@/lib/types";
import { BaseNewsProvider } from "@/providers/base";

interface CurrentsResponse {
  news?: Array<{
    title?: string;
    url?: string;
    description?: string;
    image?: string;
    published?: string;
    author?: string;
  }>;
}

export class CurrentsProvider extends BaseNewsProvider {
  readonly name = "currents";

  async getArticles(_category: NewsCategory, keywords: string[], limit: number): Promise<ProviderArticle[]> {
    if (!env.CURRENTS_API_KEY) {
      return [];
    }

    const params = new URLSearchParams({
      keywords: keywords.slice(0, 5).join(","),
      language: "en"
    });

    const payload = await this.request<CurrentsResponse>(`https://api.currentsapi.services/v1/search?${params.toString()}`, {
      headers: {
        Authorization: env.CURRENTS_API_KEY
      }
    });

    return (payload.news ?? []).slice(0, limit).map((article) => ({
      title: article.title,
      url: article.url,
      description: article.description,
      imageUrl: article.image,
      publishedAt: article.published,
      sourceName: article.author
    }));
  }
}
