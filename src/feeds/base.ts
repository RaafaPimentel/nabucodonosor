import { FeedAdapter } from "@/lib/types";
import { logger } from "@/lib/logger";
import { retry } from "@/lib/utils/retry";

export abstract class BaseFeedAdapter implements FeedAdapter {
  abstract readonly name: string;

  protected async requestText(input: RequestInfo | URL, init?: RequestInit) {
    return retry(
      async () => {
        const response = await fetch(input, {
          ...init,
          signal: AbortSignal.timeout(8000),
          headers: {
            Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
            ...(init?.headers ?? {})
          },
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error(`${this.name} request failed with ${response.status}`);
        }

        return response.text();
      },
      {
        attempts: 3,
        backoffMs: 500,
        onRetry: (error, attempt) => {
          logger.warn("Feed request retry", {
            adapter: this.name,
            attempt,
            error: error instanceof Error ? error.message : "Unknown request failure"
          });
        }
      }
    );
  }

  abstract getFeedItems(
    source: Parameters<FeedAdapter["getFeedItems"]>[0],
    limit: Parameters<FeedAdapter["getFeedItems"]>[1]
  ): ReturnType<FeedAdapter["getFeedItems"]>;
}
