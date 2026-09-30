import FilamentsView from "@/components/FilamentsView";
import QueryError from "@/components/QueryError";
import { loadAppDataSafely } from "@/lib/loadAppData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Filamentos" };

export default async function FilamentsPage() {
  const { data, error } = await loadAppDataSafely();
  if (error) return <QueryError error={error} />;
  return <FilamentsView filaments={data.filaments} />;
}
