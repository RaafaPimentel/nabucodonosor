import { NewsCategory, ProviderAdapter, ProviderArticle } from "@/lib/types";

export class NewsIngestionAgent {
  async run(input: { providers: ProviderAdapter[]; category: NewsCategory; limitPerProvider: number }) {
    const outcomes = await Promise.allSettled(
      input.providers.map((provider) => provider.getArticles(input.category, input.category.keywords, input.limitPerProvider))
    );

    const articles: ProviderArticle[] = [];
    const failures: Array<{ provider: string; error: string }> = [];

    outcomes.forEach((outcome, index) => {
      const provider = input.providers[index];
      if (outcome.status === "fulfilled") {
        articles.push(...outcome.value);
      } else {
        failures.push({
          provider: provider.name,
          error: outcome.reason instanceof Error ? outcome.reason.message : "Unknown provider failure"
        });
      }
    });

    return {
      articles,
      failures
    };
  }
}
