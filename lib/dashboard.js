import { quotePiece } from "@/lib/calculations";
import { average } from "@/lib/format";

export function buildDashboard({ pieces, filaments, settings, printers }) {
  const quotes = pieces.map((piece) => ({
    piece,
    ...quotePiece({ piece, settings, printers }),
  }));

  const prices = quotes.map((item) => item.pricing.price);
  const costs = quotes.map((item) => item.costs.total);
  const profits = quotes.map((item) => item.pricing.profit);
  const weights = pieces.map((piece) =>
    (piece.filaments || []).reduce((sum, line) => sum + Number(line.grams || 0), 0),
  );

  const byPrice = [...quotes].sort((a, b) => b.pricing.price - a.pricing.price);

  return {
    pieceCount: pieces.length,
    filamentCount: filaments.length,
    margin: settings.defaultMargin,
    averagePrice: average(prices),
    averageCost: average(costs),
    averageProfit: average(profits),
    averageWeight: average(weights),
    highest: byPrice[0] || null,
    lowest: byPrice.length ? byPrice[byPrice.length - 1] : null,
    recent: quotes.slice(0, 5),
    electricityProfileName: settings.electricityProfileName || "",
  };
}
