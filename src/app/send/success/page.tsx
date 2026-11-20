"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Wordmark from "@/components/dash/Wordmark";
import StatusBadge from "@/components/dash/StatusBadge";
import { useDash } from "@/lib/dash/useDash";
import { findTransaction } from "@/lib/dash/store";
import { formatNaira, formatNgPhone, initials } from "@/lib/dash/format";

function SuccessContent() {
  const params = useSearchParams();
  const state = useDash();
  const tx = findTransaction(state, params.get("ref") ?? undefined);

  if (!state) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-violet-soft" />
        <div className="mx-auto mt-5 h-4 w-40 animate-pulse rounded-full bg-line" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-bold text-ink">We couldn&apos;t find that request</p>
        <p className="mt-2 text-sm text-ink-soft">Check your transaction history for the latest status.</p>
        <Link href="/account/history" className="btn btn-primary mt-6">View transactions</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-14 pt-8">
      <div className="text-center rise">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-soft">
          <span className="absolute inset-0 rounded-full border border-violet/20" />
          <span className="absolute -inset-2 rounded-full border border-violet/10" />
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet" aria-hidden>
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        </div>
        <p className="eyebrow mt-5 text-success">Payment verified</p>
        <h1 className="display mt-2 text-[38px] leading-[0.98] text-ink">
          Payment successful.
          <br />
          <span className="italic text-violet">We&apos;re preparing your cash delivery.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[12.5px] leading-relaxed text-ink-soft">
          {tx.recipient.name} will receive the cash at the address you provided. We&apos;ll assign a verified rider
          once the vendor confirms cash availability.
        </p>
      </div>

      <div className="app-card mt-7 overflow-hidden rise" style={{ animationDelay: "80ms" }}>
        <div className="bg-ink px-5 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">Cash delivery</p>
              <p className="num mt-1 text-[36px] font-bold leading-none tracking-[-0.04em]">{formatNaira(tx.amount)}</p>
            </div>
            <StatusBadge status={tx.status} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10.5px]">
            <span className="text-white/45">Reference</span>
            <span className="font-mono font-semibold tracking-wide text-white/85">{tx.reference}</span>
          </div>
        </div>

        <div className="divide-y divide-line px-5">
          <div className="flex items-center gap-3 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-soft text-[10px] font-bold text-violet-deep">
              {initials(tx.recipient.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ink">{tx.recipient.name}</p>
              <p className="text-[10.5px] text-ink-soft">{formatNgPhone(tx.recipient.phone)}</p>
            </div>
            <span className="text-[10px] text-ink-soft">{tx.recipient.area}</span>
          </div>

          <div className="py-4 text-[12px]">
            <div className="flex justify-between py-1">
              <span className="text-ink-soft">Cash</span>
              <span className="num font-medium text-ink">{formatNaira(tx.amount)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-soft">Delivery fee</span>
              <span className="num font-medium text-ink">{formatNaira(tx.deliveryFee)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-2.5">
              <span className="font-bold text-ink">Paid</span>
              <span className="num font-bold text-ink">{formatNaira(tx.total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 py-3.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-success" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l2.5 2.5L16 9" />
            </svg>
            <p className="text-[10px] text-ink-soft">
              Payment confirmed by provider webhook. No rider is dispatched before this point.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 rise" style={{ animationDelay: "140ms" }}>
        <Link href={`/track/${tx.id}`} className="btn btn-primary btn-lg btn-block">
          Track delivery
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <Link href="/" className="btn btn-ghost btn-block">
          Back home
        </Link>
      </div>

      <p className="mt-5 text-center text-[9.5px] leading-relaxed text-ink-soft/70">
        Demo environment · funds are simulated. A real payment integration will verify this charge on the backend.
      </p>
    </div>
  );
}

export default function SendSuccessPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line/80">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Wordmark />
          <span className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            Demo
          </span>
        </div>
      </header>
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
