export const GYM_PHONE_REGEX = /^\(\d{2}\) 9\d{4}-\d{4}$/;

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function normalizeCoordinate(value: string) {
  return value.replace(/,/g, ".").replace(/[^\d.-]/g, "");
}

export function parseCoordinate(value: string) {
  const normalized = value.trim().replace(",", ".");
  return /^-?\d+(?:\.\d+)?$/.test(normalized)
    ? Number(normalized)
    : Number.NaN;
}

export function formatCoordinate(value: string | number) {
  return Number(value).toFixed(6);
}
