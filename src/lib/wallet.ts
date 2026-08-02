import { apiFetch } from "./api";

export type Wallet = {
  balance: number;
  escrowBalance: number;
  currency: string;
  frozen: boolean;
};

type WalletResponseDto = {
  balanceKobo: number;
  escrowBalanceKobo: number;
  currency: string;
  frozen: boolean;
};

function fromDto(dto: WalletResponseDto): Wallet {
  return {
    balance: dto.balanceKobo / 100,
    escrowBalance: dto.escrowBalanceKobo / 100,
    currency: dto.currency,
    frozen: dto.frozen,
  };
}

export async function getWallet(token: string): Promise<Wallet> {
  const dto = await apiFetch<WalletResponseDto>("/api/wallet", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return fromDto(dto);
}

export async function fundWallet(token: string, amount: number, pin: string): Promise<Wallet> {
  const dto = await apiFetch<WalletResponseDto>("/api/wallet/fund", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amountKobo: Math.round(amount * 100), pin }),
  });
  return fromDto(dto);
}

export async function withdrawWallet(token: string, amount: number, pin: string): Promise<Wallet> {
  const dto = await apiFetch<WalletResponseDto>("/api/wallet/withdraw", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amountKobo: Math.round(amount * 100), pin }),
  });
  return fromDto(dto);
}
