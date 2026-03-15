import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/db/admin-auth";
import { runNewsSyncJob } from "@/jobs/news-sync-job";
import { getClientIp, getUserAgent, isTrustedOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await requireAdminSession("operator");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  await createAdminAuditLog({
    userId: session.user.id,
    action: "sync.manual_trigger",
    resource: "sync_runs",
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    details: {
      role: session.user.role
    }
  });
  await runNewsSyncJob();
  return NextResponse.redirect(new URL("/admin", request.url));
}
