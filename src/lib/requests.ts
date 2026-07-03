import { apiFetch } from "./api";

export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}

export type RequestType = "RECEIVE_CASH" | "SEND_CASH";

export type RequestStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PAYMENT_RECEIVED"
  | "RIDER_ASSIGNED"
  | "IN_PROGRESS"
  | "CONFIRMED"
  | "DISPUTED"
  | "CANCELLED"
  | "COMPLETED";

export type CashRequest = {
  requestId: string;
  type: RequestType;
  currency: string;
  amount: number;
  deliveryFee: number;
  serviceCharge: number;
  totalAmount: number;
  status: RequestStatus;
  deliveryAddress: string | null;
  deliveryContact: string | null;
  recipientName: string | null;
  createdAt: string;
};

export type CreateCashRequestPayload = {
  type: RequestType;
  pin: string;
  amount: number;
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  deliveryAddressId?: string;
};

export function createCashRequest(token: string, payload: CreateCashRequestPayload) {
  return apiFetch<CashRequest>("/api/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function confirmDelivery(token: string, requestId: string, pin: string) {
  return apiFetch<CashRequest>(`/api/requests/${requestId}/confirm`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pin }),
  });
}

export function listRequests(token: string) {
  return apiFetch<CashRequest[]>("/api/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
