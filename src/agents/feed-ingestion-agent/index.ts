import { FeedAdapter, FeedFetchFailure, FeedItem, FeedSource } from "@/lib/types";

export class FeedIngestionAgent {
  async run(input: { adapter: FeedAdapter; sources: FeedSource[]; limitPerSource: number }) {
    const outcomes = await Promise.allSettled(
      input.sources.map((source) => input.adapter.getFeedItems(source, input.limitPerSource))
    );

    const itemsBySource: Record<string, FeedItem[]> = {};
    const failures: FeedFetchFailure[] = [];

    outcomes.forEach((outcome, index) => {
      const source = input.sources[index];

      if (outcome.status === "fulfilled") {
        itemsBySource[source.id] = outcome.value;
        return;
      }

      failures.push({
        sourceId: source.id,
        sourceName: source.name,
        error: outcome.reason instanceof Error ? outcome.reason.message : "Unknown feed failure"
      });
      itemsBySource[source.id] = [];
    });

    return {
      itemsBySource,
      failures
    };
  }
}
