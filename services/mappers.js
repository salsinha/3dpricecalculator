import { pricePerKg } from "@/lib/calculations";

export function toNumber(value, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function mapFilament(row) {
  const rollPrice = toNumber(row.roll_price);
  const rollWeight = toNumber(row.roll_weight);
  return {
    id: row.id,
    brand: row.brand,
    material: row.material,
    color: row.color,
    rollPrice,
    rollWeight,
    pricePerKg:
      row.price_per_kg == null
        ? pricePerKg(rollPrice, rollWeight)
        : toNumber(row.price_per_kg),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPiece(row) {
  const lines = Array.isArray(row.piece_filaments) ? row.piece_filaments : [];
  return {
    id: row.id,
    name: row.name,
    printer: row.printer,
    printHours: toNumber(row.print_hours),
    creationHours: toNumber(row.creation_hours),
    packagingCost: toNumber(row.packaging_cost),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    filaments: lines.map((line) => {
      const filament = line.filaments || {};
      const rollPrice = toNumber(filament.roll_price);
      const rollWeight = toNumber(filament.roll_weight);
      return {
        id: line.id,
        filamentId: line.filament_id,
        grams: toNumber(line.grams),
        brand: filament.brand || "",
        material: filament.material || "",
        color: filament.color || "",
        pricePerKg:
          filament.price_per_kg == null
            ? pricePerKg(rollPrice, rollWeight)
            : toNumber(filament.price_per_kg),
      };
    }),
  };
}

export function mapSettings(row) {
  return {
    id: row.id,
    electricityPrice: toNumber(row.electricity_price),
    laborCost: toNumber(row.labor_cost),
    machineCost: toNumber(row.machine_cost),
    defaultMargin: toNumber(row.default_margin),
    minimumPrice: toNumber(row.minimum_price),
    averagePower: toNumber(row.average_power),
    printerName: row.printer_name,
    updatedAt: row.updated_at,
  };
}

export function mapPrinter(row) {
  return {
    id: row.id,
    name: row.name,
    averagePower: toNumber(row.average_power),
    machineCost: row.machine_cost == null ? null : toNumber(row.machine_cost),
    isDefault: Boolean(row.is_default),
  };
}
