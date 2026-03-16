import { newsCategories } from "@/lib/config";
import { getArticleCountsByCategory, getLatestSyncRuns } from "@/lib/db/articles";
import { listAdminUsers, listRecentAdminAuditLogs } from "@/lib/db/admin-auth";
import { listFeedSources } from "@/lib/db/feed-sources";
import { AdminAuditLogRecord, AdminUserRecord, FeedSourceRecord, NewsCategoryId, SyncRunRecord } from "@/lib/types";

interface AdminDashboardData {
  categoryCards: Array<{
    id: NewsCategoryId;
    title: string;
    count: number;
    badge: string;
  }>;
  latestFailures: SyncRunRecord[];
  providerSummary: SyncRunRecord[];
  syncRuns: SyncRunRecord[];
  feedSources: FeedSourceRecord[];
  adminUsers: AdminUserRecord[];
  auditLogs: AdminAuditLogRecord[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [counts, syncRuns, feedSources, adminUsers, auditLogs]: [
    Record<NewsCategoryId, number>,
    SyncRunRecord[],
    FeedSourceRecord[],
    AdminUserRecord[],
    AdminAuditLogRecord[]
  ] = await Promise.all([
    getArticleCountsByCategory(),
    getLatestSyncRuns(20),
    listFeedSources(),
    listAdminUsers(),
    listRecentAdminAuditLogs(20)
  ]);

  const categoryCards = newsCategories.map((category) => ({
    id: category.id,
    title: category.name,
    count: counts[category.id] ?? 0,
    badge: category.badge
  }));

  const latestFailures = syncRuns.filter((run: SyncRunRecord) => run.status !== "success").slice(0, 8);
  const providerSummary = Object.values(
    syncRuns.reduce((acc: Record<string, SyncRunRecord>, run: SyncRunRecord) => {
      if (!acc[run.provider]) {
        acc[run.provider] = run;
      }
      return acc;
    }, {})
  );

  return {
    categoryCards,
    latestFailures,
    providerSummary,
    syncRuns,
    feedSources,
    adminUsers,
    auditLogs
  };
}
