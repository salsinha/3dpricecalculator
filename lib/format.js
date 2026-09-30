const euroFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("pt-PT", {
  maximumFractionDigits: 2,
});

export function formatEuro(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return euroFormatter.format(number);
}

export function formatNumber(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(number);
}

export function formatRate(value, digits = 4) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(number);
}

export function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${numberFormatter.format(number)}%`;
}

export function formatGrams(value) {
  return `${formatNumber(value)} g`;
}

export function formatHours(value) {
  return `${formatNumber(value)} h`;
}

export function formatInputNumber(value) {
  if (value == null || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(number).replace(".", ",");
}

export function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (value == null) return NaN;

  let text = String(value).trim().replace(/\s/g, "");
  if (!text) return NaN;

  const hasComma = text.includes(",");
  const hasDot = text.includes(".");

  if (hasComma && hasDot) {
    if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      text = text.replace(/,/g, "");
    }
  } else if (hasComma) {
    text = text.replace(",", ".");
  }

  if (!/^[+-]?\d+(\.\d+)?$/.test(text)) return NaN;
  return Number(text);
}

export function shortId(id) {
  if (!id) return "—";
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
