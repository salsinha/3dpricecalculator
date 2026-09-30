import Badge from "@/components/Badge";
import { formatEuro, formatPercent } from "@/lib/format";

export default function PriceSummary({ pricing }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">Preço</p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-muted">Margem</dt>
          <dd className="font-medium text-ink tabular-nums">{formatPercent(pricing.marginPercent)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-muted">Lucro</dt>
          <dd className="font-medium text-ink tabular-nums">{formatEuro(pricing.profit)}</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-sm text-muted">Preço recomendado</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-accent tabular-nums">
          {formatEuro(pricing.price)}
        </p>
        {pricing.minimumApplied ? (
          <div className="mt-3">
            <Badge tone="warning">Preço mínimo aplicado</Badge>
            <p className="mt-2 text-xs text-muted">
              A margem efetiva passa a {formatPercent(pricing.effectiveMargin)}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
