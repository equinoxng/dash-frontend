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

// Creating/confirming a web send or receive request no longer has a backend endpoint —
// the old POST /api/requests and POST /api/requests/{id}/confirm were removed when the
// backend's Request/RequestService became USSD-only. The replacement (the new transaction
// state machine) doesn't have a REST API yet; that lands with the send-flow milestone.
// listRequests (GET /api/requests) still works — it now only ever returns USSD-originated
// requests for web users, which is accurate given the above.
export const SEND_FLOW_AVAILABLE = false;

export function listRequests(token: string) {
  return apiFetch<CashRequest[]>("/api/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
