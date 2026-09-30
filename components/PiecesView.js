"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ElectricityProfileSelect from "@/components/ElectricityProfileSelect";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import PieceForm from "@/components/PieceForm";
import SeedButton from "@/components/SeedButton";
import { Table, Td } from "@/components/Table";
import { useToast } from "@/components/Toast";
import { quotePiece } from "@/lib/calculations";
import { toUserMessage } from "@/lib/errors";
import { formatEuro, formatGrams, formatHours, formatPercent } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { deletePiece, savePiece } from "@/services/pieces";

function PlateLines({ piece }) {
  const plates = piece.plates?.length
    ? piece.plates
    : [{ id: "single", filaments: piece.filaments }];

  return (
    <div className="space-y-2">
      {plates.map((plate, index) => (
        <div key={plate.id || index}>
          {piece.plates?.length > 1 ? (
            <p className="text-xs font-medium text-ink">Plate {index + 1}</p>
          ) : null}
          {plate.filaments.map((line) => (
            <p key={line.id} className="text-xs text-muted">
              {line.material} {line.color} · {formatGrams(line.grams)}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PiecesView({ pieces, filaments, settings, printers, electricityProfiles = [] }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileId, setProfileId] = useState(settings.electricityProfileId || "");
  const selectedProfile =
    electricityProfiles.find((profile) => profile.id === profileId) ||
    electricityProfiles.find((profile) => profile.isDefault) ||
    null;
  const electricityPrice = selectedProfile?.pricePerKwh ?? settings.electricityPrice;
  const pricedSettings = { ...settings, electricityPrice };

  const rows = pieces
    .map((piece) => ({
      piece,
      ...quotePiece({ piece, settings: pricedSettings, printers, electricityPrice }),
    }))
    .filter((item) => {
      const haystack = `${item.piece.name} ${item.piece.printer}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setEditing(null);
  }

  async function handleSave(values) {
    setSaving(true);
    try {
      await savePiece(createClient(), { ...values, id: editing?.id });
      toast.success(editing ? "Peça atualizada." : "Peça adicionada.");
      setOpen(false);
      setEditing(null);
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deletePiece(createClient(), pendingDelete.id);
      toast.success("Peça eliminada.");
      setPendingDelete(null);
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Peças"
        description="Cada peça pode usar vários filamentos. O custo e o preço atualizam com as configurações atuais."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            disabled={!filaments.length}
          >
            Adicionar peça
          </Button>
        }
      />

      {!filaments.length ? (
        <Card className="mb-4">
          <p className="text-sm text-muted">
            Crie um filamento antes de registar peças.{" "}
            <Link href="/filamentos" className="font-medium text-accent">
              Ir para filamentos
            </Link>
          </p>
        </Card>
      ) : (
        <Card className="mb-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ElectricityProfileSelect
              profiles={electricityProfiles}
              onChange={(profile) => {
                if (profile) setProfileId(profile.id);
              }}
            />
            <Input
              label="Pesquisar"
              name="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome ou impressora"
            />
          </div>
        </Card>
      )}

      {pieces.length === 0 ? (
        <EmptyState
          title="Sem peças"
          description="Registe uma peça com as plates, o tempo de cada uma e os filamentos usados."
          action={<SeedButton />}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Sem resultados" description="Nenhuma peça corresponde à pesquisa." />
      ) : (
        <>
          <Card padded={false} className="lg:hidden">
            <ul className="divide-y divide-line">
              {rows.map((item) => (
                <li key={item.piece.id} className="space-y-3 p-4">
                  <div>
                    <p className="font-medium text-ink">{item.piece.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {(item.piece.plates?.length || 1) === 1
                        ? "1 plate"
                        : `${item.piece.plates.length} plates`}{" "}
                      · {formatHours(item.piece.printHours)} · {item.piece.printer}
                    </p>
                  </div>
                  <PlateLines piece={item.piece} />
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-paper px-3 py-2 text-center">
                    <div>
                      <p className="text-[11px] text-muted">Custo</p>
                      <p className="text-sm font-medium tabular-nums">{formatEuro(item.costs.total)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted">Preço</p>
                      <p className="text-sm font-semibold text-accent tabular-nums">
                        {formatEuro(item.pricing.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted">Margem</p>
                      <p className="text-sm font-medium tabular-nums">
                        {formatPercent(
                          item.pricing.minimumApplied
                            ? item.pricing.effectiveMargin
                            : item.pricing.marginPercent,
                        )}
                      </p>
                      {item.pricing.minimumApplied ? (
                        <Badge tone="warning" className="mt-1">
                          Mínimo
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setEditing(item.piece);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setPendingDelete(item.piece)}>
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card padded={false} className="hidden lg:block">
          <Table
            columns={[
              { key: "name", label: "Peça" },
              { key: "printer", label: "Impressora" },
              { key: "filaments", label: "Filamentos" },
              { key: "cost", label: "Custo", align: "right" },
              { key: "price", label: "Preço", align: "right" },
              { key: "margin", label: "Margem", align: "right" },
              { key: "actions", label: "" },
            ]}
          >
            {rows.map((item) => (
              <tr key={item.piece.id} className="hover:bg-orange-50/40">
                <Td>
                  <p className="font-medium">{item.piece.name}</p>
                  <p className="text-xs text-muted">
                    {(item.piece.plates?.length || 1) === 1
                      ? "1 plate"
                      : `${item.piece.plates.length} plates`}{" "}
                    · {formatHours(item.piece.printHours)}
                  </p>
                </Td>
                <Td>{item.piece.printer}</Td>
                <Td>
                  <PlateLines piece={item.piece} />
                </Td>
                <Td align="right">{formatEuro(item.costs.total)}</Td>
                <Td align="right" className="font-semibold text-accent">
                  {formatEuro(item.pricing.price)}
                </Td>
                <Td align="right">
                  <span className="inline-flex items-center justify-end gap-2">
                    {formatPercent(
                      item.pricing.minimumApplied
                        ? item.pricing.effectiveMargin
                        : item.pricing.marginPercent,
                    )}
                    {item.pricing.minimumApplied ? <Badge tone="warning">Mínimo</Badge> : null}
                  </span>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      className="px-2 py-1"
                      onClick={() => {
                        setEditing(item.piece);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" className="px-2 py-1" onClick={() => setPendingDelete(item.piece)}>
                      Eliminar
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          </Card>
        </>
      )}

      <Modal
        open={open}
        wide
        title={editing ? "Editar peça" : "Nova peça"}
        description="O preço usa a margem sobre o valor de venda e o preço mínimo das configurações."
        onClose={closeModal}
      >
        {open ? (
          <PieceForm
            key={editing?.id || "new"}
            initial={editing}
            filaments={filaments}
            settings={pricedSettings}
            printers={printers}
            onSubmit={handleSave}
            onClose={closeModal}
            submitting={saving}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar peça"
        message={
          pendingDelete
            ? `Eliminar “${pendingDelete.name}”? Esta ação não pode ser anulada.`
            : ""
        }
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
