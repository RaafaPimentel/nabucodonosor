import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runNewsSyncJob } from "@/jobs/news-sync-job";

function isAuthorized(request: NextRequest) {
  if (!env.CRON_SECRET) {
    return true;
  }

  const header = request.headers.get("authorization");
  return header === `Bearer ${env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runNewsSyncJob();
    const hasFailure = results.some((result) => result.status === "failed");
    return NextResponse.json(
      {
        status: hasFailure ? "partial" : "success",
        results
      },
      { status: hasFailure ? 207 : 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "failed",
        error: error instanceof Error ? error.message : "Sync failed"
      },
      { status: 500 }
    );
  }
}
