import { ProviderAdapter } from "@/lib/types";
import { logger } from "@/lib/logger";
import { retry } from "@/lib/utils/retry";

export abstract class BaseNewsProvider implements ProviderAdapter {
  abstract readonly name: string;

  protected async request<T>(input: RequestInfo | URL, init?: RequestInit) {
    return retry(
      async () => {
        const response = await fetch(input, {
          ...init,
          signal: AbortSignal.timeout(8000),
          headers: {
            Accept: "application/json",
            ...(init?.headers ?? {})
          },
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error(`${this.name} request failed with ${response.status}`);
        }

        return (await response.json()) as T;
      },
      {
        attempts: 3,
        backoffMs: 500,
        onRetry: (error, attempt) => {
          logger.warn("Provider request retry", {
            provider: this.name,
            attempt,
            error: error instanceof Error ? error.message : "Unknown request failure"
          });
        }
      }
    );
  }

  abstract getArticles(category: Parameters<ProviderAdapter["getArticles"]>[0], keywords: string[], limit: number): ReturnType<ProviderAdapter["getArticles"]>;
}
