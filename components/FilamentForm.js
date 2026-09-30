"use client";

import { useMemo, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { pricePerKg } from "@/lib/calculations";
import { formatEuro, formatInputNumber, parseNumber } from "@/lib/format";
import { validateFilament } from "@/lib/validation";

function initialValues(filament) {
  if (!filament) {
    return { brand: "", material: "", color: "", rollPrice: "", rollWeight: "" };
  }
  return {
    brand: filament.brand,
    material: filament.material,
    color: filament.color,
    rollPrice: formatInputNumber(filament.rollPrice),
    rollWeight: formatInputNumber(filament.rollWeight),
  };
}

export default function FilamentForm({ initial, onSubmit, onClose, submitting = false }) {
  const [values, setValues] = useState(() => initialValues(initial));
  const [errors, setErrors] = useState({});

  const perKg = useMemo(() => {
    const price = parseNumber(values.rollPrice);
    const weight = parseNumber(values.rollWeight);
    if (!Number.isFinite(price) || !Number.isFinite(weight) || weight <= 0 || price < 0) return null;
    return pricePerKg(price, weight);
  }, [values.rollPrice, values.rollWeight]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateFilament(values);
    setErrors(result.errors);
    if (!result.ok) return;
    onSubmit(result.value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Marca"
        name="brand"
        value={values.brand}
        onChange={(event) => update("brand", event.target.value)}
        error={errors.brand}
        autoFocus
        placeholder="Bambu Lab"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Material"
          name="material"
          value={values.material}
          onChange={(event) => update("material", event.target.value)}
          error={errors.material}
          placeholder="PLA"
        />
        <Input
          label="Cor"
          name="color"
          value={values.color}
          onChange={(event) => update("color", event.target.value)}
          error={errors.color}
          placeholder="Branco"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Preço do rolo (€)"
          name="rollPrice"
          inputMode="decimal"
          value={values.rollPrice}
          onChange={(event) => update("rollPrice", event.target.value)}
          error={errors.rollPrice}
          placeholder="16,99"
        />
        <Input
          label="Peso do rolo (g)"
          name="rollWeight"
          inputMode="decimal"
          value={values.rollWeight}
          onChange={(event) => update("rollWeight", event.target.value)}
          error={errors.rollWeight}
          placeholder="1000"
        />
      </div>
      <div className="rounded-xl bg-paper px-4 py-3">
        <p className="text-xs text-muted">Preço por kg</p>
        <p className="mt-1 text-xl font-semibold text-ink tabular-nums">
          {perKg == null ? "—" : `${formatEuro(perKg)}/kg`}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
