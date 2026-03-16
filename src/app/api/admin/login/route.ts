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
import { logger } from "@/lib/logger";

function redirectToLogin(request: Request, error: string) {
  return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(error)}`, request.url), { status: 303 });
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}

export async function POST(request: Request) {
  try {
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
      return redirectToLogin(request, "Too many login attempts");
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
      return redirectToLogin(request, "Invalid credentials");
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

    return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  } catch (error) {
    logger.error("Admin login failed", {
      error: error instanceof Error ? error.message : "Unknown admin login failure"
    });
    return redirectToLogin(request, "Admin auth is temporarily unavailable");
  }
}
