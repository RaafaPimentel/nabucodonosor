import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  countRecentFailedLoginAttempts,
  createAdminAuditLog,
  createAdminSessionRecord,
  findAdminUserWithPasswordByUsername,
  recordAdminLoginAttempt
} from "@/lib/db/admin-auth";
import { getAdminCookieName, getAdminCookieOptions, getAdminSessionTtlSeconds, issueSignedAdminToken, markAdminLogin } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getClientIp, getUserAgent, isTrustedOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  const rateWindowStart = new Date(Date.now() - 1000 * 60 * 15).toISOString();
  const failures = await countRecentFailedLoginAttempts({
    username,
    ipAddress,
    since: rateWindowStart
  });

  if (failures.usernameFailures >= 5 || failures.ipFailures >= 10) {
    await createAdminAuditLog({
      action: "auth.login_blocked",
      resource: "admin_users",
      ipAddress,
      userAgent,
      details: {
        username,
        usernameFailures: failures.usernameFailures,
        ipFailures: failures.ipFailures
      }
    });
    return NextResponse.redirect(new URL("/admin/login?error=Too%20many%20login%20attempts", request.url));
  }

  const user = await findAdminUserWithPasswordByUsername(username);

  if (!user || !verifyPassword(password, user.password_hash)) {
    await recordAdminLoginAttempt({ username, ipAddress, success: false });
    await createAdminAuditLog({
      action: "auth.login_failed",
      resource: "admin_users",
      ipAddress,
      userAgent,
      details: {
        username
      }
    });
    return NextResponse.redirect(new URL("/admin/login?error=Invalid%20credentials", request.url));
  }

  const sessionId = crypto.randomUUID();
  const token = await issueSignedAdminToken(sessionId);
  await createAdminSessionRecord({
    sessionId,
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + getAdminSessionTtlSeconds() * 1000).toISOString()
  });
  await recordAdminLoginAttempt({ username, ipAddress, success: true });
  await markAdminLogin(user.id);
  await createAdminAuditLog({
    userId: user.id,
    action: "auth.login_success",
    resource: "admin_sessions",
    ipAddress,
    userAgent,
    details: {
      sessionId
    }
  });
  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), token, getAdminCookieOptions());

  return NextResponse.redirect(new URL("/admin", request.url));
}
