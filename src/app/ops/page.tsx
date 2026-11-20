"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Wordmark from "@/components/dash/Wordmark";
import Sheet from "@/components/dash/Sheet";
import StatusBadge from "@/components/dash/StatusBadge";
import Notice from "@/components/dash/Notice";
import { useDash } from "@/lib/dash/useDash";
import {
  addRider,
  addVendor,
  assignRider,
  assignVendor,
  canTransition,
  cancelTransaction,
  markDeliveryFailed,
  markPaymentFailed,
  markRefunded,
  queueRefund,
  resolveDispute,
  setRiderStatus,
  setVendorAvailability,
  updateDisputeStatus,
  vendorFor,
  riderFor,
} from "@/lib/dash/store";
import {
  formatDate,
  formatNaira,
  formatNgPhone,
  formatTime,
  initials,
  timeAgo,
} from "@/lib/dash/format";
import { STATUS_META, isActiveStatus, isIssueStatus } from "@/lib/dash/status";
import type {
  ActionResult,
  DashState,
  Dispute,
  Rider,
  Transaction,
  TxStatus,
} from "@/lib/dash/types";

type Tab = "overview" | "requests" | "vendors" | "riders" | "disputes" | "reconciliation";
type Flash = { tone: "success" | "error"; message: string };
type DateFilter = "today" | "7d" | "30d" | "all";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Live network" },
  { id: "requests", label: "Requests", hint: "Every cash job" },
  { id: "vendors", label: "Vendors", hint: "Cash liquidity" },
  { id: "riders", label: "Riders", hint: "Fleet status" },
  { id: "disputes", label: "Disputes", hint: "Sender cases" },
  { id: "reconciliation", label: "Reconciliation", hint: "Payments & fees" },
];

const ACTOR_LABEL: Record<string, string> = {
  SENDER: "Sender",
  RIDER: "Rider",
  VENDOR: "Vendor",
  OPS: "Operations",
  SYSTEM: "System",
};

const inFlightStatuses: TxStatus[] = ["RIDER_ASSIGNED", "CASH_COLLECTED", "IN_TRANSIT"];
const capturedStatuses: TxStatus[] = [
  "PAYMENT_CONFIRMED",
  "CASH_PREPARING",
  "RIDER_ASSIGNED",
  "CASH_COLLECTED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "DISPUTED",
];

function withinDate(iso: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const now = new Date();
  if (filter === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return new Date(iso).getTime() >= start;
  }
  const days = filter === "7d" ? 7 : 30;
  return new Date(iso).getTime() >= now.getTime() - days * 86_400_000;
}

function exportCsv(rows: Transaction[], filename: string) {
  const header = [
    "Reference",
    "Created",
    "Status",
    "Recipient",
    "Phone",
    "Area",
    "Amount",
    "Delivery fee",
    "Total",
    "Payment method",
    "Payment reference",
    "Vendor",
    "Rider",
  ];
  const lines = rows.map((tx) => [
    tx.reference,
    tx.createdAt,
    tx.status,
    tx.recipient.name,
    tx.recipient.phone,
    tx.recipient.area,
    tx.amount,
    tx.deliveryFee,
    tx.total,
    tx.paymentMethod,
    tx.payment?.providerReference ?? "",
    tx.vendorId ?? "",
    tx.riderId ?? "",
  ]);
  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Kpi({
  label,
  value,
  hint,
  tone = "plain",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "plain" | "ink" | "danger" | "success";
}) {
  const shell =
    tone === "ink"
      ? "bg-ink text-white border-transparent shadow-[0_24px_50px_-28px_rgba(27,19,48,0.6)]"
      : tone === "danger"
        ? "border-danger/15 bg-danger-soft text-danger"
        : tone === "success"
          ? "border-success/15 bg-success-soft text-success"
          : "app-card-flat";
  const muted =
    tone === "ink" ? "text-white/40" : tone === "danger" ? "text-danger/65" : tone === "success" ? "text-success/65" : "text-ink-soft";

  return (
    <div className={`rounded-[20px] border p-4 ${shell}`}>
      <p className={`text-[8.5px] font-bold uppercase tracking-[0.12em] ${muted}`}>{label}</p>
      <p className={`num mt-2 text-[26px] font-bold leading-none tracking-[-0.04em] ${tone === "plain" ? "text-ink" : ""}`}>
        {value}
      </p>
      {hint && <p className={`mt-1.5 text-[9.5px] leading-relaxed ${muted}`}>{hint}</p>}
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1 text-[24px] font-bold tracking-[-0.035em] text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-12 text-center text-[11.5px] text-ink-soft">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Requests                                                            */
/* ------------------------------------------------------------------ */

function RequestsTab({ state, onOpen }: { state: DashState; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [area, setArea] = useState("all");
  const [riderId, setRiderId] = useState("all");
  const [date, setDate] = useState<DateFilter>("all");

  const areas = Array.from(new Set(state.transactions.map((tx) => tx.recipient.area))).sort();

  const filtered = useMemo(() => {
    return [...state.transactions]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .filter((tx) => {
        const rider = state.riders.find((r) => r.id === tx.riderId);
        const vendor = state.vendors.find((v) => v.id === tx.vendorId);
        const haystack = [
          tx.reference,
          tx.recipient.name,
          tx.recipient.phone,
          tx.recipient.area,
          tx.recipient.street,
          rider?.name ?? "",
          vendor?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (query && !haystack.includes(query.toLowerCase())) return false;
        if (status === "active" && !isActiveStatus(tx.status)) return false;
        if (status === "issues" && !isIssueStatus(tx.status)) return false;
        if (status !== "all" && status !== "active" && status !== "issues" && tx.status !== status) return false;
        if (area !== "all" && tx.recipient.area !== area) return false;
        if (riderId !== "all" && tx.riderId !== riderId) return false;
        return withinDate(tx.createdAt, date);
      });
  }, [state, query, status, area, riderId, date]);

  return (
    <div>
      <SectionHead
        eyebrow="Requests"
        title="Every cash job"
        action={
          <button
            type="button"
            onClick={() => exportCsv(filtered, `dash-requests-${new Date().toISOString().slice(0, 10)}.csv`)}
            className="btn btn-outline btn-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
            Export CSV
          </button>
        }
      />

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        <label className="col-span-2 lg:col-span-1">
          <span className="field-label">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Reference, person, rider…"
            className="field"
          />
        </label>
        <label>
          <span className="field-label">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="field">
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="issues">Needs attention</option>
            <optgroup label="Cash flow">
              {(
                [
                  "PAYMENT_PENDING",
                  "PAYMENT_CONFIRMED",
                  "CASH_PREPARING",
                  "RIDER_ASSIGNED",
                  "CASH_COLLECTED",
                  "IN_TRANSIT",
                  "DELIVERED",
                ] as TxStatus[]
              ).map((value) => (
                <option key={value} value={value}>
                  {STATUS_META[value].label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Exceptions">
              {(
                [
                  "COMPLETED",
                  "PAYMENT_FAILED",
                  "PAYMENT_EXPIRED",
                  "VENDOR_UNAVAILABLE",
                  "RIDER_UNAVAILABLE",
                  "DELIVERY_FAILED",
                  "DELIVERY_CANCELLED",
                  "REFUND_PENDING",
                  "REFUNDED",
                  "DISPUTED",
                ] as TxStatus[]
              ).map((value) => (
                <option key={value} value={value}>
                  {STATUS_META[value].label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label>
          <span className="field-label">Location</span>
          <select value={area} onChange={(event) => setArea(event.target.value)} className="field">
            <option value="all">All areas</option>
            {areas.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Rider</span>
          <select value={riderId} onChange={(event) => setRiderId(event.target.value)} className="field">
            <option value="all">All riders</option>
            {state.riders.map((rider) => (
              <option key={rider.id} value={rider.id}>
                {rider.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Date</span>
          <select value={date} onChange={(event) => setDate(event.target.value as DateFilter)} className="field">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between text-[9.5px] text-ink-soft">
        <span>
          {filtered.length} of {state.transactions.length} requests
        </span>
        {(query || status !== "all" || area !== "all" || riderId !== "all" || date !== "all") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setArea("all");
              setRiderId("all");
              setDate("all");
            }}
            className="font-semibold text-violet hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="app-card mt-3 overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper/60 text-[8.5px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-4 py-3 font-bold">Request</th>
                <th className="px-3 py-3 font-bold">Delivery</th>
                <th className="px-3 py-3 text-right font-bold">Amount</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-3 py-3 font-bold">Vendor</th>
                <th className="px-3 py-3 font-bold">Rider</th>
                <th className="px-3 py-3 font-bold">Created</th>
                <th className="px-4 py-3 text-right font-bold">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((tx) => {
                const vendor = vendorFor(state, tx.vendorId);
                const rider = riderFor(state, tx.riderId);
                return (
                  <tr
                    key={tx.id}
                    onClick={() => onOpen(tx.id)}
                    className="cursor-pointer text-[11.5px] transition-colors hover:bg-paper/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-[10.5px] font-semibold text-ink">{tx.reference}</p>
                      <p className="mt-0.5 text-[9px] text-ink-soft">{tx.paymentMethod}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{tx.recipient.name}</p>
                      <p className="mt-0.5 text-[9px] text-ink-soft">{tx.recipient.area}</p>
                    </td>
                    <td className="num px-3 py-3 text-right font-bold text-ink">{formatNaira(tx.amount)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{vendor?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-ink-soft">{rider?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-[9.5px] text-ink-soft">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-line-strong">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyRow>No requests match these filters.</EmptyRow>}
        </div>

        <div className="divide-y divide-line md:hidden">
          {filtered.map((tx) => (
            <button
              key={tx.id}
              type="button"
              onClick={() => onOpen(tx.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-soft text-[10px] font-bold text-violet-deep">
                {initials(tx.recipient.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[12px] font-semibold text-ink">{tx.recipient.name}</p>
                  <StatusBadge status={tx.status} />
                </div>
                <p className="mt-0.5 truncate text-[9.5px] text-ink-soft">
                  {tx.reference} · {tx.recipient.area} · {timeAgo(tx.createdAt)}
                </p>
              </div>
              <span className="num shrink-0 text-[12px] font-bold text-ink">{formatNaira(tx.amount)}</span>
            </button>
          ))}
          {filtered.length === 0 && <EmptyRow>No requests match these filters.</EmptyRow>}
        </div>
      </div>
    </div>
  );
}

function RequestDrawer({
  state,
  txId,
  onClose,
  notify,
}: {
  state: DashState;
  txId: string;
  onClose: () => void;
  notify: (result: ActionResult, success: string) => void;
}) {
  const tx = state.transactions.find((item) => item.id === txId);
  const vendor = vendorFor(state, tx?.vendorId);
  const rider = riderFor(state, tx?.riderId);
  const [vendorChoice, setVendorChoice] = useState(tx?.vendorId ?? state.vendors[0]?.id ?? "");
  const [riderChoice, setRiderChoice] = useState(tx?.riderId ?? state.riders.find((r) => r.status !== "offline")?.id ?? "");

  if (!tx) {
    return (
      <Sheet open onClose={onClose} title="Request not found">
        <EmptyRow>This request may have been removed in the demo reset.</EmptyRow>
      </Sheet>
    );
  }

  const canAssignVendor = ["PAYMENT_CONFIRMED", "CASH_PREPARING"].includes(tx.status);
  const canAssignRider = ["CASH_PREPARING", "RIDER_ASSIGNED"].includes(tx.status);

  return (
    <Sheet
      open
      onClose={onClose}
      title={tx.reference}
      subtitle={`${formatDate(tx.createdAt)} · ${tx.recipient.name}`}
      footer={
        <button type="button" onClick={onClose} className="btn btn-dark btn-block">
          Close request
        </button>
      }
    >
      <div className="space-y-3">
        <div className="rounded-2xl bg-ink p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/40">Cash amount</p>
              <p className="num mt-1 text-[32px] font-bold leading-none">{formatNaira(tx.amount)}</p>
              <p className="mt-1 text-[10px] text-white/45">
                Total collected {formatNaira(tx.total)} · fee {formatNaira(tx.deliveryFee)}
              </p>
            </div>
            <StatusBadge status={tx.status} />
          </div>
          {tx.failureReason && (
            <p className="mt-3 rounded-xl bg-danger/15 px-3 py-2 text-[9.5px] leading-relaxed text-danger">
              {tx.failureReason}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">Recipient</p>
              <p className="mt-1 text-[12.5px] font-semibold text-ink">{tx.recipient.name}</p>
              <p className="mt-0.5 text-[10.5px] text-ink-soft">{formatNgPhone(tx.recipient.phone)}</p>
              <p className="mt-1.5 max-w-[240px] text-[10.5px] leading-relaxed text-ink-soft">
                {tx.recipient.street}, {tx.recipient.area}, {tx.recipient.city}
              </p>
              {tx.recipient.instructions && (
                <p className="mt-1.5 rounded-lg bg-paper px-2.5 py-1.5 text-[9.5px] leading-relaxed text-ink-soft">
                  {tx.recipient.instructions}
                </p>
              )}
            </div>
            <a href={`tel:${tx.recipient.phone}`} className="btn btn-soft btn-sm shrink-0">
              Call
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-line bg-white p-3.5">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">Vendor</p>
            <p className="mt-1 truncate text-[11.5px] font-semibold text-ink">{vendor?.name ?? "Unassigned"}</p>
            <p className="mt-0.5 truncate text-[9.5px] text-ink-soft">{vendor?.area ?? "Waiting for assignment"}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-3.5">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">Rider</p>
            <p className="mt-1 truncate text-[11.5px] font-semibold text-ink">{rider?.name ?? "Unassigned"}</p>
            <p className="mt-0.5 truncate text-[9.5px] text-ink-soft">
              {rider ? `${rider.vehicle} · ${rider.status}` : "Waiting for assignment"}
            </p>
          </div>
        </div>

        {/* Assignment */}
        {(canAssignVendor || canAssignRider) && (
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[11.5px] font-bold text-ink">Dispatch controls</p>
            <p className="mt-0.5 text-[9.5px] text-ink-soft">
              Assign the cash source first, then a rider. Every change is written to the audit log.
            </p>

            <div className="mt-3 space-y-2.5">
              <div className="flex gap-2">
                <select
                  value={vendorChoice}
                  onChange={(event) => setVendorChoice(event.target.value)}
                  disabled={!canAssignVendor}
                  className="field !py-2.5 !text-[11px]"
                >
                  {state.vendors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.area} {item.available ? "" : "(paused)"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!canAssignVendor || !vendorChoice}
                  onClick={() =>
                    notify(assignVendor(tx.id, vendorChoice), `Vendor assigned to ${tx.reference}.`)
                  }
                  className="btn btn-soft btn-sm shrink-0"
                >
                  Assign
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={riderChoice}
                  onChange={(event) => setRiderChoice(event.target.value)}
                  disabled={!canAssignRider}
                  className="field !py-2.5 !text-[11px]"
                >
                  {state.riders.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.location} ({item.status})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!canAssignRider || !riderChoice}
                  onClick={() =>
                    notify(assignRider(tx.id, riderChoice), `Rider assigned to ${tx.reference}.`)
                  }
                  className="btn btn-soft btn-sm shrink-0"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11.5px] font-bold text-ink">Payment</p>
            <span className={`badge ${tx.payment ? "badge-success" : "badge-warning"}`}>
              <span className="badge-dot" />
              {tx.payment ? "Verified" : "Not captured"}
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[10px]">
            <div className="flex justify-between gap-3">
              <span className="text-ink-soft">Method</span>
              <span className="text-right font-medium text-ink">{tx.paymentMethod}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink-soft">Provider ref.</span>
              <span className="font-mono text-right font-medium text-ink">
                {tx.payment?.providerReference ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink-soft">Idempotency key</span>
              <span className="max-w-[190px] truncate font-mono text-right text-ink">
                {tx.payment?.idempotencyKey ?? "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-ink-soft">Verified</span>
              <span className="text-right font-medium text-ink">
                {tx.payment ? formatDate(tx.payment.verifiedAt) : "Awaiting webhook"}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[11.5px] font-bold text-ink">Latest events</p>
          <div className="mt-3 space-y-3">
            {[...tx.timeline]
              .slice(-5)
              .reverse()
              .map((event, index) => (
                <div key={`${event.at}-${index}`} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10.5px] font-semibold text-ink">{STATUS_META[event.status].label}</p>
                      <span className="shrink-0 text-[8.5px] text-ink-soft">{formatTime(event.at)}</span>
                    </div>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink-soft">{event.note}</p>
                    <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-ink-soft/60">
                      {ACTOR_LABEL[event.actor] ?? event.actor}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Exceptions */}
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[11.5px] font-bold text-ink">Exception handling</p>
          <p className="mt-0.5 text-[9.5px] text-ink-soft">
            Only transitions allowed by the transaction state machine are applied.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {tx.status === "PAYMENT_PENDING" && (
              <button
                type="button"
                onClick={() =>
                  notify(
                    markPaymentFailed(tx.id, "Operations marked the payment failed after provider review."),
                    "Payment marked as failed."
                  )
                }
                className="btn btn-danger btn-sm"
              >
                Payment failed
              </button>
            )}
            {canTransition(tx.status, "DELIVERY_FAILED") && (
              <button
                type="button"
                onClick={() =>
                  notify(
                    markDeliveryFailed(tx.id, "Operations marked the delivery failed after review."),
                    "Delivery marked as failed."
                  )
                }
                className="btn btn-danger btn-sm"
              >
                Delivery failed
              </button>
            )}
            {canTransition(tx.status, "REFUND_PENDING") && (
              <button
                type="button"
                onClick={() => notify(queueRefund(tx.id), "Refund queued to the original payment method.")}
                className="btn btn-outline btn-sm"
              >
                Queue refund
              </button>
            )}
            {tx.status === "REFUND_PENDING" && (
              <button
                type="button"
                onClick={() => notify(markRefunded(tx.id), "Refund marked as settled.")}
                className="btn btn-outline btn-sm"
              >
                Mark refunded
              </button>
            )}
            {canTransition(tx.status, "DELIVERY_CANCELLED") && (
              <button
                type="button"
                onClick={() => notify(cancelTransaction(tx.id), "Request cancelled.")}
                className="btn btn-ghost btn-sm"
              >
                Cancel request
              </button>
            )}
          </div>
          {!(
            tx.status === "PAYMENT_PENDING" ||
            canTransition(tx.status, "DELIVERY_FAILED") ||
            canTransition(tx.status, "REFUND_PENDING") ||
            tx.status === "REFUND_PENDING" ||
            canTransition(tx.status, "DELIVERY_CANCELLED")
          ) && (
            <p className="mt-2 rounded-xl bg-paper px-3 py-2 text-[9.5px] leading-relaxed text-ink-soft">
              No exception action is available for this state. Payment and delivery records are immutable here.
            </p>
          )}
        </div>

        <Link href={`/track/${tx.id}`} className="btn btn-outline btn-block">
          Open customer tracking view
        </Link>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Vendors                                                             */
/* ------------------------------------------------------------------ */

function VendorsTab({
  state,
  onAdd,
  notify,
}: {
  state: DashState;
  onAdd: () => void;
  notify: (result: ActionResult, success: string) => void;
}) {
  const available = state.vendors.filter((vendor) => vendor.available);
  const liquidity = state.vendors.reduce((sum, vendor) => sum + vendor.liquidity, 0);
  const jobs = state.vendors.reduce((sum, vendor) => sum + vendor.jobsToday, 0);

  return (
    <div>
      <SectionHead
        eyebrow="Vendor network"
        title="Cash liquidity"
        action={
          <button type="button" onClick={onAdd} className="btn btn-primary btn-sm">
            Add vendor
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Active vendors" value={`${available.length}/${state.vendors.length}`} hint="Open for assignments" />
        <Kpi label="Cash available" value={formatNaira(liquidity)} hint="Declared network liquidity" tone="ink" />
        <Kpi label="Jobs today" value={`${jobs}`} hint="Across all vendors" />
        <Kpi
          label="Paused"
          value={`${state.vendors.length - available.length}`}
          hint="Not receiving new work"
          tone={state.vendors.length - available.length > 0 ? "danger" : "success"}
        />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {state.vendors.map((vendor) => {
          const activeJobs = state.transactions.filter(
            (tx) => tx.vendorId === vendor.id && isActiveStatus(tx.status)
          ).length;
          return (
            <article key={vendor.id} className="app-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13.5px] font-bold text-ink">{vendor.name}</p>
                    <span className={`badge ${vendor.available ? "badge-success" : "badge-neutral"}`}>
                      <span className="badge-dot" />
                      {vendor.available ? "Open" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] text-ink-soft">{vendor.area}</p>
                  <p className="mt-0.5 truncate text-[9.5px] text-ink-soft/75">{vendor.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    notify(
                      setVendorAvailability(vendor.id, !vendor.available),
                      `${vendor.name} ${vendor.available ? "paused" : "resumed"}.`
                    )
                  }
                  className={`btn btn-sm shrink-0 ${vendor.available ? "btn-outline" : "btn-soft"}`}
                >
                  {vendor.available ? "Pause" : "Resume"}
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[9.5px]">
                  <span className="text-ink-soft">Declared cash</span>
                  <span className="num font-bold text-ink">{formatNaira(vendor.liquidity)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                  <div
                    className={`h-full rounded-full ${vendor.liquidity >= 400_000 ? "bg-success" : "bg-warning"}`}
                    style={{ width: `${Math.min(100, (vendor.liquidity / 1_000_000) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3.5 text-center">
                {[
                  [`${vendor.rating.toFixed(1)}`, "Rating"],
                  [`${vendor.jobsToday}`, "Jobs today"],
                  [`${activeJobs}`, "Active"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="num text-[13px] font-bold text-ink">{value}</p>
                    <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-ink-soft">{label}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Riders                                                              */
/* ------------------------------------------------------------------ */

function RidersTab({
  state,
  onAdd,
  notify,
}: {
  state: DashState;
  onAdd: () => void;
  notify: (result: ActionResult, success: string) => void;
}) {
  const online = state.riders.filter((rider) => rider.status === "online");
  const busy = state.riders.filter((rider) => rider.status === "busy");
  const offline = state.riders.filter((rider) => rider.status === "offline");

  return (
    <div>
      <SectionHead
        eyebrow="Rider fleet"
        title="Who is moving cash"
        action={
          <button type="button" onClick={onAdd} className="btn btn-primary btn-sm">
            Add rider
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Available" value={`${online.length}`} hint="Online and ready" tone="success" />
        <Kpi label="On a job" value={`${busy.length}`} hint="Carrying or collecting cash" tone="ink" />
        <Kpi label="Offline" value={`${offline.length}`} hint="Not receiving work" />
        <Kpi
          label="Active jobs"
          value={`${state.transactions.filter((tx) => inFlightStatuses.includes(tx.status)).length}`}
          hint="Cash currently in the field"
        />
      </div>

      <div className="app-card mt-5 overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper/60 text-[8.5px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-4 py-3 font-bold">Rider</th>
                <th className="px-3 py-3 font-bold">Contact</th>
                <th className="px-3 py-3 font-bold">Vehicle</th>
                <th className="px-3 py-3 font-bold">Location</th>
                <th className="px-3 py-3 text-center font-bold">Jobs</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {state.riders.map((rider) => (
                <tr key={rider.id} className="text-[11.5px]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-white">
                        {initials(rider.name)}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{rider.name}</p>
                        <p className="mt-0.5 text-[9px] text-ink-soft">★ {rider.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[10px] text-ink-soft">{formatNgPhone(rider.phone)}</td>
                  <td className="px-3 py-3 text-[10px] text-ink-soft">
                    {rider.vehicle}
                    <span className="mt-0.5 block font-mono text-[9px] text-ink-soft/70">{rider.plate}</span>
                  </td>
                  <td className="px-3 py-3 text-[10px] text-ink-soft">{rider.location}</td>
                  <td className="num px-3 py-3 text-center font-semibold text-ink">{rider.jobsToday}</td>
                  <td className="px-3 py-3">
                    <RiderStatusBadge status={rider.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {rider.status !== "online" && (
                        <button
                          type="button"
                          onClick={() => notify(setRiderStatus(rider.id, "online"), `${rider.name} is online.`)}
                          className="btn btn-soft btn-sm"
                        >
                          Online
                        </button>
                      )}
                      {rider.status !== "offline" && (
                        <button
                          type="button"
                          onClick={() => notify(setRiderStatus(rider.id, "offline"), `${rider.name} is offline.`)}
                          className="btn btn-outline btn-sm"
                        >
                          Offline
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {state.riders.map((rider) => (
            <div key={rider.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                {initials(rider.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[12px] font-semibold text-ink">{rider.name}</p>
                  <RiderStatusBadge status={rider.status} />
                </div>
                <p className="mt-0.5 truncate text-[9.5px] text-ink-soft">
                  {rider.vehicle} · {rider.location} · {rider.jobsToday} jobs
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  notify(
                    setRiderStatus(rider.id, rider.status === "offline" ? "online" : "offline"),
                    `${rider.name} is ${rider.status === "offline" ? "online" : "offline"}.`
                  )
                }
                className="btn btn-outline btn-sm shrink-0"
              >
                {rider.status === "offline" ? "Online" : "Offline"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiderStatusBadge({ status }: { status: Rider["status"] }) {
  const map = {
    online: { tone: "badge-success", label: "Online" },
    busy: { tone: "badge-live", label: "On job" },
    offline: { tone: "badge-neutral", label: "Offline" },
  } as const;
  const meta = map[status];
  return (
    <span className={`badge ${meta.tone}`}>
      <span className="badge-dot" />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Disputes                                                            */
/* ------------------------------------------------------------------ */

function DisputesTab({
  state,
  notify,
}: {
  state: DashState;
  notify: (result: ActionResult, success: string) => void;
}) {
  const open = state.disputes.filter((dispute) => dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW");
  const closed = state.disputes.filter((dispute) => dispute.status === "RESOLVED" || dispute.status === "REFUNDED");

  return (
    <div>
      <SectionHead eyebrow="Disputes" title="Sender cases" />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Open cases" value={`${open.length}`} hint="Awaiting a final decision" tone={open.length ? "danger" : "success"} />
        <Kpi label="Resolved" value={`${closed.length}`} hint="Closed by operations" />
        <Kpi
          label="At risk"
          value={formatNaira(
            state.disputes
              .filter((dispute) => dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW")
              .reduce((sum, dispute) => {
                const tx = state.transactions.find((item) => item.id === dispute.transactionId);
                return sum + (tx?.total ?? 0);
              }, 0)
          )}
          hint="Total value under review"
          tone="ink"
        />
        <Kpi
          label="Refunded cases"
          value={`${state.disputes.filter((dispute) => dispute.status === "REFUNDED").length}`}
          hint="Resolved in sender's favour"
        />
      </div>

      <div className="mt-5 space-y-3">
        {state.disputes.length === 0 && (
          <div className="app-card-flat px-5 py-12 text-center text-[11.5px] text-ink-soft">
            No disputes have been raised in this demo.
          </div>
        )}

        {state.disputes.map((dispute) => (
          <DisputeCard key={dispute.id} dispute={dispute} state={state} notify={notify} />
        ))}
      </div>
    </div>
  );
}

function DisputeCard({
  dispute,
  state,
  notify,
}: {
  dispute: Dispute;
  state: DashState;
  notify: (result: ActionResult, success: string) => void;
}) {
  const tx = state.transactions.find((item) => item.id === dispute.transactionId);
  const [resolution, setResolution] = useState(dispute.resolution ?? "");

  return (
    <article className="app-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] font-semibold text-ink-soft">{dispute.reference}</p>
            <DisputeStatusBadge status={dispute.status} />
          </div>
          <p className="mt-1.5 text-[14px] font-bold text-ink">{dispute.reason}</p>
          <p className="mt-1 max-w-xl text-[10.5px] leading-relaxed text-ink-soft">{dispute.detail}</p>
          <p className="mt-2 text-[9px] text-ink-soft/70">
            {tx ? `${tx.reference} · ${tx.recipient.name} · ${formatNaira(tx.amount)}` : "Transaction unavailable"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[8.5px] uppercase tracking-[0.08em] text-ink-soft">Opened</p>
          <p className="mt-0.5 text-[10px] font-medium text-ink">{formatDate(dispute.createdAt)}</p>
        </div>
      </div>

      {dispute.resolution && (
        <p className="mt-3 rounded-xl bg-success-soft px-3 py-2 text-[10px] leading-relaxed text-success">
          {dispute.resolution}
        </p>
      )}

      {(dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW") && (
        <div className="mt-4 border-t border-line pt-3.5">
          <label className="field-label" htmlFor={`resolution-${dispute.id}`}>
            Resolution note
          </label>
          <textarea
            id={`resolution-${dispute.id}`}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            rows={2}
            placeholder="What did operations decide?"
            className="field resize-none"
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {dispute.status === "OPEN" && (
              <button
                type="button"
                onClick={() =>
                  notify(updateDisputeStatus(dispute.id, "UNDER_REVIEW"), `${dispute.reference} moved to review.`)
                }
                className="btn btn-outline btn-sm"
              >
                Start review
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const result = resolveDispute(dispute.id, "resolved");
                if (result.ok && resolution.trim()) {
                  updateDisputeStatus(dispute.id, "RESOLVED", resolution.trim());
                }
                notify(result, `${dispute.reference} resolved. Delivery stands.`);
              }}
              className="btn btn-soft btn-sm"
            >
              Resolve — delivery stands
            </button>
            <button
              type="button"
              onClick={() => {
                const result = resolveDispute(dispute.id, "refund");
                if (result.ok && resolution.trim()) {
                  updateDisputeStatus(dispute.id, "REFUNDED", resolution.trim());
                }
                notify(result, `${dispute.reference} refunded to sender.`);
              }}
              className="btn btn-danger btn-sm"
            >
              Refund sender
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function DisputeStatusBadge({ status }: { status: Dispute["status"] }) {
  const map = {
    OPEN: { tone: "badge-danger", label: "Open" },
    UNDER_REVIEW: { tone: "badge-warning", label: "In review" },
    RESOLVED: { tone: "badge-success", label: "Resolved" },
    REFUNDED: { tone: "badge-neutral", label: "Refunded" },
  } as const;
  const meta = map[status];
  return (
    <span className={`badge ${meta.tone}`}>
      <span className="badge-dot" />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reconciliation                                                      */
/* ------------------------------------------------------------------ */

function ReconciliationTab({ state }: { state: DashState }) {
  const captured = state.transactions.filter((tx) => tx.payment && capturedStatuses.includes(tx.status));
  const inFlight = state.transactions.filter((tx) => inFlightStatuses.includes(tx.status));
  const refundsPending = state.transactions.filter((tx) => tx.status === "REFUND_PENDING");
  const refunded = state.transactions.filter((tx) => tx.status === "REFUNDED");
  const completed = state.transactions.filter((tx) => tx.status === "COMPLETED" || tx.status === "DISPUTED");

  const gross = captured.reduce((sum, tx) => sum + tx.total, 0);
  const fees = completed.reduce((sum, tx) => sum + tx.deliveryFee, 0);
  const pending = refundsPending.reduce((sum, tx) => sum + tx.total, 0);
  const settled = refunded.reduce((sum, tx) => sum + tx.total, 0);
  const field = inFlight.reduce((sum, tx) => sum + tx.amount, 0);

  const settlement = (tx: Transaction) => {
    if (tx.status === "REFUNDED") return { label: "Refunded", tone: "text-ink-soft" };
    if (tx.status === "REFUND_PENDING") return { label: "Refund queued", tone: "text-warning" };
    if (["COMPLETED", "DISPUTED", "DELIVERED"].includes(tx.status)) return { label: "Settled", tone: "text-success" };
    if (inFlightStatuses.includes(tx.status)) return { label: "In flight", tone: "text-violet" };
    if (!tx.payment) return { label: "Uncaptured", tone: "text-ink-soft" };
    return { label: "Captured", tone: "text-ink" };
  };

  return (
    <div>
      <SectionHead
        eyebrow="Reconciliation"
        title="Payment ledger"
        action={
          <button
            type="button"
            onClick={() =>
              exportCsv(state.transactions, `dash-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`)
            }
            className="btn btn-outline btn-sm"
          >
            Export ledger
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Gross captured" value={formatNaira(gross)} hint={`${captured.length} verified payments`} tone="ink" />
        <Kpi label="Fees earned" value={formatNaira(fees)} hint="On completed deliveries" tone="success" />
        <Kpi label="Cash in field" value={formatNaira(field)} hint={`${inFlight.length} active handoffs`} />
        <Kpi label="Refunds queued" value={formatNaira(pending)} hint={`${formatNaira(settled)} already returned`} tone={pending ? "danger" : "plain"} />
      </div>

      <div className="app-card mt-5 overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <p className="text-[12.5px] font-bold text-ink">Transaction ledger</p>
          <p className="mt-0.5 text-[9.5px] text-ink-soft">
            Demo payment references. Settlement status is derived from the transaction state machine.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper/60 text-[8.5px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-3 py-3 font-bold">Reference</th>
                <th className="px-3 py-3 text-right font-bold">Total</th>
                <th className="px-3 py-3 text-right font-bold">Fee</th>
                <th className="px-3 py-3 font-bold">Payment ref.</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...state.transactions]
                .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                .map((tx) => {
                  const settlementState = settlement(tx);
                  return (
                    <tr key={tx.id} className="text-[10.5px]">
                      <td className="px-4 py-3 text-ink-soft">{formatDate(tx.createdAt)}</td>
                      <td className="px-3 py-3 font-mono font-semibold text-ink">{tx.reference}</td>
                      <td className="num px-3 py-3 text-right font-bold text-ink">{formatNaira(tx.total)}</td>
                      <td className="num px-3 py-3 text-right text-ink-soft">{formatNaira(tx.deliveryFee)}</td>
                      <td className="px-3 py-3 font-mono text-[9px] text-ink-soft">
                        {tx.payment?.providerReference ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className={`px-4 py-3 text-right text-[10px] font-semibold ${settlementState.tone}`}>
                        {settlementState.label}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-line bg-white/60 px-4 py-3">
        <p className="text-[9.5px] leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Demo note.</span> No real money moves in this prototype. In
          production, the ledger is reconciled against the payment provider&apos;s webhook events and vendor
          settlement statements; refunds settle in 3–5 business days.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function OverviewTab({
  state,
  onOpen,
  onGo,
}: {
  state: DashState;
  onOpen: (id: string) => void;
  onGo: (tab: Tab) => void;
}) {
  const active = state.transactions.filter((tx) => isActiveStatus(tx.status));
  const pending = state.transactions.filter((tx) => tx.status === "PAYMENT_PENDING");
  const onlineRiders = state.riders.filter((rider) => rider.status !== "offline");
  const inFlight = state.transactions.filter((tx) => inFlightStatuses.includes(tx.status));
  const cashInField = inFlight.reduce((sum, tx) => sum + tx.amount, 0);
  const needsVendor = state.transactions.filter(
    (tx) => tx.status === "PAYMENT_CONFIRMED" || (tx.status === "CASH_PREPARING" && !tx.vendorId)
  );
  const needsRider = state.transactions.filter(
    (tx) => tx.status === "CASH_PREPARING" && Boolean(tx.vendorId)
  );
  const openDisputes = state.disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW");
  const refunds = state.transactions.filter((tx) => tx.status === "REFUND_PENDING");
  const live = active.slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Operations · Lagos</p>
          <h1 className="display mt-1 text-[36px] leading-none text-ink sm:text-[42px]">Everything moving.</h1>
          <p className="mt-2 max-w-md text-[12px] leading-relaxed text-ink-soft">
            Live cash requests, payments, vendors and riders in one operating view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-2.5 py-1 text-[9px] font-bold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
            Live demo data
          </span>
          <Link href="/rider" className="btn btn-outline btn-sm">
            Rider view
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Active requests" value={`${active.length}`} hint={`${pending.length} awaiting payment`} tone="ink" />
        <Kpi label="Cash in field" value={formatNaira(cashInField)} hint={`${inFlight.length} handoffs in progress`} />
        <Kpi label="Riders available" value={`${onlineRiders.length}/${state.riders.length}`} hint="Online or on a job" tone="success" />
        <Kpi
          label="Needs attention"
          value={`${needsVendor.length + needsRider.length + openDisputes.length + refunds.length}`}
          hint="Assignments, disputes, refunds"
          tone={needsVendor.length + needsRider.length + openDisputes.length + refunds.length ? "danger" : "success"}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="app-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="eyebrow">Live operations</p>
              <p className="mt-1 text-[14px] font-bold text-ink">Requests in motion</p>
            </div>
            <button type="button" onClick={() => onGo("requests")} className="text-[10px] font-semibold text-violet hover:underline">
              View all
            </button>
          </div>
          <div className="divide-y divide-line">
            {live.map((tx) => {
              const rider = riderFor(state, tx.riderId);
              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => onOpen(tx.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-soft text-[10px] font-bold text-violet-deep">
                    {initials(tx.recipient.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[12px] font-semibold text-ink">{tx.recipient.name}</p>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="mt-0.5 truncate text-[9.5px] text-ink-soft">
                      {tx.reference} · {rider?.name ?? "No rider"} · {timeAgo(tx.updatedAt)}
                    </p>
                  </div>
                  <p className="num shrink-0 text-[12px] font-bold text-ink">{formatNaira(tx.amount)}</p>
                </button>
              );
            })}
            {live.length === 0 && <EmptyRow>No active requests right now.</EmptyRow>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="app-card p-5">
            <p className="eyebrow">Action queue</p>
            <div className="mt-3 space-y-2">
              {[
                { label: "Need a vendor", count: needsVendor.length, tab: "requests" as Tab },
                { label: "Need a rider", count: needsRider.length, tab: "requests" as Tab },
                { label: "Open disputes", count: openDisputes.length, tab: "disputes" as Tab },
                { label: "Refunds pending", count: refunds.length, tab: "reconciliation" as Tab },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onGo(item.tab)}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-white px-3 py-2.5 text-left transition-colors hover:border-line-strong"
                >
                  <span className="text-[10.5px] font-semibold text-ink">{item.label}</span>
                  <span
                    className={`badge ${item.count ? "badge-danger" : "badge-success"}`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="app-card p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Vendor liquidity</p>
              <button type="button" onClick={() => onGo("vendors")} className="text-[9.5px] font-semibold text-violet hover:underline">
                Manage
              </button>
            </div>
            <div className="mt-3 space-y-2.5">
              {state.vendors.slice(0, 4).map((vendor) => (
                <div key={vendor.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-semibold text-ink">{vendor.name}</span>
                    <span className="num shrink-0 text-[9.5px] text-ink-soft">{formatNaira(vendor.liquidity)}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-paper">
                    <div
                      className={`h-full rounded-full ${vendor.available ? "bg-success" : "bg-line-strong"}`}
                      style={{ width: `${Math.min(100, (vendor.liquidity / 1_000_000) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="app-card p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Rider fleet</p>
            <button type="button" onClick={() => onGo("riders")} className="text-[9.5px] font-semibold text-violet hover:underline">
              Manage
            </button>
          </div>
          <div className="mt-3 divide-y divide-line">
            {state.riders.slice(0, 5).map((rider) => {
              const job = state.transactions.find(
                (tx) => tx.riderId === rider.id && inFlightStatuses.includes(tx.status)
              );
              return (
                <div key={rider.id} className="flex items-center gap-2.5 py-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper text-[8.5px] font-bold text-ink-soft">
                    {initials(rider.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-ink">{rider.name}</p>
                    <p className="truncate text-[8.5px] text-ink-soft">
                      {job ? `${job.reference} · ${job.recipient.area}` : rider.location}
                    </p>
                  </div>
                  <RiderStatusBadge status={rider.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="app-card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <p className="eyebrow">Audit log</p>
            <p className="mt-1 text-[14px] font-bold text-ink">Recent system activity</p>
          </div>
          <div className="divide-y divide-line">
            {state.auditLog.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 px-5 py-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] leading-relaxed text-ink">{entry.action}</p>
                  <p className="mt-0.5 text-[8.5px] text-ink-soft">
                    {ACTOR_LABEL[entry.actor] ?? entry.actor} · {timeAgo(entry.at)}
                    {entry.reference ? ` · ${entry.reference}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {state.auditLog.length === 0 && <EmptyRow>No audit activity yet.</EmptyRow>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add sheets                                                          */
/* ------------------------------------------------------------------ */

function AddVendorSheet({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (name: string) => void;
}) {
  const [form, setForm] = useState({ name: "", area: "", address: "", phone: "", liquidity: "" });
  const [error, setError] = useState("");

  const submit = () => {
    if (form.name.trim().length < 2) return setError("Enter the vendor name.");
    if (!form.area.trim()) return setError("Enter the vendor area.");
    if (!form.address.trim()) return setError("Enter the vendor address.");
    const liquidity = Number(form.liquidity.replace(/[^\d]/g, ""));
    if (!liquidity) return setError("Enter the declared cash available.");

    const result = addVendor({
      name: form.name.trim(),
      area: form.area.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || "+2348000000000",
      available: true,
      liquidity,
    });
    if (!result.ok) return setError(result.error);
    setForm({ name: "", area: "", address: "", phone: "", liquidity: "" });
    setError("");
    onDone(form.name.trim());
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add cash vendor"
      subtitle="Vendors hold and disburse physical naira for Dash."
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="button" onClick={submit} className="btn btn-primary">Add vendor</button>
        </div>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className="field-label" htmlFor="vendor-name">Business name</label>
          <input id="vendor-name" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} className="field" placeholder="e.g. Surulere Cash Point" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="field-label" htmlFor="vendor-area">Area</label>
            <input id="vendor-area" value={form.area} onChange={(e) => { setForm((f) => ({ ...f, area: e.target.value })); setError(""); }} className="field" placeholder="Surulere" />
          </div>
          <div>
            <label className="field-label" htmlFor="vendor-phone">Phone</label>
            <input id="vendor-phone" value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError(""); }} className="field" placeholder="0801 234 5678" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="vendor-address">Address</label>
          <input id="vendor-address" value={form.address} onChange={(e) => { setForm((f) => ({ ...f, address: e.target.value })); setError(""); }} className="field" placeholder="Street, area, city" />
        </div>
        <div>
          <label className="field-label" htmlFor="vendor-liquidity">Cash available (₦)</label>
          <input id="vendor-liquidity" value={form.liquidity} onChange={(e) => { setForm((f) => ({ ...f, liquidity: e.target.value })); setError(""); }} inputMode="numeric" className="field" placeholder="250,000" />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
      </div>
    </Sheet>
  );
}

function AddRiderSheet({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (name: string) => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "Motorcycle", plate: "", location: "" });
  const [error, setError] = useState("");

  const submit = () => {
    if (form.name.trim().length < 2) return setError("Enter the rider's name.");
    if (!form.phone.trim()) return setError("Enter the rider's phone number.");
    if (!form.location.trim()) return setError("Enter the rider's operating area.");
    const result = addRider({
      name: form.name.trim(),
      phone: form.phone.trim(),
      vehicle: form.vehicle,
      plate: form.plate.trim() || "UNREGISTERED",
      status: "online",
      location: form.location.trim(),
    });
    if (!result.ok) return setError(result.error);
    setForm({ name: "", phone: "", vehicle: "Motorcycle", plate: "", location: "" });
    setError("");
    onDone(form.name.trim());
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add rider"
      subtitle="Verified riders can collect cash and confirm handoff."
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="button" onClick={submit} className="btn btn-primary">Add rider</button>
        </div>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className="field-label" htmlFor="rider-name">Full name</label>
          <input id="rider-name" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} className="field" placeholder="e.g. Sadiq Bello" />
        </div>
        <div>
          <label className="field-label" htmlFor="rider-phone">Phone number</label>
          <input id="rider-phone" value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError(""); }} className="field" placeholder="0801 234 5678" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="field-label" htmlFor="rider-vehicle">Vehicle</label>
            <select id="rider-vehicle" value={form.vehicle} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))} className="field">
              <option>Motorcycle</option>
              <option>Bicycle</option>
              <option>Car</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="rider-plate">Plate</label>
            <input id="rider-plate" value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} className="field" placeholder="LAG-123-AB" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="rider-location">Operating area</label>
          <input id="rider-location" value={form.location} onChange={(e) => { setForm((f) => ({ ...f, location: e.target.value })); setError(""); }} className="field" placeholder="e.g. Surulere" />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function OpsPage() {
  const state = useDash();
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [addRiderOpen, setAddRiderOpen] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  const notify = (result: ActionResult, success: string) => {
    setFlash(result.ok ? { tone: "success", message: success } : { tone: "error", message: result.error });
    if (result.ok) {
      window.setTimeout(() => setFlash(null), 4200);
    }
  };

  const openRequests = state
    ? state.transactions.filter((tx) => isActiveStatus(tx.status)).length
    : 0;
  const openDisputeCount = state
    ? state.disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW").length
    : 0;

  const badgeFor = (id: Tab) => {
    if (id === "requests") return openRequests;
    if (id === "disputes") return openDisputeCount;
    return 0;
  };

  return (
    <div className="min-h-dvh bg-paper">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-ink p-5 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <Wordmark dark href="/" />
          <span className="rounded-full border border-white/15 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/50">
            Ops
          </span>
        </div>

        <div className="mt-8">
          <p className="px-3 text-[8px] font-bold uppercase tracking-[0.14em] text-white/30">Operating console</p>
          <nav className="mt-2 space-y-0.5" aria-label="Operations sections">
            {TABS.map((item) => {
              const active = tab === item.id;
              const count = badgeFor(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active ? "bg-white/10" : "hover:bg-white/[0.055]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? "bg-lime" : "bg-white/20"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[11.5px] font-semibold ${active ? "text-white" : "text-white/60"}`}>
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[8.5px] text-white/30">{item.hint}</span>
                  </span>
                  {count > 0 && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8.5px] font-bold text-white/70">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">Signed in</p>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-[10px] font-black text-ink">
                OE
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10.5px] font-semibold">Ops · Equinox</p>
                <p className="truncate text-[8.5px] text-white/35">Lagos control room</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[9px] font-semibold text-white/40">
            <Link href="/" className="hover:text-white">Customer app</Link>
            <Link href="/rider" className="hover:text-white">Rider app</Link>
            <Link href="/signin" className="hover:text-white">Sign out</Link>
          </div>
          <p className="px-1 text-[8px] uppercase tracking-[0.12em] text-white/20">Protected demo environment</p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <Wordmark href="/" />
              <span className="rounded-full border border-line bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Ops
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-white/70 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Demo
              </span>
              <Link
                href="/rider"
                className="rounded-full bg-ink px-2.5 py-1.5 text-[9px] font-semibold text-white"
              >
                Rider
              </Link>
            </div>
          </div>
          <nav className="hide-scrollbar flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Operations sections">
            {TABS.map((item) => {
              const active = tab === item.id;
              const count = badgeFor(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-semibold transition-colors ${
                    active ? "bg-ink text-white" : "bg-white/70 text-ink-soft"
                  }`}
                >
                  {item.label}
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                        active ? "bg-white/15 text-white" : "bg-danger-soft text-danger"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 lg:px-8 lg:pt-8">
          {!state ? (
            <div className="space-y-4">
              <div className="skeleton h-9 w-48 rounded-full" />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="skeleton h-28 rounded-[20px]" />
                ))}
              </div>
              <div className="skeleton h-80 rounded-3xl" />
            </div>
          ) : (
            <div className="fade">
              {tab === "overview" && (
                <OverviewTab state={state} onOpen={setSelectedId} onGo={setTab} />
              )}
              {tab === "requests" && <RequestsTab state={state} onOpen={setSelectedId} />}
              {tab === "vendors" && (
                <VendorsTab state={state} onAdd={() => setAddVendorOpen(true)} notify={notify} />
              )}
              {tab === "riders" && (
                <RidersTab state={state} onAdd={() => setAddRiderOpen(true)} notify={notify} />
              )}
              {tab === "disputes" && <DisputesTab state={state} notify={notify} />}
              {tab === "reconciliation" && <ReconciliationTab state={state} />}
            </div>
          )}
        </main>
      </div>

      {state && selectedId && (
        <RequestDrawer
          key={selectedId}
          state={state}
          txId={selectedId}
          onClose={() => setSelectedId(null)}
          notify={notify}
        />
      )}

      <AddVendorSheet
        open={addVendorOpen}
        onClose={() => setAddVendorOpen(false)}
        onDone={(name) => {
          setAddVendorOpen(false);
          notify({ ok: true }, `${name} added to the vendor network.`);
        }}
      />

      <AddRiderSheet
        open={addRiderOpen}
        onClose={() => setAddRiderOpen(false)}
        onDone={(name) => {
          setAddRiderOpen(false);
          notify({ ok: true }, `${name} added to the rider fleet.`);
        }}
      />

      {flash && (
        <div className="fixed inset-x-4 bottom-5 z-[120] mx-auto max-w-md">
          <div
            className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[12px] font-medium shadow-[0_20px_50px_-20px_rgba(27,19,48,0.5)] rise ${
              flash.tone === "error"
                ? "border-danger/20 bg-danger-soft text-danger"
                : "border-success/20 bg-success-soft text-success"
            }`}
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/60">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                {flash.tone === "error" ? (
                  <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </span>
            <p className="leading-relaxed">{flash.message}</p>
            <button type="button" onClick={() => setFlash(null)} className="ml-auto shrink-0 opacity-60" aria-label="Dismiss">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
