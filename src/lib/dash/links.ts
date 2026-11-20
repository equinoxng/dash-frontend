"use client";

export type DashLinkPayload = {
  reference: string;
  amount: number;
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  note?: string;
  createdAt: string;
};

export type SavedDashLink = DashLinkPayload & {
  token: string;
  path: string;
  url: string;
};

const LINKS_KEY = "dash:links:v1";

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeDashLink(payload: DashLinkPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeDashLink(token: string | string[] | undefined): DashLinkPayload | null {
  const value = Array.isArray(token) ? token[0] : token;
  if (!value) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<DashLinkPayload>;
    const digits = String(parsed.phone ?? "").replace(/\D/g, "");
    const phone = digits.startsWith("234") ? digits.slice(3) : digits.replace(/^0+/, "");

    if (
      typeof parsed.reference !== "string" ||
      !Number.isFinite(parsed.amount) ||
      Number(parsed.amount) <= 0 ||
      typeof parsed.name !== "string" ||
      phone.length !== 10 ||
      typeof parsed.street !== "string" ||
      typeof parsed.area !== "string" ||
      typeof parsed.city !== "string"
    ) {
      return null;
    }

    return {
      reference: parsed.reference,
      amount: Number(parsed.amount),
      name: parsed.name,
      phone,
      street: parsed.street,
      area: parsed.area,
      city: parsed.city,
      note: typeof parsed.note === "string" ? parsed.note : undefined,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function dashLinkPath(payload: DashLinkPayload): string {
  return `/pay/${encodeDashLink(payload)}`;
}

export function dashLinkUrl(payload: DashLinkPayload): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${dashLinkPath(payload)}`;
}

export function saveDashLink(payload: DashLinkPayload): SavedDashLink {
  const token = encodeDashLink(payload);
  const path = `/pay/${token}`;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const link: SavedDashLink = { ...payload, token, path, url: `${origin}${path}` };

  if (typeof window !== "undefined") {
    const existing = listDashLinks().filter((item) => item.reference !== payload.reference);
    localStorage.setItem(LINKS_KEY, JSON.stringify([link, ...existing].slice(0, 20)));
  }

  return link;
}

export function listDashLinks(): SavedDashLink[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LINKS_KEY);
    return stored ? (JSON.parse(stored) as SavedDashLink[]) : [];
  } catch {
    return [];
  }
}
