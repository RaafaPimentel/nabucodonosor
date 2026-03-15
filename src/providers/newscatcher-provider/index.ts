import { env } from "@/lib/env";
import { NewsCategory, ProviderArticle } from "@/lib/types";
import { BaseNewsProvider } from "@/providers/base";

interface NewsCatcherResponse {
  articles?: Array<{
    title?: string;
    link?: string;
    summary?: string;
    media?: string;
    published_date?: string;
    clean_url?: string;
  }>;
}

export class NewsCatcherProvider extends BaseNewsProvider {
  readonly name = "newscatcher";

  async getArticles(category: NewsCategory, keywords: string[], limit: number): Promise<ProviderArticle[]> {
    if (!env.NEWSCATCHER_API_KEY) {
      return [];
    }

    const params = new URLSearchParams({
      q: keywords.slice(0, 5).join(" OR "),
      lang: "en",
      page_size: String(limit),
      sources: category.allowedDomains.slice(0, 20).join(",")
    });

    const payload = await this.request<NewsCatcherResponse>(`https://api.newscatcherapi.com/v2/search?${params.toString()}`, {
      headers: {
        "x-api-key": env.NEWSCATCHER_API_KEY
      }
    });

    return (payload.articles ?? []).map((article) => ({
      title: article.title,
      url: article.link,
      description: article.summary,
      imageUrl: article.media,
      publishedAt: article.published_date,
      sourceName: article.clean_url,
      sourceDomain: article.clean_url
    }));
  }
}
