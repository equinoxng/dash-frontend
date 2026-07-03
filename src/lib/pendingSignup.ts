import type { Role } from "./auth";

const PENDING_KEY = "dash_pending_signup";

export type PendingSignup = {
  role: Role;
  phoneNumber: string;
  payload: Record<string, string>;
};

export function savePendingSignup(pending: PendingSignup) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function getPendingSignup(): PendingSignup | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(PENDING_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearPendingSignup() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}
