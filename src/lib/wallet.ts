const BALANCE_KEY = "dash_wallet_balance";

export function getBalance(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BALANCE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function setBalance(amount: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BALANCE_KEY, String(amount));
}

export function addToBalance(amount: number): number {
  const next = getBalance() + amount;
  setBalance(next);
  return next;
}

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}
