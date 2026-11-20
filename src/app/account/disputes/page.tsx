"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/dash/AppShell";
import Sheet from "@/components/dash/Sheet";
import Notice from "@/components/dash/Notice";
import EmptyState from "@/components/dash/EmptyState";
import { useDash } from "@/lib/dash/useDash";
import { createDispute } from "@/lib/dash/store";
import { formatDate, formatNaira } from "@/lib/dash/format";
import type { Dispute, TxStatus } from "@/lib/dash/types";

const DISPUTE_TONE: Record<Dispute["status"], string> = {
  OPEN: "badge-warning",
  UNDER_REVIEW: "badge-live",
  RESOLVED: "badge-success",
  REFUNDED: "badge-neutral",
};

const DISPUTE_LABEL: Record<Dispute["status"], string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under review",
  RESOLVED: "Resolved",
  REFUNDED: "Refunded",
};

const REASONS = [
  "Cash amount was short",
  "Cash was not delivered",
  "Recipient was not contacted",
  "Wrong notes or denominations",
  "Rider behaviour",
  "Other",
];

const ELIGIBLE: TxStatus[] = ["COMPLETED", "DELIVERED", "DELIVERY_FAILED", "REFUND_PENDING", "DISPUTED", "REFUNDED"];

function DisputesContent() {
  const params = useSearchParams();
  const txParam = params.get("tx");
  const state = useDash();
  const [open, setOpen] = useState(Boolean(txParam));
  const [transactionId, setTransactionId] = useState(txParam ?? "");
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const disputes = state?.disputes ?? [];
  const eligible = (state?.transactions ?? []).filter(
    (tx) =>
      ELIGIBLE.includes(tx.status) &&
      !state?.disputes.some(
        (d) => d.transactionId === tx.id && (d.status === "OPEN" || d.status === "UNDER_REVIEW")
      )
  );

  const openForm = (txId?: string) => {
    setTransactionId(txId ?? eligible[0]?.id ?? "");
    setReason(REASONS[0]);
    setDetail("");
    setError("");
    setSuccess(false);
    setOpen(true);
  };

  const submit = () => {
    if (!transactionId) return setError("Choose the delivery you want to dispute.");
    if (detail.trim().length < 12) return setError("Tell us what happened in at least a sentence.");
    const result = createDispute(transactionId, reason, detail.trim());
    if (!result.ok) return setError(result.error);
    setSuccess(true);
    setTimeout(() => setOpen(false), 900);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-5">
      <Link href="/account" className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Account
      </Link>

      <p className="eyebrow mt-4">Dispute resolution</p>
      <h1 className="display mt-1 text-[38px] text-ink">We&apos;ll look into it.</h1>
      <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-ink-soft">
        If a cash handoff did not go to plan, open a case. A real person reviews every dispute and you get a written
        outcome.
      </p>

      <button type="button" onClick={() => openForm()} className="btn btn-primary mt-5" disabled={eligible.length === 0 && !txParam}>
        Open a dispute
      </button>
      {eligible.length === 0 && (
        <p className="mt-2 text-[10px] text-ink-soft">
          You can dispute a delivery once it is completed or has failed.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-[-0.015em] text-ink">Your cases</h2>
        <span className="text-[10px] text-ink-soft">{disputes.length} total</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {disputes.length === 0 ? (
          <div className="app-card">
            <EmptyState
              title="No disputes on your account"
              description="If a delivery falls short, the case and its resolution will live here."
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              }
            />
          </div>
        ) : (
          disputes.map((dispute) => {
            const tx = state?.transactions.find((t) => t.id === dispute.transactionId);
            return (
              <div key={dispute.id} className="app-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink">{dispute.reason}</p>
                    <p className="mt-0.5 font-mono text-[9.5px] text-ink-soft">
                      {dispute.reference} · {dispute.transactionId ? tx?.reference : ""}
                    </p>
                  </div>
                  <span className={`badge ${DISPUTE_TONE[dispute.status]}`}>
                    <span className="badge-dot" />
                    {DISPUTE_LABEL[dispute.status]}
                  </span>
                </div>
                <p className="mt-3 rounded-xl bg-paper px-3 py-2.5 text-[10.5px] leading-relaxed text-ink-soft">
                  {dispute.detail}
                </p>
                {dispute.resolution && (
                  <div className="mt-2.5 rounded-xl border border-success/15 bg-success-soft px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-success">Outcome</p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-success/85">{dispute.resolution}</p>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-[9px] text-ink-soft">
                  <span>Opened {formatDate(dispute.createdAt)}</span>
                  {tx && (
                    <Link href={`/track/${tx.id}`} className="font-semibold text-violet hover:underline">
                      View delivery
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="app-card mt-5 p-5">
        <p className="eyebrow">What happens next</p>
        <ol className="mt-4 space-y-3.5">
          {[
            ["Case opened", "You receive a case reference immediately and the delivery is flagged."],
            ["Operations review", "We check the rider timeline, vendor handoff and OTP record."],
            ["Decision", "You get a written outcome. If we got it wrong, we refund the amount in full."],
            ["Refund", "Refunds go back to the original payment method within 3–5 business days."],
          ].map(([title, body], index) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-soft text-[9px] font-bold text-violet-deep">
                {index + 1}
              </span>
              <p className="text-[10.5px] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">{title}.</span> {body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Open a dispute"
        subtitle="Only raise a case after a completed or failed delivery."
        footer={
          <button type="button" onClick={submit} className="btn btn-primary btn-block">
            {success ? "Case opened" : "Submit dispute"}
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="field-label" htmlFor="dispute-tx">Which delivery?</label>
            <select
              id="dispute-tx"
              className="field"
              value={transactionId}
              onChange={(e) => { setTransactionId(e.target.value); setError(""); }}
            >
              <option value="">Select a transaction</option>
              {eligible.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {tx.reference} · {tx.recipient.name} · {formatNaira(tx.amount)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="dispute-reason">What went wrong?</label>
            <select id="dispute-reason" className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="dispute-detail">Tell us more</label>
            <textarea
              id="dispute-detail"
              rows={4}
              className="field resize-none"
              placeholder="What did the recipient receive? What did the rider say? Include anything that helps us review it."
              value={detail}
              onChange={(e) => { setDetail(e.target.value); setError(""); }}
            />
          </div>

          {error && <Notice tone="error">{error}</Notice>}
          {success && <Notice tone="success">Dispute opened. Operations will review it and contact you.</Notice>}

          <p className="rounded-2xl bg-paper px-3.5 py-3 text-[9.5px] leading-relaxed text-ink-soft">
            Disputes are reviewed against the rider timeline, vendor confirmation and OTP record. False claims may
            delay the outcome.
          </p>
        </div>
      </Sheet>
    </div>
  );
}

export default function DisputesPage() {
  return (
    <AppShell>
      <Suspense>
        <DisputesContent />
      </Suspense>
    </AppShell>
  );
}
