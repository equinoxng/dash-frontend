const BANK_KEY = "dash_bank_accounts";

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

const SEED: BankAccount[] = [];

export function getBankAccounts(): BankAccount[] {
  if (typeof window === "undefined") return SEED;
  const stored = localStorage.getItem(BANK_KEY);
  return stored ? JSON.parse(stored) : SEED;
}

export function addBankAccount(account: Omit<BankAccount, "id">): BankAccount {
  const list = getBankAccounts();
  const next: BankAccount = { ...account, id: Date.now().toString() };
  localStorage.setItem(BANK_KEY, JSON.stringify([...list, next]));
  return next;
}

export function removeBankAccount(id: string) {
  const list = getBankAccounts().filter((a) => a.id !== id);
  localStorage.setItem(BANK_KEY, JSON.stringify(list));
}
