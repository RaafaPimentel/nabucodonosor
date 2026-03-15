import { getSupabaseClient } from "@/lib/db/supabase";
import { Database } from "@/lib/db/schema";
import { ArticleRecord, NormalizedArticle, NewsCategoryId, SyncRunRecord } from "@/lib/types";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type SyncRunRow = Database["public"]["Tables"]["sync_runs"]["Row"];

function mapArticle(row: ArticleRow): ArticleRecord {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    sourceName: row.source_name,
    sourceDomain: row.source_domain,
    category: row.category as NewsCategoryId,
    summary: row.summary ?? "",
    imageUrl: row.image_url ?? null,
    publishedAt: row.published_at,
    language: row.language,
    relevanceScore: Number(row.relevance_score ?? 0),
    signalSummary: row.signal_summary ?? "",
    dedupeHash: row.dedupe_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSyncRun(row: SyncRunRow): SyncRunRecord {
  return {
    id: row.id,
    provider: row.provider,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    insertedCount: row.inserted_count ?? 0,
    updatedCount: row.updated_count ?? 0,
    errorLog: row.error_log ?? null
  };
}

export async function getHomepageArticles() {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .gte("published_at", new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString())
    .order("relevance_score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapArticle);
}

export async function getTopArticles(limit = 8) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .gte("published_at", new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString())
    .order("relevance_score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapArticle);
}

export async function getArticlesByCategory(category: NewsCategoryId, limit = 8) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("relevance_score", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapArticle);
}

export async function upsertArticles(articles: NormalizedArticle[]) {
  if (!articles.length) {
    return { insertedCount: 0, updatedCount: 0 };
  }

  const supabase = getSupabaseClient() as any;
  const rows: Database["public"]["Tables"]["articles"]["Insert"][] = articles.map((article) => ({
    title: article.title,
    url: article.url,
    source_name: article.sourceName,
    source_domain: article.sourceDomain,
    category: article.category,
    summary: article.summary,
    image_url: article.imageUrl,
    published_at: article.publishedAt,
    language: article.language,
    relevance_score: article.relevanceScore,
    signal_summary: article.signalSummary,
    dedupe_hash: article.dedupeHash,
    updated_at: new Date().toISOString()
  }));

  const { data: existingRows, error: existingError } = await supabase
    .from("articles")
    .select("dedupe_hash")
    .in("dedupe_hash", articles.map((article) => article.dedupeHash));

  if (existingError) {
    throw existingError;
  }

  const existingHashes = new Set((existingRows ?? []).map((row: { dedupe_hash: string }) => row.dedupe_hash));

  const { error } = await supabase.from("articles").upsert(rows, {
    onConflict: "dedupe_hash"
  });

  if (error) {
    throw error;
  }

  let insertedCount = 0;
  let updatedCount = 0;

  for (const article of articles) {
    if (existingHashes.has(article.dedupeHash)) {
      updatedCount += 1;
    } else {
      insertedCount += 1;
    }
  }

  return { insertedCount, updatedCount };
}

export async function createSyncRun(provider: string) {
  const supabase = getSupabaseClient() as any;
  const payload: Database["public"]["Tables"]["sync_runs"]["Insert"] = {
    provider,
    started_at: new Date().toISOString(),
    status: "running"
  };

  const { data, error } = await supabase.from("sync_runs").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return mapSyncRun(data);
}

export async function finishSyncRun(
  id: string,
  input: { status: SyncRunRecord["status"]; insertedCount: number; updatedCount: number; errorLog?: string }
) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("sync_runs")
    .update({
      finished_at: new Date().toISOString(),
      status: input.status,
      inserted_count: input.insertedCount,
      updated_count: input.updatedCount,
      error_log: input.errorLog ?? null
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapSyncRun(data);
}

export async function getLatestSyncRuns(limit = 10) {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("sync_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSyncRun);
}

export async function getArticleCountsByCategory() {
  const supabase = getSupabaseClient() as any;
  const categoryCounts = await Promise.all(
    (["ai-technology", "programming", "global-economy", "gaming", "media-streaming"] as NewsCategoryId[]).map(async (category) => {
      const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("category", category);

      if (error) {
        throw error;
      }

      return [category, count ?? 0] as const;
    })
  );

  return Object.fromEntries(categoryCounts) as Record<NewsCategoryId, number>;
}
