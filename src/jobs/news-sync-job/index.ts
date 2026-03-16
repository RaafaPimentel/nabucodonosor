import { ClassificationAgent } from "@/agents/classification-agent";
import { FeedHealthAgent } from "@/agents/feed-health-agent";
import { FeedIngestionAgent } from "@/agents/feed-ingestion-agent";
import { ContentProcessingAgent } from "@/agents/processing-agent";
import { NewsRankingAgent } from "@/agents/ranking-agent";
import { RssFeedAdapter } from "@/feeds/rss-feed-adapter";
import { feedSources, newsCategories } from "@/lib/config";
import { createSyncRun, finishSyncRun, upsertArticles } from "@/lib/db/articles";
import { upsertFeedSources } from "@/lib/db/feed-sources";
import { logger } from "@/lib/logger";
import { SyncResult } from "@/lib/types";
import { getSourceRegistry } from "@/jobs/news-sync-job/sources";

export async function runNewsSyncJob() {
  const adapter = new RssFeedAdapter();
  const sourceRegistry = getSourceRegistry();
  const ingestionAgent = new FeedIngestionAgent();
  const classificationAgent = new ClassificationAgent();
  const processingAgent = new ContentProcessingAgent();
  const rankingAgent = new NewsRankingAgent();
  const feedHealthAgent = new FeedHealthAgent();
  const results: SyncResult[] = [];
  const sources = sourceRegistry.getEnabledSources();

  await upsertFeedSources(feedSources);

  logger.info("Starting provider sync", { provider: adapter.name, sources: sources.length });
  const syncRun = await createSyncRun(adapter.name);
  let insertedCount = 0;
  let updatedCount = 0;
  const errors: string[] = [];

  try {
    const { itemsBySource, failures } = await ingestionAgent.run({
      adapter,
      sources,
      limitPerSource: 8
    });

    failures.forEach((failure) => errors.push(`${failure.sourceName}: ${failure.error}`));

    const fetchedCountBySource = Object.fromEntries(
      sources.map((source) => [source.id, (itemsBySource[source.id] ?? []).length])
    ) as Record<string, number>;
    const acceptedCountBySource = Object.fromEntries(sources.map((source) => [source.id, 0])) as Record<string, number>;

    for (const category of newsCategories) {
      logger.info("Fetching category", { provider: adapter.name, category: category.id });
      const sourceCandidates = sourceRegistry.getSourcesForCategory(category);
      const articles = sourceCandidates.flatMap((source) => {
        const sourceItems = itemsBySource[source.id] ?? [];

        const matched =
          source.categoryIds.length === 1 && source.categoryIds[0] === category.id
            ? sourceItems
            : sourceItems.filter((item) => classificationAgent.filterByCategory(item, category));

        acceptedCountBySource[source.id] += matched.length;
        return matched;
      });

      const processed = processingAgent.run({ category, articles }).slice(0, 8);
      const ranked = rankingAgent.run({ category, articles: processed }).slice(0, 8);
      const persisted = await upsertArticles(ranked);
      logger.info("Category sync completed", {
        provider: adapter.name,
        category: category.id,
        fetched: articles.length,
        processed: processed.length,
        inserted: persisted.insertedCount,
        updated: persisted.updatedCount
      });

      insertedCount += persisted.insertedCount;
      updatedCount += persisted.updatedCount;
    }

    const health = feedHealthAgent.summarize({
      sources,
      fetchedCountBySource,
      acceptedCountBySource,
      failures
    });

    health
      .filter((entry) => entry.status !== "success")
      .forEach((entry) => {
        if (entry.lastError) {
          errors.push(`${entry.sourceName}: ${entry.lastError}`);
        }
      });

    const status = errors.length ? "partial" : "success";
    await finishSyncRun(syncRun.id, {
      status,
      insertedCount,
      updatedCount,
      errorLog: errors.join("\n")
    });

    results.push({
      provider: adapter.name,
      status,
      insertedCount,
      updatedCount,
      errorLog: errors.join("\n") || undefined
    });
    logger.info("Provider sync finished", {
      provider: adapter.name,
      status,
      insertedCount,
      updatedCount,
      errors: errors.length
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync failure";
    logger.error("Provider sync failed", {
      provider: adapter.name,
      error: message
    });
    await finishSyncRun(syncRun.id, {
      status: "failed",
      insertedCount,
      updatedCount,
      errorLog: message
    });
    results.push({
      provider: adapter.name,
      status: "failed",
      insertedCount,
      updatedCount,
      errorLog: message
    });
  }

  return results;
}
