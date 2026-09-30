"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import FilamentForm from "@/components/FilamentForm";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import SeedButton from "@/components/SeedButton";
import Select from "@/components/Select";
import { Table, Td } from "@/components/Table";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { formatEuro, formatGrams, shortId } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { createFilament, deleteFilament, updateFilament } from "@/services/filaments";

export default function FilamentsView({ filaments }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [material, setMaterial] = useState("all");
  const [brand, setBrand] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const materials = useMemo(
    () => [...new Set(filaments.map((item) => item.material))].sort((a, b) => a.localeCompare(b, "pt")),
    [filaments],
  );
  const brands = useMemo(
    () => [...new Set(filaments.map((item) => item.brand))].sort((a, b) => a.localeCompare(b, "pt")),
    [filaments],
  );

  const filtered = filaments.filter((item) => {
    const haystack = `${item.brand} ${item.material} ${item.color}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesMaterial = material === "all" || item.material === material;
    const matchesBrand = brand === "all" || item.brand === brand;
    return matchesQuery && matchesMaterial && matchesBrand;
  });

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setEditing(null);
  }

  async function handleSave(values) {
    setSaving(true);
    try {
      const supabase = createClient();
      if (editing) {
        await updateFilament(supabase, editing.id, values);
        toast.success("Filamento atualizado.");
      } else {
        await createFilament(supabase, values);
        toast.success("Filamento adicionado.");
      }
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
      await deleteFilament(createClient(), pendingDelete.id);
      toast.success("Filamento eliminado.");
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
        title="Filamentos"
        description="Preço do rolo, peso e preço por quilograma calculado automaticamente."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Adicionar filamento
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Pesquisar"
            name="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Marca, material ou cor"
          />
          <Select
            label="Material"
            name="material"
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            options={[{ value: "all", label: "Todos os materiais" }, ...materials.map((item) => ({ value: item, label: item }))]}
          />
          <Select
            label="Marca"
            name="brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            options={[{ value: "all", label: "Todas as marcas" }, ...brands.map((item) => ({ value: item, label: item }))]}
          />
        </div>
      </Card>

      {filaments.length === 0 ? (
        <EmptyState
          title="Sem filamentos"
          description="Adicione um rolo ou carregue os três filamentos de exemplo."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                Adicionar filamento
              </Button>
              <SeedButton />
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Sem resultados" description="Nenhum filamento corresponde à pesquisa ou aos filtros." />
      ) : (
        <Card padded={false}>
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "brand", label: "Marca" },
              { key: "material", label: "Material" },
              { key: "color", label: "Cor" },
              { key: "roll", label: "Preço do rolo", align: "right" },
              { key: "weight", label: "Peso", align: "right" },
              { key: "kg", label: "Preço / kg", align: "right" },
              { key: "actions", label: "" },
            ]}
          >
            {filtered.map((filament) => (
              <tr key={filament.id} className="hover:bg-orange-50/40">
                <Td className="font-mono text-xs text-muted">{shortId(filament.id)}</Td>
                <Td className="font-medium">{filament.brand}</Td>
                <Td>
                  <Badge tone="accent">{filament.material}</Badge>
                </Td>
                <Td>{filament.color}</Td>
                <Td align="right">{formatEuro(filament.rollPrice)}</Td>
                <Td align="right">{formatGrams(filament.rollWeight)}</Td>
                <Td align="right" className="font-semibold">
                  {formatEuro(filament.pricePerKg)}
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      className="px-2 py-1"
                      onClick={() => {
                        setEditing(filament);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" className="px-2 py-1" onClick={() => setPendingDelete(filament)}>
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
        title={editing ? "Editar filamento" : "Novo filamento"}
        description="O preço por kg é o preço do rolo a dividir pelo peso, em euros por quilograma."
        onClose={closeModal}
      >
        <FilamentForm
          key={editing?.id || "new"}
          initial={editing}
          onSubmit={handleSave}
          onClose={closeModal}
          submitting={saving}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar filamento"
        message={
          pendingDelete
            ? `Eliminar ${pendingDelete.brand} ${pendingDelete.material} ${pendingDelete.color}? Esta ação não pode ser anulada.`
            : ""
        }
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
