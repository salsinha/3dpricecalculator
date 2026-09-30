"use client";

import { useMemo, useState } from "react";
import Button from "@/components/Button";
import CostBreakdown from "@/components/CostBreakdown";
import Input from "@/components/Input";
import PriceSummary from "@/components/PriceSummary";
import Select from "@/components/Select";
import { quotePiece } from "@/lib/calculations";
import { formatEuro, formatInputNumber } from "@/lib/format";
import { validatePiece } from "@/lib/validation";

function emptyLine() {
  return { key: crypto.randomUUID(), filamentId: "", grams: "" };
}

function initialValues(piece, settings) {
  if (!piece) {
    return {
      name: "",
      printer: settings.printerName || "",
      printHours: "",
      creationHours: "",
      packagingCost: "",
      filaments: [emptyLine()],
    };
  }

  return {
    name: piece.name,
    printer: piece.printer,
    printHours: formatInputNumber(piece.printHours),
    creationHours: formatInputNumber(piece.creationHours),
    packagingCost: formatInputNumber(piece.packagingCost),
    filaments: piece.filaments.length
      ? piece.filaments.map((line) => ({
          key: line.id || crypto.randomUUID(),
          filamentId: line.filamentId,
          grams: formatInputNumber(line.grams),
        }))
      : [emptyLine()],
  };
}

export default function PieceForm({
  initial,
  filaments,
  settings,
  printers,
  onSubmit,
  onClose,
  submitting = false,
}) {
  const [values, setValues] = useState(() => initialValues(initial, settings));
  const [errors, setErrors] = useState({});

  const printerOptions = useMemo(() => {
    const names = printers.map((printer) => printer.name);
    if (values.printer && !names.includes(values.printer)) names.unshift(values.printer);
    return names.map((name) => ({ value: name, label: name }));
  }, [printers, values.printer]);

  const preview = useMemo(() => {
    const result = validatePiece(values);
    if (!result.ok) return null;
    return quotePiece({
      piece: {
        ...result.value,
        filaments: result.value.filaments.map((line) => {
          const filament = filaments.find((item) => item.id === line.filamentId);
          return {
            grams: line.grams,
            pricePerKg: filament?.pricePerKg || 0,
            material: filament?.material || "",
            color: filament?.color || "",
            brand: filament?.brand || "",
          };
        }),
      },
      settings,
      printers,
    });
  }, [values, filaments, settings, printers]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateLine(key, field, value) {
    setValues((current) => ({
      ...current,
      filaments: current.filaments.map((line) =>
        line.key === key ? { ...line, [field]: value } : line,
      ),
    }));
  }

  function addLine() {
    setValues((current) => ({ ...current, filaments: [...current.filaments, emptyLine()] }));
  }

  function removeLine(key) {
    setValues((current) => ({
      ...current,
      filaments: current.filaments.filter((line) => line.key !== key),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validatePiece(values);
    setErrors(result.errors);
    if (!result.ok) return;
    onSubmit(result.value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nome"
          name="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          error={errors.name}
          autoFocus
          placeholder="Suporte de comandos"
        />
        {printerOptions.length ? (
          <Select
            label="Impressora"
            name="printer"
            value={values.printer}
            onChange={(event) => update("printer", event.target.value)}
            options={printerOptions}
            error={errors.printer}
          />
        ) : (
          <Input
            label="Impressora"
            name="printer"
            value={values.printer}
            onChange={(event) => update("printer", event.target.value)}
            error={errors.printer}
          />
        )}
        <Input
          label="Tempo de impressão (horas)"
          name="printHours"
          inputMode="decimal"
          value={values.printHours}
          onChange={(event) => update("printHours", event.target.value)}
          error={errors.printHours}
          placeholder="5"
        />
        <Input
          label="Tempo de criação (horas)"
          name="creationHours"
          inputMode="decimal"
          value={values.creationHours}
          onChange={(event) => update("creationHours", event.target.value)}
          error={errors.creationHours}
          placeholder="0,75"
          hint="Modelação e acabamento"
        />
        <Input
          label="Embalagem (€)"
          name="packagingCost"
          inputMode="decimal"
          value={values.packagingCost}
          onChange={(event) => update("packagingCost", event.target.value)}
          error={errors.packagingCost}
          placeholder="0,50"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">Filamentos</h3>
          <Button type="button" variant="secondary" onClick={addLine} disabled={!filaments.length}>
            Adicionar filamento
          </Button>
        </div>
        {errors.filaments ? <p className="text-xs text-red-600">{errors.filaments}</p> : null}
        {!filaments.length ? (
          <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">
            Crie pelo menos um filamento antes de guardar a peça.
          </p>
        ) : null}
        {values.filaments.map((line, index) => {
          const lineErrors = errors[`line-${index}`] || {};
          return (
            <div key={line.key} className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-[1fr_8rem_auto]">
              <Select
                label="Filamento"
                value={line.filamentId}
                onChange={(event) => updateLine(line.key, "filamentId", event.target.value)}
                placeholder="Selecionar"
                error={lineErrors.filamentId}
                options={filaments.map((filament) => ({
                  value: filament.id,
                  label: `${filament.material} ${filament.color} · ${filament.brand} · ${formatEuro(filament.pricePerKg)}/kg`,
                }))}
              />
              <Input
                label="Gramas"
                inputMode="decimal"
                value={line.grams}
                onChange={(event) => updateLine(line.key, "grams", event.target.value)}
                error={lineErrors.grams}
                placeholder="80"
              />
              <div className="sm:pt-7">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeLine(line.key)}
                  disabled={values.filaments.length === 1}
                >
                  Remover
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {preview?.pricing.valid ? (
        <div className="grid gap-4 rounded-2xl bg-paper p-4 md:grid-cols-2">
          <CostBreakdown costs={preview.costs} />
          <PriceSummary pricing={preview.pricing} />
        </div>
      ) : (
        <p className="text-sm text-muted">Preencha os campos para ver o custo e o preço.</p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting} disabled={!filaments.length}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
