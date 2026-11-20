export function formatNaira(amount: number, withDecimals = false): string {
  return (
    "₦" +
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: withDecimals ? 2 : 0,
      maximumFractionDigits: withDecimals ? 2 : 0,
    })
  );
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === "NGN") return formatNaira(amount, amount % 1 !== 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency === "CRYPTO" ? "USD" : currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Accepts 0801…, 801…, 234801…, +234801… and returns +234801… */
export function toNgPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("234")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);
  if (local.length !== 10) return null;
  if (!/^[7-9]/.test(local)) return null;
  return `+234${local}`;
}

export function formatNgPhone(raw: string): string {
  const normalized = toNgPhone(raw);
  if (!normalized) return raw;
  const local = "0" + normalized.slice(4);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function maskPhone(raw: string): string {
  return formatNgPhone(raw).replace(/\d(?=\d{4})/g, "•");
}

export function fullAddress(parts: { street: string; area: string; city: string }): string {
  return [parts.street, parts.area, parts.city].filter(Boolean).join(", ");
}

export function computeDeliveryFee(amount: number): number {
  if (amount <= 20_000) return 500;
  if (amount <= 50_000) return 750;
  return 1_000;
}

export const MIN_AMOUNT = 1_000;
export const MAX_AMOUNT = 500_000;
