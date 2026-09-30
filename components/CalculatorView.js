"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CostBreakdown from "@/components/CostBreakdown";
import EmptyState from "@/components/EmptyState";
import ElectricityProfileSelect from "@/components/ElectricityProfileSelect";
import PageHeader from "@/components/PageHeader";
import PriceSummary from "@/components/PriceSummary";
import SeedButton from "@/components/SeedButton";
import Select from "@/components/Select";
import { quotePiece } from "@/lib/calculations";
import { formatEuro, formatGrams, formatHours, formatRate } from "@/lib/format";

export default function CalculatorView({ pieces, settings, printers, electricityProfiles = [] }) {
  const router = useRouter();
  const [pieceId, setPieceId] = useState(pieces[0]?.id || "");
  const [profileId, setProfileId] = useState(settings.electricityProfileId || "");
  const selectedProfile =
    electricityProfiles.find((profile) => profile.id === profileId) ||
    electricityProfiles.find((profile) => profile.isDefault) ||
    null;
  const electricityPrice = selectedProfile?.pricePerKwh ?? settings.electricityPrice;
  const electricityLabel = selectedProfile?.name || settings.electricityProfileName || "";
  const selected = pieces.find((piece) => piece.id === pieceId) || pieces[0] || null;
  const quote = selected
    ? quotePiece({ piece: selected, settings, printers, electricityPrice })
    : null;

  useEffect(() => {
    function onFocus() {
      router.refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  return (
    <div>
      <PageHeader
        title="Calculadora"
        description="Escolha a peça e a casa. O preço da eletricidade muda o custo e o valor de venda."
        action={
          <Button href="/configuracoes" variant="secondary">
            Configurações
          </Button>
        }
      />

      {pieces.length === 0 ? (
        <EmptyState
          title="Sem peças para calcular"
          description="Crie uma peça ou carregue o exemplo do suporte de comandos."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button href="/pecas">Ir para peças</Button>
              <SeedButton />
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <ElectricityProfileSelect
                profiles={electricityProfiles}
                onChange={(profile) => {
                  if (profile) setProfileId(profile.id);
                }}
              />
              <Select
                label="Peça"
                name="piece"
                value={selected?.id || ""}
                onChange={(event) => setPieceId(event.target.value)}
                options={pieces.map((piece) => ({ value: piece.id, label: piece.name }))}
              />
            </div>
            {selected ? (
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Impressora</dt>
                  <dd className="font-medium text-ink">{selected.printer}</dd>
                </div>
                <div className="flex gap-6">
                  <div>
                    <dt className="text-muted">Impressão total</dt>
                    <dd className="font-medium text-ink">{formatHours(selected.printHours)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Criação</dt>
                    <dd className="font-medium text-ink">{formatHours(selected.creationHours)}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-muted">Plates</dt>
                  <dd className="mt-2 space-y-3">
                    {(selected.plates?.length
                      ? selected.plates
                      : [{ id: "single", printHours: selected.printHours, filaments: selected.filaments }]
                    ).map((plate, index) => (
                      <div key={plate.id || index}>
                        <p className="text-xs font-medium text-muted">
                          Plate {index + 1} · {formatHours(plate.printHours)}
                        </p>
                        <div className="mt-1 space-y-1">
                          {plate.filaments.map((line) => (
                            <p key={line.id} className="text-ink">
                              {line.material} {line.color} · {formatGrams(line.grams)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : null}
            {quote ? (
              <p className="mt-5 text-xs leading-5 text-muted">
                Eletricidade{electricityLabel ? ` (${electricityLabel})` : ""} e desgaste da máquina usam a soma do tempo de todas as plates ({formatRate(quote.rates.averagePower)} kW × {formatRate(electricityPrice)} €/kWh, máquina {formatEuro(quote.rates.machineCost)}/h).
                Mão de obra {formatEuro(settings.laborCost)}/h e embalagem contam uma vez.
              </p>
            ) : null}
          </Card>

          {quote?.pricing.valid ? (
            <>
              <Card className="lg:col-span-3">
                <div className="grid gap-6 md:grid-cols-2">
                  <CostBreakdown costs={quote.costs} />
                  <PriceSummary pricing={quote.pricing} />
                </div>
                <p className="mt-6 text-xs leading-5 text-muted">
                  Preço recomendado = custo total / (1 − margem / 100). Se ficar abaixo do preço mínimo, é usado o mínimo.
                </p>
              </Card>
            </>
          ) : (
            <Card className="lg:col-span-3">
              <p className="text-sm text-muted">
                A margem nas configurações tem de ser inferior a 100% para calcular o preço.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
