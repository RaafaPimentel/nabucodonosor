import { NewsIngestionAgent } from "@/agents/ingestion-agent";
import { ContentProcessingAgent } from "@/agents/processing-agent";
import { NewsRankingAgent } from "@/agents/ranking-agent";
import { newsCategories } from "@/lib/config";
import { createSyncRun, finishSyncRun, upsertArticles } from "@/lib/db/articles";
import { logger } from "@/lib/logger";
import { SyncResult } from "@/lib/types";
import { getProviders } from "@/jobs/news-sync-job/providers";

export async function runNewsSyncJob() {
  const providers = getProviders();
  const ingestionAgent = new NewsIngestionAgent();
  const processingAgent = new ContentProcessingAgent();
  const rankingAgent = new NewsRankingAgent();
  const results: SyncResult[] = [];

  for (const provider of providers) {
    logger.info("Starting provider sync", { provider: provider.name });
    const syncRun = await createSyncRun(provider.name);
    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    try {
      for (const category of newsCategories) {
        logger.info("Fetching category", { provider: provider.name, category: category.id });
        const { articles, failures } = await ingestionAgent.run({
          providers: [provider],
          category,
          limitPerProvider: 10
        });

        failures.forEach((failure) => errors.push(`${failure.provider}: ${failure.error}`));

        const processed = processingAgent.run({ category, articles });
        const ranked = rankingAgent.run({ category, articles: processed }).slice(0, 12);
        const persisted = await upsertArticles(ranked);
        logger.info("Category sync completed", {
          provider: provider.name,
          category: category.id,
          fetched: articles.length,
          processed: processed.length,
          inserted: persisted.insertedCount,
          updated: persisted.updatedCount
        });

        insertedCount += persisted.insertedCount;
        updatedCount += persisted.updatedCount;
      }

      const status = errors.length ? "partial" : "success";
      await finishSyncRun(syncRun.id, {
        status,
        insertedCount,
        updatedCount,
        errorLog: errors.join("\n")
      });

      results.push({
        provider: provider.name,
        status,
        insertedCount,
        updatedCount,
        errorLog: errors.join("\n") || undefined
      });
      logger.info("Provider sync finished", {
        provider: provider.name,
        status,
        insertedCount,
        updatedCount,
        errors: errors.length
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync failure";
      logger.error("Provider sync failed", {
        provider: provider.name,
        error: message
      });
      await finishSyncRun(syncRun.id, {
        status: "failed",
        insertedCount,
        updatedCount,
        errorLog: message
      });
      results.push({
        provider: provider.name,
        status: "failed",
        insertedCount,
        updatedCount,
        errorLog: message
      });
    }
  }

  return results;
}
