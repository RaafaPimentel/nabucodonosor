import { FeedItem, NewsCategory, NewsCategoryId } from "@/lib/types";

function includesKeyword(value: string, keyword: string) {
  return value.includes(keyword.toLowerCase());
}

export class ClassificationAgent {
  classify(item: FeedItem, categories: NewsCategory[]) {
    const haystack = [item.title, item.description, item.categories?.join(" ")]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matches = categories
      .map((category) => ({
        categoryId: category.id,
        score: category.keywords.reduce((score, keyword) => score + (includesKeyword(haystack, keyword) ? 1 : 0), 0)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    return {
      primaryCategoryId: matches[0]?.categoryId ?? null,
      categoryIds: matches.map((match) => match.categoryId)
    };
  }

  filterByCategory(item: FeedItem, category: NewsCategory) {
    return this.classify(item, [category]).primaryCategoryId === category.id;
  }

  classifyMany(items: FeedItem[], categories: NewsCategory[]) {
    return items.map((item) => ({
      item,
      ...this.classify(item, categories)
    }));
  }
}
