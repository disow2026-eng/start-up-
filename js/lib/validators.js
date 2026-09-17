export function isRequired(value) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isMinLength(value, min) {
  return String(value || "").length >= min;
}

export function isNumberInRange(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}
