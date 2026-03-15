import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { AdminRole, AdminSessionContext } from "@/lib/types";
import {
  getAdminSessionContextByToken,
  revokeAdminSessionByToken,
  touchAdminSession,
  upsertAdminLastLogin
} from "@/lib/db/admin-auth";

const SESSION_COOKIE = "oraculum_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const roleOrder: Record<AdminRole, number> = {
  viewer: 0,
  editor: 1,
  operator: 2,
  admin: 3
};

function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(input: string) {
  const secret = env.ADMIN_SESSION_SECRET || env.CRON_SECRET || "oraculum-dev-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  let binary = "";
  for (const byte of new Uint8Array(signature)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function getAdminCookieName() {
  return SESSION_COOKIE;
}

export function getAdminSessionTtlSeconds() {
  return Math.floor(SESSION_TTL_MS / 1000);
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: getAdminSessionTtlSeconds()
  };
}

export async function issueSignedAdminToken(sessionId: string) {
  const payload = JSON.stringify({
    sid: sessionId,
    exp: Date.now() + SESSION_TTL_MS
  });
  const encodedPayload = toBase64Url(payload);
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function decodeSignedAdminToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = await sign(payload);
  if (signature !== expected) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(payload)) as { sid: string; exp: number };
    if (decoded.exp < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function getSessionTokenFromCookies() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function requireAdminSession(requiredRole: AdminRole = "viewer"): Promise<AdminSessionContext | null> {
  const token = await getSessionTokenFromCookies();
  const decoded = await decodeSignedAdminToken(token);
  if (!decoded || !token) {
    return null;
  }

  const context = await getAdminSessionContextByToken(decoded.sid, token);
  if (!context) {
    return null;
  }

  if (!hasRequiredRole(context.user.role, requiredRole)) {
    return null;
  }

  void touchAdminSession(context.session.id).catch((error) => {
    logger.warn("Failed to touch admin session", {
      sessionId: context.session.id,
      error: error instanceof Error ? error.message : "Unknown session touch failure"
    });
  });

  return context;
}

export async function revokeCurrentAdminSession() {
  const token = await getSessionTokenFromCookies();
  const decoded = await decodeSignedAdminToken(token);
  if (!decoded || !token) {
    return;
  }

  await revokeAdminSessionByToken(decoded.sid, token);
}

export function hasRequiredRole(actual: AdminRole, required: AdminRole) {
  return roleOrder[actual] >= roleOrder[required];
}

export async function markAdminLogin(userId: string) {
  await upsertAdminLastLogin(userId);
}
