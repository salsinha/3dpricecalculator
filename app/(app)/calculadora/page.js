import CalculatorView from "@/components/CalculatorView";
import QueryError from "@/components/QueryError";
import { loadAppDataSafely } from "@/lib/loadAppData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calculadora" };

export default async function CalculatorPage() {
  const { data, error } = await loadAppDataSafely();
  if (error) return <QueryError error={error} />;
  return (
    <CalculatorView
      pieces={data.pieces}
      settings={data.settings}
      printers={data.printers}
      electricityProfiles={data.electricityProfiles}
    />
  );
}
