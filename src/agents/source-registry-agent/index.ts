import { FeedSource, FeedSourceTier, NewsCategory, NewsCategoryId } from "@/lib/types";

export class SourceRegistryAgent {
  constructor(private readonly sources: FeedSource[]) {}

  getEnabledSources() {
    return this.sources.filter((source) => source.enabled);
  }

  getSourcesForCategory(category: NewsCategory | NewsCategoryId) {
    const categoryId = typeof category === "string" ? category : category.id;

    return this.getEnabledSources().filter((source) => source.categoryIds.includes(categoryId));
  }

  getSourcesForCategoryByTier(category: NewsCategory | NewsCategoryId, tier: FeedSourceTier) {
    return this.getSourcesForCategory(category).filter((source) => source.tier === tier);
  }

  getSourceById(sourceId: string) {
    return this.sources.find((source) => source.id === sourceId) ?? null;
  }
}
