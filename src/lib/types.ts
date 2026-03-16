export type NewsCategoryId =
  | "ai-technology"
  | "programming"
  | "global-economy"
  | "gaming"
  | "media-streaming"
  | "product"
  | "devops-cloud"
  | "data-analytics"
  | "fintech"
  | "crypto-digital-assets";

export type FeedFormat = "rss" | "atom";
export type FeedSourceTier = "core" | "related" | "discussion";

export type AdminRole = "viewer" | "editor" | "operator" | "admin";

export interface NewsCategory {
  id: NewsCategoryId;
  name: string;
  badge: string;
  description: string;
  keywords: string[];
  allowedDomains: string[];
}

export interface NewsCategoryGroup {
  id: string;
  name: string;
  description: string;
  categoryIds: NewsCategoryId[];
}

export interface FeedSource {
  id: string;
  name: string;
  siteUrl: string;
  feedUrl: string;
  format: FeedFormat;
  tier: FeedSourceTier;
  matchDomains?: string[];
  categoryIds: NewsCategoryId[];
  language: string;
  credibilityWeight: number;
  enabled: boolean;
}

export interface FeedSourceRecord extends FeedSource {
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  title?: string;
  url?: string;
  guid?: string;
  sourceName?: string;
  sourceDomain?: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
  language?: string;
  categories?: string[];
}

export interface NormalizedArticle {
  title: string;
  url: string;
  sourceName: string;
  sourceDomain: string;
  category: NewsCategoryId;
  summary: string;
  imageUrl: string | null;
  publishedAt: string;
  language: string;
  relevanceScore: number;
  signalSummary: string;
  dedupeHash: string;
}

export interface ArticleRecord extends NormalizedArticle {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardArticle extends ArticleRecord {
  whyThisMatters: string;
  intelligenceTags: string[];
  watchlistEntities: string[];
  freshnessLabel: "New" | "Fresh" | null;
  isDeveloping: boolean;
  relatedCoverage: Array<{
    id: string;
    title: string;
    url: string;
    sourceName: string;
    publishedAt: string;
  }>;
}

export interface DashboardSection {
  id: NewsCategoryId;
  name: string;
  badge: string;
  description: string;
  featured: DashboardArticle | null;
  articles: DashboardArticle[];
}

export interface DailyBriefingItem {
  id: string;
  title: string;
  category: NewsCategoryId;
  badge: string;
  sourceName: string;
  whyThisMatters: string;
  url: string;
}

export interface PulseMetric {
  label: string;
  tone: "hot" | "steady" | "cautious";
  summary: string;
}

export interface DashboardData {
  sectionGroups: Array<{
    id: string;
    name: string;
    description: string;
    sections: DashboardSection[];
  }>;
  sections: DashboardSection[];
  topSignals: DashboardArticle[];
  watchlist: WatchlistEntry[];
  sourceDiversity: SourceDiversityEntry[];
  briefing: DailyBriefingItem[];
  pulse: PulseMetric[];
  stats: {
    lastUpdatedAt: string | null;
    syncStatus: string;
    sourcesProcessed: number;
    latestRuns: SyncRunRecord[];
  };
}

export interface WatchlistEntry {
  name: string;
  articleCount: number;
  latestPublishedAt: string;
  articles: DashboardArticle[];
}

export interface SourceDiversityEntry {
  sourceName: string;
  sourceDomain: string;
  articleCount: number;
  categories: NewsCategoryId[];
}

export interface SyncRunRecord {
  id: string;
  provider: string;
  startedAt: string;
  finishedAt: string | null;
  status: "running" | "success" | "partial" | "failed";
  insertedCount: number;
  updatedCount: number;
  errorLog: string | null;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  disabledAt: string | null;
}

export interface AdminSessionRecord {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  lastSeenAt: string | null;
  revokedAt: string | null;
}

export interface AdminSessionContext {
  session: AdminSessionRecord;
  user: AdminUserRecord;
}

export interface AdminAuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: unknown;
  createdAt: string;
}

export interface SyncResult {
  provider: string;
  status: "success" | "partial" | "failed";
  insertedCount: number;
  updatedCount: number;
  errorLog?: string;
}

export interface ScoreDetails {
  score: number;
  signalSummary: string;
}

export interface FeedAdapter {
  readonly name: string;
  getFeedItems(source: FeedSource, limit: number): Promise<FeedItem[]>;
}

export interface FeedFetchFailure {
  sourceId: string;
  sourceName: string;
  error: string;
}

export interface FeedHealthSnapshot {
  sourceId: string;
  sourceName: string;
  categoryIds: NewsCategoryId[];
  status: "success" | "partial" | "failed";
  fetchedCount: number;
  acceptedCount: number;
  errorCount: number;
  lastError?: string;
}
