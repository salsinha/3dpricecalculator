/**
 * Custo de uma linha de filamento.
 * precoKg / 1000 * gramas
 */
export function filamentLineCost(pricePerKg, grams) {
  return (Number(pricePerKg) / 1000) * Number(grams);
}

/**
 * Preço por quilograma a partir do rolo.
 * precoRolo / pesoRolo * 1000
 */
export function pricePerKg(rollPrice, rollWeight) {
  const weight = Number(rollWeight);
  if (!weight) return 0;
  return (Number(rollPrice) / weight) * 1000;
}

export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Custo total de uma peça.
 * Não aplica margem. A margem é calculada em calculateSalePrice.
 */
export function calculatePieceCost({
  printHours,
  creationHours,
  packagingCost,
  lines = [],
  electricityPrice,
  laborCost,
  machineCost,
  averagePower,
}) {
  const filamentLines = lines.map((line) => ({
    ...line,
    cost: filamentLineCost(line.pricePerKg, line.grams),
  }));

  const filament = filamentLines.reduce((sum, line) => sum + line.cost, 0);
  const electricity =
    Number(printHours) * Number(averagePower) * Number(electricityPrice);
  const labor = Number(creationHours) * Number(laborCost);
  const machine = Number(printHours) * Number(machineCost);
  const packaging = Number(packagingCost) || 0;
  const total = filament + electricity + labor + machine + packaging;

  return {
    filament,
    electricity,
    labor,
    machine,
    packaging,
    total,
    filamentLines,
  };
}

/**
 * Margem sobre o preço de venda:
 * precoVenda = custoTotal / (1 - margem / 100)
 *
 * Se o resultado for inferior ao preço mínimo, usa o preço mínimo.
 */
export function calculateSalePrice(totalCost, marginPercent, minimumPrice) {
  const margin = Number(marginPercent);
  const cost = Number(totalCost) || 0;
  const minimum = Number(minimumPrice) || 0;

  if (!Number.isFinite(margin) || margin < 0 || margin >= 100) {
    return {
      valid: false,
      rawPrice: 0,
      price: 0,
      profit: 0,
      marginPercent: margin,
      effectiveMargin: 0,
      minimumApplied: false,
    };
  }

  const rawPrice = cost / (1 - margin / 100);
  const minimumApplied = roundMoney(rawPrice) < roundMoney(minimum);
  const price = minimumApplied ? minimum : rawPrice;
  const profit = price - cost;
  const effectiveMargin = price > 0 ? (profit / price) * 100 : 0;

  return {
    valid: true,
    rawPrice,
    price,
    profit,
    marginPercent: margin,
    effectiveMargin,
    minimumApplied,
  };
}

export function resolveRates(settings, printers, printerName) {
  const name = String(printerName || "").trim().toLowerCase();
  const match = (printers || []).find(
    (printer) => printer.name.trim().toLowerCase() === name,
  );

  return {
    averagePower: match ? match.averagePower : settings.averagePower,
    machineCost:
      match && match.machineCost != null
        ? match.machineCost
        : settings.machineCost,
    matchedPrinter: match || null,
  };
}

export function quotePiece({ piece, settings, printers }) {
  const rates = resolveRates(settings, printers, piece.printer);
  const costs = calculatePieceCost({
    printHours: piece.printHours,
    creationHours: piece.creationHours,
    packagingCost: piece.packagingCost,
    lines: piece.filaments || [],
    electricityPrice: settings.electricityPrice,
    laborCost: settings.laborCost,
    machineCost: rates.machineCost,
    averagePower: rates.averagePower,
  });
  const pricing = calculateSalePrice(
    costs.total,
    settings.defaultMargin,
    settings.minimumPrice,
  );

  return { costs, pricing, rates };
}
