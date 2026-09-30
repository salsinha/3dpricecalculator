import DashboardView from "@/components/DashboardView";
import QueryError from "@/components/QueryError";
import { buildDashboard } from "@/lib/dashboard";
import { loadAppDataSafely } from "@/lib/loadAppData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel" };

export default async function DashboardPage() {
  const { data, error } = await loadAppDataSafely();
  if (error) return <QueryError error={error} />;
  return (
    <DashboardView
      dashboard={buildDashboard(data)}
      electricityProfiles={data.electricityProfiles}
    />
  );
}
