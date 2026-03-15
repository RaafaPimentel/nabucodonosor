import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/news";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const revalidate = 1800;

export async function GET(request: Request) {
  const ip = getClientIp(request) ?? "unknown";
  const limit = rateLimit(`api-news:${ip}`, { max: 120, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const payload = await getDashboardData();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
        "X-RateLimit-Remaining": String(limit.remaining)
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load news"
      },
      { status: 500 }
    );
  }
}
