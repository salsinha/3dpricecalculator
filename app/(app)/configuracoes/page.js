import QueryError from "@/components/QueryError";
import SettingsView from "@/components/SettingsView";
import { loadAppDataSafely } from "@/lib/loadAppData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const { data, error } = await loadAppDataSafely();
  if (error) return <QueryError error={error} />;
  return (
    <SettingsView
      settings={data.settings}
      printers={data.printers}
      electricityProfiles={data.electricityProfiles}
    />
  );
}
