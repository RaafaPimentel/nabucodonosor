import { DashboardExperience } from "@/components/dashboard-experience";
import { getDashboardData } from "@/lib/news";

export async function DashboardShell() {
  const data = await getDashboardData();

  return <DashboardExperience data={data} />;
}
