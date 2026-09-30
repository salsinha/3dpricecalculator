import { formatEuro } from "@/lib/format";

const ROWS = [
  ["filament", "Filamentos"],
  ["electricity", "Eletricidade"],
  ["labor", "Mão de obra"],
  ["machine", "Máquina"],
  ["packaging", "Embalagem"],
];

export default function CostBreakdown({ costs }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Custos</p>
      <dl className="mt-3 space-y-2">
        {ROWS.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium text-ink tabular-nums">{formatEuro(costs[key])}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-medium text-ink">Custo total</span>
        <span className="text-lg font-semibold text-ink tabular-nums">{formatEuro(costs.total)}</span>
      </div>
    </div>
  );
}
