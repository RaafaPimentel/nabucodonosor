import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { createAdminAuditLog, setAdminUserDisabledState } from "@/lib/db/admin-auth";
import { getClientIp, getUserAgent, isTrustedOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const session = await requireAdminSession("admin");
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "");
  const disabled = String(formData.get("disabled") ?? "") === "true";

  if (!userId || userId === session.user.id) {
    return NextResponse.redirect(new URL("/admin?error=Invalid%20user%20change", request.url));
  }

  const user = await setAdminUserDisabledState({ userId, disabled });
  await createAdminAuditLog({
    userId: session.user.id,
    action: disabled ? "admin_user.disabled" : "admin_user.enabled",
    resource: "admin_users",
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    details: {
      targetUserId: user.id,
      targetUsername: user.username
    }
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
