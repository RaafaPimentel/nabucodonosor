import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-8 lg:px-10">
        <div className="h-24 rounded-[2rem] bg-white/5" />
        <div className="h-72 rounded-[2.5rem] bg-white/5" />
        <div className="grid gap-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="h-10 w-72 rounded-full bg-white/5" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-80 rounded-[2rem] bg-white/5" />
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, childIndex) => (
                    <div key={childIndex} className="h-40 rounded-[2rem] bg-white/5" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
