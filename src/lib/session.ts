import type { AccountType } from "./auth";

const SESSION_KEY = "dash_session";

export type Session = {
  token: string;
  accountType: AccountType;
  accountId: string;
  fullName: string;
  phoneNumber: string;
};

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
