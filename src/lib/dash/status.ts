import type { TxStatus } from "./types";

export type BadgeTone = "live" | "success" | "warning" | "danger" | "neutral" | "ink";

export const STATUS_META: Record<TxStatus, { label: string; tone: BadgeTone; customerLabel: string }> = {
  CREATED: { label: "Draft", tone: "neutral", customerLabel: "Request created" },
  PAYMENT_PENDING: { label: "Payment pending", tone: "warning", customerLabel: "Awaiting payment" },
  PAYMENT_CONFIRMED: { label: "Payment confirmed", tone: "live", customerLabel: "Payment confirmed" },
  CASH_PREPARING: { label: "Cash preparing", tone: "live", customerLabel: "Preparing your cash" },
  RIDER_ASSIGNED: { label: "Rider assigned", tone: "live", customerLabel: "Rider assigned" },
  CASH_COLLECTED: { label: "Cash collected", tone: "live", customerLabel: "Rider has your cash" },
  IN_TRANSIT: { label: "In transit", tone: "live", customerLabel: "Rider on the way" },
  DELIVERED: { label: "Delivered", tone: "success", customerLabel: "Cash delivered" },
  COMPLETED: { label: "Completed", tone: "success", customerLabel: "Completed" },
  PAYMENT_FAILED: { label: "Payment failed", tone: "danger", customerLabel: "Payment failed" },
  PAYMENT_EXPIRED: { label: "Payment expired", tone: "danger", customerLabel: "Payment expired" },
  VENDOR_UNAVAILABLE: { label: "Vendor unavailable", tone: "warning", customerLabel: "Cash unavailable nearby" },
  RIDER_UNAVAILABLE: { label: "Rider unavailable", tone: "warning", customerLabel: "Finding another rider" },
  DELIVERY_FAILED: { label: "Delivery failed", tone: "danger", customerLabel: "Delivery failed" },
  DELIVERY_CANCELLED: { label: "Cancelled", tone: "neutral", customerLabel: "Cancelled" },
  REFUND_PENDING: { label: "Refund pending", tone: "warning", customerLabel: "Refund on the way" },
  REFUNDED: { label: "Refunded", tone: "neutral", customerLabel: "Refunded" },
  DISPUTED: { label: "Disputed", tone: "danger", customerLabel: "Under review" },
};

export const TERMINAL_STATUSES: TxStatus[] = [
  "COMPLETED",
  "REFUNDED",
  "DELIVERY_CANCELLED",
  "PAYMENT_FAILED",
  "PAYMENT_EXPIRED",
];

export const ISSUE_STATUSES: TxStatus[] = [
  "PAYMENT_FAILED",
  "PAYMENT_EXPIRED",
  "VENDOR_UNAVAILABLE",
  "RIDER_UNAVAILABLE",
  "DELIVERY_FAILED",
  "DELIVERY_CANCELLED",
  "REFUND_PENDING",
  "REFUNDED",
  "DISPUTED",
];

export const ACTIVE_STATUSES: TxStatus[] = [
  "CREATED",
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "CASH_PREPARING",
  "RIDER_ASSIGNED",
  "CASH_COLLECTED",
  "IN_TRANSIT",
  "DELIVERED",
];

export const TIMELINE_STEPS: { status: TxStatus; label: string; description: string }[] = [
  { status: "PAYMENT_CONFIRMED", label: "Payment confirmed", description: "Your payment was verified by the provider." },
  { status: "CASH_PREPARING", label: "Cash being prepared", description: "A nearby cash vendor is counting your notes." },
  { status: "RIDER_ASSIGNED", label: "Rider assigned", description: "A verified rider is heading to collect the cash." },
  { status: "IN_TRANSIT", label: "Rider on the way", description: "Your cash is on its way to the recipient." },
  { status: "DELIVERED", label: "Cash delivered", description: "The recipient confirmed handoff with a one-time code." },
];

export function timelineRank(status: TxStatus, history: { status: TxStatus }[] = []): number {
  if (status === "DELIVERED" || status === "COMPLETED" || status === "DISPUTED") return 5;
  if (status === "IN_TRANSIT" || status === "CASH_COLLECTED") return 4;
  if (status === "RIDER_ASSIGNED") return 3;
  if (status === "CASH_PREPARING" || status === "VENDOR_UNAVAILABLE") return 2;
  if (status === "PAYMENT_CONFIRMED") return 1;
  if (status === "PAYMENT_PENDING" || status === "CREATED") return 0;
  return Math.max(0, history.filter((h) => TIMELINE_STEPS.some((s) => s.status === h.status)).length);
}

export function isActiveStatus(status: TxStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isIssueStatus(status: TxStatus): boolean {
  return ISSUE_STATUSES.includes(status);
}
