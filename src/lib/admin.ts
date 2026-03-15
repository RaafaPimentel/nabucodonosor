import { newsCategories } from "@/lib/config";
import { getArticleCountsByCategory, getLatestSyncRuns } from "@/lib/db/articles";
import { listAdminUsers, listRecentAdminAuditLogs } from "@/lib/db/admin-auth";
import { AdminAuditLogRecord, AdminUserRecord, NewsCategoryId, SyncRunRecord } from "@/lib/types";

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
  adminUsers: AdminUserRecord[];
  auditLogs: AdminAuditLogRecord[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [counts, syncRuns, adminUsers, auditLogs]: [
    Record<NewsCategoryId, number>,
    SyncRunRecord[],
    AdminUserRecord[],
    AdminAuditLogRecord[]
  ] = await Promise.all([
    getArticleCountsByCategory(),
    getLatestSyncRuns(20),
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
    adminUsers,
    auditLogs
  };
}
