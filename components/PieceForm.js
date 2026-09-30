"use client";

import { useMemo, useState } from "react";
import Button from "@/components/Button";
import CostBreakdown from "@/components/CostBreakdown";
import Input from "@/components/Input";
import PriceSummary from "@/components/PriceSummary";
import Select from "@/components/Select";
import { quotePiece } from "@/lib/calculations";
import { formatEuro, formatHours, formatInputNumber } from "@/lib/format";
import { validatePiece } from "@/lib/validation";

function emptyLine() {
  return { key: crypto.randomUUID(), filamentId: "", grams: "" };
}

function emptyPlate() {
  return { key: crypto.randomUUID(), printHours: "", filaments: [emptyLine()] };
}

function linesFromPiece(lines) {
  return lines.length
    ? lines.map((line) => ({
        key: line.id || crypto.randomUUID(),
        filamentId: line.filamentId,
        grams: formatInputNumber(line.grams),
      }))
    : [emptyLine()];
}

function initialValues(piece, settings) {
  if (!piece) {
    return {
      name: "",
      printer: settings.printerName || "",
      creationHours: "",
      packagingCost: "",
      plates: [emptyPlate()],
    };
  }

  const plates = piece.plates?.length
    ? piece.plates.map((plate) => ({
        key: plate.id || crypto.randomUUID(),
        printHours: formatInputNumber(plate.printHours),
        filaments: linesFromPiece(plate.filaments || []),
      }))
    : [
        {
          key: crypto.randomUUID(),
          printHours: formatInputNumber(piece.printHours),
          filaments: linesFromPiece(piece.filaments || []),
        },
      ];

  return {
    name: piece.name,
    printer: piece.printer,
    creationHours: formatInputNumber(piece.creationHours),
    packagingCost: formatInputNumber(piece.packagingCost),
    plates,
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
    const quote = quotePiece({
      piece: {
        ...result.value,
        plates: result.value.plates.map((plate) => ({
          printHours: plate.printHours,
          filaments: plate.filaments.map((line) => {
            const filament = filaments.find((item) => item.id === line.filamentId);
            return {
              grams: line.grams,
              pricePerKg: filament?.pricePerKg || 0,
              material: filament?.material || "",
              color: filament?.color || "",
              brand: filament?.brand || "",
            };
          }),
        })),
      },
      settings,
      printers,
    });
    return {
      ...quote,
      printHours: result.value.printHours,
      plateCount: result.value.plates.length,
    };
  }, [values, filaments, settings, printers]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updatePlate(plateKey, field, value) {
    setValues((current) => ({
      ...current,
      plates: current.plates.map((plate) =>
        plate.key === plateKey ? { ...plate, [field]: value } : plate,
      ),
    }));
  }

  function updateLine(plateKey, lineKey, field, value) {
    setValues((current) => ({
      ...current,
      plates: current.plates.map((plate) =>
        plate.key === plateKey
          ? {
              ...plate,
              filaments: plate.filaments.map((line) =>
                line.key === lineKey ? { ...line, [field]: value } : line,
              ),
            }
          : plate,
      ),
    }));
  }

  function addPlate() {
    setValues((current) => ({ ...current, plates: [...current.plates, emptyPlate()] }));
  }

  function removePlate(plateKey) {
    setValues((current) => ({
      ...current,
      plates: current.plates.filter((plate) => plate.key !== plateKey),
    }));
  }

  function addLine(plateKey) {
    setValues((current) => ({
      ...current,
      plates: current.plates.map((plate) =>
        plate.key === plateKey
          ? { ...plate, filaments: [...plate.filaments, emptyLine()] }
          : plate,
      ),
    }));
  }

  function removeLine(plateKey, lineKey) {
    setValues((current) => ({
      ...current,
      plates: current.plates.map((plate) =>
        plate.key === plateKey
          ? { ...plate, filaments: plate.filaments.filter((line) => line.key !== lineKey) }
          : plate,
      ),
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
          label="Tempo de criação (horas)"
          name="creationHours"
          inputMode="decimal"
          value={values.creationHours}
          onChange={(event) => update("creationHours", event.target.value)}
          error={errors.creationHours}
          placeholder="0,75"
          hint="Modelação e acabamento, uma vez por peça"
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
          <div>
            <h3 className="text-sm font-semibold text-ink">Plates</h3>
            <p className="text-xs text-muted">
              Cada plate tem o seu tempo. A eletricidade e o desgaste da máquina somam todas as plates. O mesmo filamento pode repetir-se.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={addPlate}>
            Adicionar plate
          </Button>
        </div>
        {errors.plates ? <p className="text-xs text-red-600">{errors.plates}</p> : null}
        {!filaments.length ? (
          <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">
            Crie pelo menos um filamento antes de guardar a peça.
          </p>
        ) : null}
        {values.plates.map((plate, plateIndex) => {
          const plateErrors = errors[`plate-${plateIndex}`] || {};
          return (
            <section key={plate.key} className="space-y-3 rounded-2xl border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-ink">Plate {plateIndex + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 py-1"
                  onClick={() => removePlate(plate.key)}
                  disabled={values.plates.length === 1}
                >
                  Remover plate
                </Button>
              </div>
              <div className="max-w-xs">
                <Input
                  label="Tempo de impressão (horas)"
                  inputMode="decimal"
                  value={plate.printHours}
                  onChange={(event) => updatePlate(plate.key, "printHours", event.target.value)}
                  error={plateErrors.printHours}
                  placeholder="5"
                />
              </div>
              {plateErrors.filaments ? (
                <p className="text-xs text-red-600">{plateErrors.filaments}</p>
              ) : null}
              {plate.filaments.map((line, lineIndex) => {
                const lineErrors = errors[`plate-${plateIndex}-line-${lineIndex}`] || {};
                return (
                  <div
                    key={line.key}
                    className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-[1fr_8rem_auto]"
                  >
                    <Select
                      label="Filamento"
                      value={line.filamentId}
                      onChange={(event) =>
                        updateLine(plate.key, line.key, "filamentId", event.target.value)
                      }
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
                      onChange={(event) => updateLine(plate.key, line.key, "grams", event.target.value)}
                      error={lineErrors.grams}
                      placeholder="80"
                    />
                    <div className="sm:pt-7">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeLine(plate.key, line.key)}
                        disabled={plate.filaments.length === 1}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="secondary"
                onClick={() => addLine(plate.key)}
                disabled={!filaments.length}
              >
                Adicionar filamento
              </Button>
            </section>
          );
        })}
      </div>

      {preview?.pricing.valid ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {preview.plateCount === 1 ? "1 plate" : `${preview.plateCount} plates`} · impressão total{" "}
            {formatHours(preview.printHours)}. A mão de obra e a embalagem contam uma vez.
          </p>
          <div className="grid gap-4 rounded-2xl bg-paper p-4 md:grid-cols-2">
            <CostBreakdown costs={preview.costs} />
            <PriceSummary pricing={preview.pricing} />
          </div>
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
