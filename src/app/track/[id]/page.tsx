"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/dash/AppShell";
import StatusBadge from "@/components/dash/StatusBadge";
import DeliveryTimeline from "@/components/dash/DeliveryTimeline";
import Notice from "@/components/dash/Notice";
import Sheet from "@/components/dash/Sheet";
import { useDash } from "@/lib/dash/useDash";
import { findTransaction, riderFor, vendorFor } from "@/lib/dash/store";
import { formatDate, formatNaira, formatNgPhone, formatTime, initials } from "@/lib/dash/format";
import { isIssueStatus, timelineRank } from "@/lib/dash/status";

const ISSUE_COPY: Record<string, { tone: "error" | "warning" | "info" | "success"; title: string; body: string }> = {
  PAYMENT_FAILED: {
    tone: "error",
    title: "Payment was not completed",
    body: "The provider declined the charge, so no rider was dispatched. Nothing was taken from your account. You can try again with another payment method.",
  },
  PAYMENT_EXPIRED: {
    tone: "warning",
    title: "Payment session expired",
    body: "The payment window closed before the provider confirmed a charge. No money was captured. Create a new request to try again.",
  },
  VENDOR_UNAVAILABLE: {
    tone: "warning",
    title: "Cash is temporarily unavailable nearby",
    body: "We could not confirm enough cash with a vendor in this area. Operations is sourcing liquidity. If we cannot fulfil this request, you will be refunded in full.",
  },
  RIDER_UNAVAILABLE: {
    tone: "warning",
    title: "Finding another rider",
    body: "The assigned rider became unavailable. Operations is assigning another verified rider now — your cash is safe.",
  },
  DELIVERY_FAILED: {
    tone: "error",
    title: "Delivery could not be completed",
    body: "The rider could not hand the cash over. We're reviewing what happened and will contact you with next steps. Any captured payment is protected.",
  },
  DELIVERY_CANCELLED: {
    tone: "info",
    title: "This request was cancelled",
    body: "No cash delivery is in progress. If you paid, a refund will be queued to your original payment method.",
  },
  REFUND_PENDING: {
    tone: "warning",
    title: "Your refund is being processed",
    body: "We've sent the refund to your payment provider. It usually settles within 3–5 business days. You don't need to do anything.",
  },
  REFUNDED: {
    tone: "success",
    title: "Refund settled",
    body: "The full amount was returned to your original payment method. Contact support if you don't see it within 5 business days.",
  },
  DISPUTED: {
    tone: "warning",
    title: "Under review by operations",
    body: "Our team is investigating this delivery. We'll keep you updated and will not close the case without telling you the outcome.",
  },
};

export default function TrackDetailPage() {
  const params = useParams<{ id: string }>();
  const state = useDash();
  const tx = findTransaction(state, params?.id);
  const rider = riderFor(state, tx?.riderId);
  const vendor = vendorFor(state, tx?.vendorId);
  const [copied, setCopied] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  if (!state) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
          <div className="skeleton h-8 w-36 rounded-full" />
          <div className="skeleton h-52 rounded-3xl" />
          <div className="skeleton h-72 rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  if (!tx) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-lg font-bold text-ink">Delivery not found</p>
          <p className="mt-2 text-sm text-ink-soft">The reference may be wrong, or the request no longer exists.</p>
          <Link href="/track" className="btn btn-primary mt-6">Back to tracking</Link>
        </div>
      </AppShell>
    );
  }

  const rank = timelineRank(tx.status, tx.timeline);
  const issue = isIssueStatus(tx.status) ? ISSUE_COPY[tx.status] : undefined;
  const canDispute = ["COMPLETED", "DELIVERED", "REFUND_PENDING", "DISPUTED"].includes(tx.status) && !tx.disputeId;

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(tx.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-5">
        <div className="flex items-center justify-between">
          <Link href="/track" className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All deliveries
          </Link>
          <div className="flex items-center gap-2">
            {copied && <span className="text-[9px] font-semibold text-success">Copied</span>}
            <button
              type="button"
              onClick={copyReference}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[9px] font-semibold text-ink-soft hover:border-line-strong"
            >
              <span className="font-mono tracking-wide text-ink">{tx.reference}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status hero */}
        <div className="mt-5 overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_24px_60px_-30px_rgba(27,19,48,0.6)] rise">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">Cash delivery</p>
              <p className="num mt-1 text-[40px] font-bold leading-none tracking-[-0.04em]">{formatNaira(tx.amount)}</p>
            </div>
            <StatusBadge status={tx.status} />
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold">
              {initials(tx.recipient.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold">{tx.recipient.name}</p>
              <p className="truncate text-[9.5px] text-white/45">
                {tx.recipient.street}, {tx.recipient.area}
              </p>
            </div>
            {tx.etaMinutes ? (
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.1em] text-white/40">ETA</p>
                <p className="text-[13px] font-semibold">{tx.etaMinutes} min</p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex gap-1">
            {[0, 1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`h-1.5 flex-1 rounded-full ${step < rank ? "bg-lime" : step === rank ? "bg-white/45" : "bg-white/10"}`}
              />
            ))}
          </div>
        </div>

        {issue && (
          <Notice tone={issue.tone} className="mt-4">
            <p className="font-bold">{issue.title}</p>
            <p className="mt-0.5">{issue.body}</p>
            {tx.failureReason && tx.status === "DELIVERY_FAILED" && (
              <p className="mt-1 opacity-80">Rider note: {tx.failureReason}</p>
            )}
          </Notice>
        )}

        {tx.status === "COMPLETED" && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-success/20 bg-success-soft px-4 py-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-success" aria-hidden>
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            <div className="flex-1">
              <p className="text-[11.5px] font-bold text-success">Cash delivered and confirmed</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-success/80">
                The recipient verified the handoff with their one-time code. A receipt has been issued.
              </p>
            </div>
            {tx.receipt && (
              <button type="button" onClick={() => setReceiptOpen(true)} className="shrink-0 text-[10px] font-bold text-success underline">
                Receipt
              </button>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="app-card mt-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold tracking-[-0.015em]">Delivery timeline</h2>
            <span className="text-[9.5px] text-ink-soft">Updated {formatTime(tx.updatedAt)}</span>
          </div>
          <div className="mt-5">
            <DeliveryTimeline transaction={tx} />
          </div>
        </div>

        {/* Rider */}
        {rider && (
          <div className="app-card mt-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold tracking-[-0.015em]">Your rider</h2>
              <span className="badge badge-success"><span className="badge-dot" />Verified</span>
            </div>
            <div className="mt-3.5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
                {initials(rider.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink">{rider.name}</p>
                <p className="mt-0.5 text-[10.5px] text-ink-soft">
                  {rider.vehicle} · {rider.plate} · ★ {rider.rating.toFixed(1)}
                </p>
              </div>
              <a href={`tel:${rider.phone}`} className="btn btn-soft btn-sm" aria-label={`Call ${rider.name}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1z" />
                </svg>
                Call
              </a>
            </div>
            {vendor && (
              <p className="mt-3 border-t border-line pt-3 text-[10px] text-ink-soft">
                Cash collected from <span className="font-semibold text-ink">{vendor.name}</span>, {vendor.area}.
              </p>
            )}
          </div>
        )}

        {/* Recipient confirmation */}
        <div className="app-card mt-4 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-soft text-violet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
                <path d="M9 7h6M9 11h6M9 15h3" />
              </svg>
            </span>
            <div className="flex-1">
              <p className="text-[12.5px] font-semibold text-ink">
                {tx.otpVerifiedAt ? "Recipient confirmed the handoff" : "Recipient confirmation required"}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-soft">
                {tx.otpVerifiedAt
                  ? `A one-time code was verified at ${formatTime(tx.otpVerifiedAt)}. The rider could not complete this delivery without it.`
                  : `We sent a one-time code to ${formatNgPhone(tx.recipient.phone)}. The rider will ask for it when the cash is in the recipient's hands.`}
              </p>
              {tx.otpVerifiedAt && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-bold text-success">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  OTP verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="app-card mt-4 overflow-hidden">
          <div className="px-5 pt-5">
            <h2 className="text-[14px] font-bold tracking-[-0.015em]">Request details</h2>
          </div>
          <div className="mt-3 divide-y divide-line px-5 text-[11.5px]">
            <div className="flex items-start justify-between gap-4 py-3">
              <span className="text-ink-soft">Reference</span>
              <span className="font-mono font-semibold text-ink">{tx.reference}</span>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <span className="text-ink-soft">Recipient</span>
              <span className="text-right font-semibold text-ink">
                {tx.recipient.name}
                <span className="block font-normal text-ink-soft">{formatNgPhone(tx.recipient.phone)}</span>
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <span className="text-ink-soft">Address</span>
              <span className="max-w-[230px] text-right font-medium text-ink">
                {tx.recipient.street}, {tx.recipient.area}, {tx.recipient.city}
                {tx.recipient.instructions && (
                  <span className="mt-1 block font-normal text-ink-soft">{tx.recipient.instructions}</span>
                )}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <span className="text-ink-soft">Created</span>
              <span className="font-medium text-ink">{formatDate(tx.createdAt)}</span>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <span className="text-ink-soft">Payment</span>
              <span className="font-medium text-ink">{tx.paymentMethod}</span>
            </div>
            <div className="py-3">
              <div className="flex justify-between py-0.5">
                <span className="text-ink-soft">Cash amount</span>
                <span className="num font-medium text-ink">{formatNaira(tx.amount)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-ink-soft">Delivery fee</span>
                <span className="num font-medium text-ink">{formatNaira(tx.deliveryFee)}</span>
              </div>
              <div className="mt-1.5 flex justify-between border-t border-line pt-2">
                <span className="font-bold text-ink">Total paid</span>
                <span className="num font-bold text-ink">{formatNaira(tx.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => setHelpOpen(true)} className="btn btn-outline">
            Get help
          </button>
          {canDispute ? (
            <Link href={`/account/disputes?tx=${tx.id}`} className="btn btn-soft">
              Raise a dispute
            </Link>
          ) : tx.disputeId ? (
            <Link href="/account/disputes" className="btn btn-soft">
              View dispute
            </Link>
          ) : (
            <Link href="/account/help" className="btn btn-soft">
              Support
            </Link>
          )}
        </div>

        <p className="mt-5 text-center text-[9.5px] leading-relaxed text-ink-soft/65">
          Dash coordinates verified cash vendors and riders behind the scenes. Your money is protected until the
          recipient confirms handoff.
        </p>
      </div>

      <Sheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="How can we help?"
        subtitle={`Reference ${tx.reference}`}
      >
        <div className="space-y-2.5">
          {[
            ["Call Dash support", "Speak to a person about this delivery", "tel:+2347000000000"],
            ["Chat on WhatsApp", "Usually replies within 5 minutes", "https://wa.me/2347000000000"],
            ["Email support", "support@dash.ng", "mailto:support@dash.ng"],
          ].map(([title, sub, href]) => (
            <a
              key={title}
              href={href}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 transition-colors hover:border-line-strong"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[10.5px] text-ink-soft">{sub}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-line-strong" aria-hidden>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
          {canDispute && (
            <Link
              href={`/account/disputes?tx=${tx.id}`}
              onClick={() => setHelpOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-danger">Raise a dispute</p>
                <p className="mt-0.5 text-[10.5px] text-danger/70">Tell us what went wrong with this delivery</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-danger/60" aria-hidden>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
        <p className="mt-4 text-[9.5px] leading-relaxed text-ink-soft/70">
          Demo support details. In production these connect to the live support queue and dispute workflow.
        </p>
      </Sheet>

      {tx.receipt && (
        <Sheet
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          title="Transaction receipt"
          subtitle={tx.receipt.receiptNumber}
          footer={
            <button type="button" onClick={() => window.print()} className="btn btn-dark btn-block">
              Print / save receipt
            </button>
          }
        >
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="text-center">
              <p className="text-[15px] font-black tracking-[-0.06em] text-ink">dash<span className="text-violet">.</span></p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-ink-soft">Cash delivery receipt</p>
            </div>
            <div className="my-4 border-t border-dashed border-line" />
            <div className="space-y-2 text-[11px]">
              {[
                ["Receipt no.", tx.receipt.receiptNumber],
                ["Transaction ref.", tx.reference],
                ["Issued", formatDate(tx.receipt.issuedAt)],
                ["Recipient", tx.recipient.name],
                ["Delivered to", `${tx.recipient.street}, ${tx.recipient.area}`],
                ["Payment", tx.paymentMethod],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-ink-soft">{label}</span>
                  <span className="text-right font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
            <div className="my-4 border-t border-dashed border-line" />
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-ink-soft">Cash amount</span><span className="num text-ink">{formatNaira(tx.amount)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Delivery fee</span><span className="num text-ink">{formatNaira(tx.deliveryFee)}</span></div>
              <div className="flex justify-between border-t border-line pt-2 text-[13px] font-bold"><span>Total paid</span><span className="num">{formatNaira(tx.total)}</span></div>
            </div>
            <div className="mt-4 rounded-xl bg-success-soft px-3 py-2 text-center text-[9.5px] font-semibold text-success">
              Handoff confirmed by recipient OTP
            </div>
            <p className="mt-4 text-center text-[8px] uppercase tracking-[0.12em] text-ink-soft/60">
              Demo receipt · Equinox Digital Services Ltd
            </p>
          </div>
        </Sheet>
      )}
    </AppShell>
  );
}
