import { FeedFetchFailure, FeedHealthSnapshot, FeedSource } from "@/lib/types";

export class FeedHealthAgent {
  summarize(input: {
    sources: FeedSource[];
    fetchedCountBySource: Record<string, number>;
    acceptedCountBySource: Record<string, number>;
    failures: FeedFetchFailure[];
  }) {
    const failuresBySource = new Map(input.failures.map((failure) => [failure.sourceId, failure]));

    return input.sources.map<FeedHealthSnapshot>((source) => {
      const failure = failuresBySource.get(source.id);
      const fetchedCount = input.fetchedCountBySource[source.id] ?? 0;
      const acceptedCount = input.acceptedCountBySource[source.id] ?? 0;
      const errorCount = failure ? 1 : 0;

      return {
        sourceId: source.id,
        sourceName: source.name,
        categoryIds: source.categoryIds,
        status: failure ? (acceptedCount > 0 ? "partial" : "failed") : "success",
        fetchedCount,
        acceptedCount,
        errorCount,
        lastError: failure?.error
      };
    });
  }
}
