export function normalizePhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = (digits.startsWith("234") ? digits.slice(3) : digits).replace(/^0+/, "");
  return local.slice(0, 10);
}

export function toApiPhone(raw: string): string {
  return `+234${normalizePhoneInput(raw)}`;
}
