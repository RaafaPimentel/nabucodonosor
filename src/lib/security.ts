import type { NextRequest } from "next/server";

export function getClientIp(request: Request | NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
}

export function getUserAgent(request: Request | NextRequest) {
  return request.headers.get("user-agent") || null;
}

export function isTrustedOrigin(request: Request | NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    const url = new URL(origin);
    return url.host === host;
  } catch {
    return false;
  }
}

export function buildSecurityHeaders() {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Content-Security-Policy":
      "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  } as const;
}
