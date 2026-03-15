import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, requireAdminSession, revokeCurrentAdminSession } from "@/lib/auth";
import { createAdminAuditLog } from "@/lib/db/admin-auth";
import { getClientIp, getUserAgent, isTrustedOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await requireAdminSession();
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  await revokeCurrentAdminSession();
  if (session) {
    await createAdminAuditLog({
      userId: session.user.id,
      action: "auth.logout",
      resource: "admin_sessions",
      ipAddress,
      userAgent,
      details: {
        sessionId: session.session.id
      }
    });
  }
  const cookieStore = await cookies();
  cookieStore.delete(getAdminCookieName());
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
