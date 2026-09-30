import PiecesView from "@/components/PiecesView";
import QueryError from "@/components/QueryError";
import { loadAppDataSafely } from "@/lib/loadAppData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Peças" };

export default async function PiecesPage() {
  const { data, error } = await loadAppDataSafely();
  if (error) return <QueryError error={error} />;
  return <PiecesView {...data} />;
}
