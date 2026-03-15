import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSignedAdminToken, getAdminCookieName } from "@/lib/auth";
import { buildSecurityHeaders } from "@/lib/security";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  Object.entries(buildSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(getAdminCookieName())?.value;
    const session = await decodeSignedAdminToken(token);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
