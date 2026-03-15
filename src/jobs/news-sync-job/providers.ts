import { GNewsProvider } from "@/providers/gnews-provider";

export function getProviders() {
  // Free-tier mode defaults to a single provider to avoid unnecessary request volume and cost.
  return [new GNewsProvider()];
}
