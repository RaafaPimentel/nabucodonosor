import { feedSources } from "@/lib/config";
import { SourceRegistryAgent } from "@/agents/source-registry-agent";

export function getSourceRegistry() {
  return new SourceRegistryAgent(feedSources);
}
