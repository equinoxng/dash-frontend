export function toApiPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("0") ? digits : `0${digits}`;
  return `+234${local.slice(1)}`;
}
