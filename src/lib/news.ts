import { newsCategories } from "@/lib/config";
import { buildSourceDiversity, buildWatchlist, toDashboardArticle } from "@/lib/editorial";
import { getArticlesByCategory, getLatestSyncRuns, getTopArticles } from "@/lib/db/articles";
import { ArticleRecord, DashboardArticle, SourceDiversityEntry, SyncRunRecord, WatchlistEntry } from "@/lib/types";

export async function getDashboardData() {
  let topSignalArticles: DashboardArticle[] = [];
  let syncRuns: SyncRunRecord[] = [];
  let watchlist: WatchlistEntry[] = [];
  let sourceDiversity: SourceDiversityEntry[] = [];
  let sections = newsCategories.map((category) => ({
    ...category,
    featured: null as DashboardArticle | null,
    articles: [] as DashboardArticle[]
  }));

  try {
    const [topArticles, latestSyncRuns, sectionArticles] = await Promise.all([
      getTopArticles(6),
      getLatestSyncRuns(8),
      Promise.all(newsCategories.map((category) => getArticlesByCategory(category.id, 5)))
    ]);

    topSignalArticles = topArticles.map((article: ArticleRecord) => {
      const category = newsCategories.find((item) => item.id === article.category)!;
      return toDashboardArticle(article, category);
    });
    syncRuns = latestSyncRuns;
    sections = newsCategories.map((category, index) => {
      const items = sectionArticles[index] ?? [];
      const dashboardItems = items.map((article: ArticleRecord) => toDashboardArticle(article, category));

      return {
        ...category,
        featured: dashboardItems[0] ?? null,
        articles: dashboardItems.slice(1)
      };
    });

    const combinedArticles = sections.flatMap((section) => [
      ...(section.featured ? [section.featured] : []),
      ...section.articles
    ]);
    watchlist = buildWatchlist(combinedArticles);
    sourceDiversity = buildSourceDiversity(combinedArticles);
  } catch {
    topSignalArticles = [];
    syncRuns = [];
    watchlist = [];
    sourceDiversity = [];
    sections = newsCategories.map((category) => ({
      ...category,
      featured: null,
      articles: []
    }));
  }

  const processedProviders = new Set(syncRuns.map((run) => run.provider));
  const latestStartedAt = syncRuns[0]?.startedAt ?? null;
  const degraded = syncRuns.some((run) => run.status === "failed" || run.status === "partial");

  return {
    sections,
    topSignals: topSignalArticles,
    watchlist,
    sourceDiversity,
    stats: {
      lastUpdatedAt: latestStartedAt,
      syncStatus: degraded ? "Degraded" : "Healthy",
      sourcesProcessed: processedProviders.size,
      latestRuns: syncRuns
    }
  };
}
