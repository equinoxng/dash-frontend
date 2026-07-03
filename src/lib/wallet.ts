import { apiFetch } from "./api";

export type Wallet = {
  balance: number;
  escrowBalance: number;
  currency: string;
};

export function getWallet(token: string) {
  return apiFetch<Wallet>("/api/wallet", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fundWallet(token: string, amount: number, pin: string) {
  return apiFetch<Wallet>("/api/wallet/fund", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount, pin }),
  });
}

export function withdrawWallet(token: string, amount: number, pin: string) {
  return apiFetch<Wallet>("/api/wallet/withdraw", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount, pin }),
  });
}
