import { feedSources, newsCategories, newsCategoryGroups } from "@/lib/config";
import { buildDailyBriefing, buildPulse, buildSourceDiversity, buildWatchlist, clusterCoverage, toDashboardArticle } from "@/lib/editorial";
import { getArticlesByCategory, getLatestSyncRuns, getTopArticles } from "@/lib/db/articles";
import { ArticleRecord, DashboardArticle, DashboardData, SourceDiversityEntry, SyncRunRecord, WatchlistEntry } from "@/lib/types";

export async function getDashboardData(): Promise<DashboardData> {
  let topSignalArticles: DashboardArticle[] = [];
  let syncRuns: SyncRunRecord[] = [];
  let watchlist: WatchlistEntry[] = [];
  let sourceDiversity: SourceDiversityEntry[] = [];
  let briefing = [] as DashboardData["briefing"];
  let pulse = [] as DashboardData["pulse"];
  let sections = newsCategories.map((category) => ({
    ...category,
    featured: null as DashboardArticle | null,
    articles: [] as DashboardArticle[]
  }));

  try {
    const [topArticles, latestSyncRuns, sectionArticles] = await Promise.all([
      getTopArticles(6),
      getLatestSyncRuns(8),
      Promise.all(newsCategories.map((category) => getArticlesByCategory(category.id, 8)))
    ]);

    topSignalArticles = topArticles.map((article: ArticleRecord) => {
      const category = newsCategories.find((item) => item.id === article.category)!;
      return toDashboardArticle(article, category);
    });
    syncRuns = latestSyncRuns;
    sections = newsCategories.map((category, index) => {
      const items = sectionArticles[index] ?? [];
      const dashboardItems = clusterCoverage(items.map((article: ArticleRecord) => toDashboardArticle(article, category))).slice(0, 5);

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
    briefing = buildDailyBriefing(topSignalArticles, newsCategories);
    pulse = buildPulse(sections, newsCategories);
  } catch {
    topSignalArticles = [];
    syncRuns = [];
    watchlist = [];
    sourceDiversity = [];
    briefing = [];
    pulse = [];
    sections = newsCategories.map((category) => ({
      ...category,
      featured: null,
      articles: []
    }));
  }

  const latestStartedAt = syncRuns[0]?.startedAt ?? null;
  const degraded = syncRuns.some((run) => run.status === "failed" || run.status === "partial");

  return {
    sectionGroups: newsCategoryGroups.map((group) => ({
      ...group,
      sections: group.categoryIds
        .map((categoryId) => sections.find((section) => section.id === categoryId) ?? null)
        .filter((section): section is (typeof sections)[number] => Boolean(section))
    })),
    sections,
    topSignals: topSignalArticles,
    watchlist,
    sourceDiversity,
    briefing,
    pulse,
    stats: {
      lastUpdatedAt: latestStartedAt,
      syncStatus: degraded ? "Degraded" : "Healthy",
      sourcesProcessed: feedSources.filter((source) => source.enabled).length,
      latestRuns: syncRuns
    }
  };
}
