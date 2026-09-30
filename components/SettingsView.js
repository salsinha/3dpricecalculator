"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import SeedButton from "@/components/SeedButton";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { formatEuro, formatInputNumber, formatRate } from "@/lib/format";
import { validatePrinter, validateSettings } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { createPrinter, deletePrinter, saveSettings } from "@/services/settings";

function settingsForm(settings) {
  return {
    electricityPrice: formatInputNumber(settings.electricityPrice),
    laborCost: formatInputNumber(settings.laborCost),
    machineCost: formatInputNumber(settings.machineCost),
    defaultMargin: formatInputNumber(settings.defaultMargin),
    minimumPrice: formatInputNumber(settings.minimumPrice),
    averagePower: formatInputNumber(settings.averagePower),
    printerName: settings.printerName,
  };
}

export default function SettingsView({ settings, printers }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(() => settingsForm(settings));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [printerValues, setPrinterValues] = useState({
    name: "",
    averagePower: "",
    machineCost: "",
  });
  const [printerErrors, setPrinterErrors] = useState({});
  const [addingPrinter, setAddingPrinter] = useState(false);
  const [pendingPrinter, setPendingPrinter] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = validateSettings(values);
    setErrors(result.errors);
    if (!result.ok) return;

    setSaving(true);
    try {
      await saveSettings(createClient(), result.value);
      toast.success("Configurações guardadas.");
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPrinter(event) {
    event.preventDefault();
    const result = validatePrinter(printerValues);
    setPrinterErrors(result.errors);
    if (!result.ok) return;

    setAddingPrinter(true);
    try {
      await createPrinter(createClient(), result.value);
      setPrinterValues({ name: "", averagePower: "", machineCost: "" });
      toast.success("Impressora adicionada.");
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
    } finally {
      setAddingPrinter(false);
    }
  }

  async function confirmDeletePrinter() {
    if (!pendingPrinter) return;
    setDeleting(true);
    try {
      await deletePrinter(createClient(), pendingPrinter);
      toast.success("Impressora eliminada.");
      setPendingPrinter(null);
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
        title="Configurações"
        description="Estes valores entram no cálculo de todas as peças e da calculadora."
      />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Preço da eletricidade (€/kWh)"
              name="electricityPrice"
              inputMode="decimal"
              value={values.electricityPrice}
              onChange={(event) => update("electricityPrice", event.target.value)}
              error={errors.electricityPrice}
            />
            <Input
              label="Custo de mão de obra (€/hora)"
              name="laborCost"
              inputMode="decimal"
              value={values.laborCost}
              onChange={(event) => update("laborCost", event.target.value)}
              error={errors.laborCost}
            />
            <Input
              label="Custo de máquina (€/hora)"
              name="machineCost"
              inputMode="decimal"
              value={values.machineCost}
              onChange={(event) => update("machineCost", event.target.value)}
              error={errors.machineCost}
            />
            <Input
              label="Margem standard (%)"
              name="defaultMargin"
              inputMode="decimal"
              value={values.defaultMargin}
              onChange={(event) => update("defaultMargin", event.target.value)}
              error={errors.defaultMargin}
              hint="Sobre o preço de venda, não sobre o custo."
            />
            <Input
              label="Preço mínimo (€)"
              name="minimumPrice"
              inputMode="decimal"
              value={values.minimumPrice}
              onChange={(event) => update("minimumPrice", event.target.value)}
              error={errors.minimumPrice}
            />
            <Input
              label="Consumo médio (kW)"
              name="averagePower"
              inputMode="decimal"
              value={values.averagePower}
              onChange={(event) => update("averagePower", event.target.value)}
              error={errors.averagePower}
            />
            <div className="sm:col-span-2">
              <Input
                label="Impressora predefinida"
                name="printerName"
                value={values.printerName}
                onChange={(event) => update("printerName", event.target.value)}
                error={errors.printerName}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" loading={saving}>
              Guardar configurações
            </Button>
          </div>
        </Card>
      </form>

      <Card className="mt-4">
        <h2 className="text-base font-semibold text-ink">Impressoras</h2>
        <p className="mt-1 text-sm text-muted">
          A impressora predefinida usa o consumo e o desgaste acima. Pode adicionar outras para peças diferentes.
        </p>
        <div className="mt-4 divide-y divide-line">
          {printers.map((printer) => (
            <div key={printer.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{printer.name}</p>
                  {printer.isDefault ? <Badge tone="accent">Predefinida</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatRate(printer.averagePower)} kW · {formatEuro(printer.machineCost ?? settings.machineCost)}/h
                </p>
              </div>
              {printer.isDefault ? null : (
                <Button variant="ghost" className="px-2 py-1" onClick={() => setPendingPrinter(printer)}>
                  Eliminar
                </Button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddPrinter} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-4" noValidate>
          <Input
            label="Nome"
            name="printer-name"
            value={printerValues.name}
            onChange={(event) => setPrinterValues((current) => ({ ...current, name: event.target.value }))}
            error={printerErrors.name}
            placeholder="Bambu Lab P1S"
          />
          <Input
            label="Consumo (kW)"
            name="printer-power"
            inputMode="decimal"
            value={printerValues.averagePower}
            onChange={(event) =>
              setPrinterValues((current) => ({ ...current, averagePower: event.target.value }))
            }
            error={printerErrors.averagePower}
            placeholder="0,12"
          />
          <Input
            label="Máquina (€/h)"
            name="printer-machine"
            inputMode="decimal"
            value={printerValues.machineCost}
            onChange={(event) =>
              setPrinterValues((current) => ({ ...current, machineCost: event.target.value }))
            }
            error={printerErrors.machineCost}
            placeholder="0,50"
          />
          <div className="sm:pt-7">
            <Button type="submit" variant="secondary" loading={addingPrinter} className="w-full">
              Adicionar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="text-base font-semibold text-ink">Dados de exemplo</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          Cria os filamentos PLA branco, preto e vermelho e a peça Suporte de comandos, se ainda não existirem. Não apaga dados já guardados.
        </p>
        <div className="mt-4">
          <SeedButton />
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingPrinter)}
        title="Eliminar impressora"
        message={
          pendingPrinter
            ? `Eliminar ${pendingPrinter.name}? As peças que usam este nome passam a usar os valores gerais.`
            : ""
        }
        onClose={() => setPendingPrinter(null)}
        onConfirm={confirmDeletePrinter}
        loading={deleting}
      />
    </div>
  );
}
