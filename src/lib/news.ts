import { newsCategories } from "@/lib/config";
import { getHomepageArticles, getLatestSyncRuns } from "@/lib/db/articles";
import { ArticleRecord, SyncRunRecord } from "@/lib/types";

export async function getDashboardData() {
  let articles: ArticleRecord[] = [];
  let syncRuns: SyncRunRecord[] = [];

  try {
    [articles, syncRuns] = await Promise.all([getHomepageArticles(), getLatestSyncRuns(8)]);
  } catch {
    articles = [];
    syncRuns = [];
  }

  const sections = newsCategories.map((category) => {
    const items = articles
      .filter((article) => article.category === category.id)
      .slice(0, 5);

    return {
      ...category,
      featured: items[0] ?? null,
      articles: items.slice(1)
    };
  });

  const processedProviders = new Set(syncRuns.map((run) => run.provider));
  const latestStartedAt = syncRuns[0]?.startedAt ?? null;
  const degraded = syncRuns.some((run) => run.status === "failed" || run.status === "partial");

  return {
    sections,
    stats: {
      lastUpdatedAt: latestStartedAt,
      syncStatus: degraded ? "Degraded" : "Healthy",
      sourcesProcessed: processedProviders.size,
      latestRuns: syncRuns
    }
  };
}
