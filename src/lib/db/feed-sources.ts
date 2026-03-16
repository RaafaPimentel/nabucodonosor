import { getSupabaseClient } from "@/lib/db/supabase";
import { Database } from "@/lib/db/schema";
import { FeedSource } from "@/lib/types";

export async function upsertFeedSources(sources: FeedSource[]) {
  if (!sources.length) {
    return;
  }

  const supabase = getSupabaseClient() as any;
  const rows: Database["public"]["Tables"]["feed_sources"]["Insert"][] = sources.map((source) => ({
    id: source.id,
    name: source.name,
    site_url: source.siteUrl,
    feed_url: source.feedUrl,
    format: source.format,
    category_ids: source.categoryIds,
    language: source.language,
    credibility_weight: source.credibilityWeight,
    enabled: source.enabled,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase.from("feed_sources").upsert(rows, {
    onConflict: "id"
  });

  if (error) {
    throw error;
  }
}
