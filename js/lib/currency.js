const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatCurrency(amount) {
  return formatter.format(Number.isFinite(amount) ? amount : 0);
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}
