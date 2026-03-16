import { getSupabaseClient } from "@/lib/db/supabase";
import { Database } from "@/lib/db/schema";
import { FeedSource, FeedSourceRecord } from "@/lib/types";

function mapFeedSource(row: Database["public"]["Tables"]["feed_sources"]["Row"]): FeedSourceRecord {
  return {
    id: row.id,
    name: row.name,
    siteUrl: row.site_url,
    feedUrl: row.feed_url,
    format: row.format,
    tier: row.tier,
    matchDomains: undefined,
    categoryIds: row.category_ids as FeedSourceRecord["categoryIds"],
    language: row.language,
    credibilityWeight: Number(row.credibility_weight ?? 0),
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

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
    tier: source.tier,
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

export async function listFeedSources() {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase.from("feed_sources").select("*").order("tier").order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapFeedSource);
}
