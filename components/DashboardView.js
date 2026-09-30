import Badge from "@/components/Badge";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import SeedButton from "@/components/SeedButton";
import { Table, Td } from "@/components/Table";
import { formatEuro, formatGrams, formatPercent, shortId } from "@/lib/format";

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function DashboardView({ dashboard }) {
  const cards = [
    { label: "Peças", value: String(dashboard.pieceCount), hint: "Registadas na conta" },
    { label: "Filamentos", value: String(dashboard.filamentCount), hint: "No catálogo" },
    { label: "Margem standard", value: formatPercent(dashboard.margin), hint: "Sobre o preço de venda" },
    {
      label: "Preço médio",
      value: dashboard.averagePrice == null ? "—" : formatEuro(dashboard.averagePrice),
      hint: "Preço recomendado",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Painel"
        description="Resumo das peças, dos filamentos e dos preços de venda."
        action={<SeedButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums">{card.value}</p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="text-base font-semibold text-ink">Peças recentes</h2>
          {dashboard.recent.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Ainda não há peças"
                description="Carregue os dados de exemplo ou crie a primeira peça."
                action={<SeedButton />}
              />
            </div>
          ) : (
            <div className="mt-4">
              <Table
                columns={[
                  { key: "name", label: "Nome" },
                  { key: "printer", label: "Impressora" },
                  { key: "cost", label: "Custo", align: "right" },
                  { key: "price", label: "Preço", align: "right" },
                  { key: "margin", label: "Margem", align: "right" },
                ]}
              >
                {dashboard.recent.map((item) => (
                  <tr key={item.piece.id} className="hover:bg-orange-50/40">
                    <Td>
                      <p className="font-medium">{item.piece.name}</p>
                      <p className="text-xs text-muted">{shortId(item.piece.id)}</p>
                    </Td>
                    <Td>{item.piece.printer}</Td>
                    <Td align="right">{formatEuro(item.costs.total)}</Td>
                    <Td align="right" className="font-semibold text-accent">
                      {formatEuro(item.pricing.price)}
                    </Td>
                    <Td align="right">
                      <span className="inline-flex items-center gap-2">
                        {formatPercent(
                          item.pricing.minimumApplied
                            ? item.pricing.effectiveMargin
                            : item.pricing.marginPercent,
                        )}
                        {item.pricing.minimumApplied ? <Badge tone="warning">Mínimo</Badge> : null}
                      </span>
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-ink">Resumo</h2>
          {dashboard.pieceCount === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Adicione uma peça para ver custo médio, lucro e preços extremos.
            </p>
          ) : (
            <dl className="mt-2">
              <SummaryRow label="Custo médio" value={formatEuro(dashboard.averageCost)} />
              <SummaryRow label="Lucro médio" value={formatEuro(dashboard.averageProfit)} />
              <SummaryRow label="Peso médio de filamento" value={formatGrams(dashboard.averageWeight)} />
              {dashboard.highest ? (
                <SummaryRow
                  label="Preço mais alto"
                  value={`${dashboard.highest.piece.name} · ${formatEuro(dashboard.highest.pricing.price)}`}
                />
              ) : null}
              {dashboard.pieceCount > 1 && dashboard.lowest ? (
                <SummaryRow
                  label="Preço mais baixo"
                  value={`${dashboard.lowest.piece.name} · ${formatEuro(dashboard.lowest.pricing.price)}`}
                />
              ) : null}
            </dl>
          )}
        </Card>
      </div>
    </div>
  );
}
