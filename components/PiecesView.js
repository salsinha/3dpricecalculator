"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import PieceForm from "@/components/PieceForm";
import SeedButton from "@/components/SeedButton";
import { Table, Td } from "@/components/Table";
import { useToast } from "@/components/Toast";
import { quotePiece } from "@/lib/calculations";
import { toUserMessage } from "@/lib/errors";
import { formatEuro, formatGrams, formatPercent, shortId } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { deletePiece, savePiece } from "@/services/pieces";

export default function PiecesView({ pieces, filaments, settings, printers }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const rows = pieces
    .map((piece) => ({ piece, ...quotePiece({ piece, settings, printers }) }))
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
          <Input
            label="Pesquisar"
            name="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome ou impressora"
          />
        </Card>
      )}

      {pieces.length === 0 ? (
        <EmptyState
          title="Sem peças"
          description="Registe uma peça com o tempo de impressão, o trabalho e os filamentos usados."
          action={<SeedButton />}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Sem resultados" description="Nenhuma peça corresponde à pesquisa." />
      ) : (
        <Card padded={false}>
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
                  <p className="text-xs text-muted">{shortId(item.piece.id)}</p>
                </Td>
                <Td>{item.piece.printer}</Td>
                <Td>
                  <div className="space-y-1">
                    {item.piece.filaments.map((line) => (
                      <p key={line.id} className="text-xs text-muted">
                        {line.material} {line.color} · {formatGrams(line.grams)}
                      </p>
                    ))}
                  </div>
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
            settings={settings}
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
