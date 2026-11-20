"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/dash/AppShell";
import StatusBadge from "@/components/dash/StatusBadge";
import TransactionRow from "@/components/dash/TransactionRow";
import EmptyState from "@/components/dash/EmptyState";
import { useDash } from "@/lib/dash/useDash";
import { activeTransactions, customerTransactions, riderFor } from "@/lib/dash/store";
import { formatNaira, initials, timeAgo } from "@/lib/dash/format";
import { timelineRank, isActiveStatus } from "@/lib/dash/status";

export function TrackView({ embedded = false }: { embedded?: boolean }) {
  const state = useDash();
  const [tab, setTab] = useState<"active" | "history">("active");
  const [query, setQuery] = useState("");

  const all = customerTransactions(state);
  const active = activeTransactions(state);
  const history = all.filter((tx) => !isActiveStatus(tx.status));
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const results = all.filter(
    (tx) =>
      tx.reference.toLowerCase().includes(q) ||
      tx.recipient.name.toLowerCase().includes(q) ||
      tx.recipient.phone.includes(q)
  );
  const visibleActive = searching ? results.filter((tx) => isActiveStatus(tx.status)) : active;
  const visibleHistory = searching ? results.filter((tx) => !isActiveStatus(tx.status)) : history;

  const content = (
    <div className={`mx-auto max-w-2xl px-4 ${embedded ? "pb-4 pt-2" : "pb-8 pt-7"}`}>
      {!embedded && (
        <>
          <p className="eyebrow">Track</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h1 className="display text-[40px] text-ink">Your delivery, live.</h1>
            <Link href="/send" className="btn btn-primary btn-sm hidden sm:inline-flex">Send cash</Link>
          </div>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">
            Follow every handoff from payment to the recipient&apos;s door. Have a reference? Search for it below.
          </p>
        </>
      )}

        <div className="relative mt-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            className="field !pl-10"
            placeholder="Search by reference, name or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search deliveries"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink-soft"
              aria-label="Clear search"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-5 flex gap-1 rounded-full border border-line bg-white/60 p-1">
          {[
            ["active", "Active", active.length],
            ["history", "History", history.length],
          ].map(([key, label, count]) => (
            <button
              key={key as string}
              type="button"
              onClick={() => setTab(key as "active" | "history")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-semibold transition-colors ${
                tab === key ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === key ? "bg-white/15" : "bg-paper"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {tab === "active" && (
          <div className="mt-4 space-y-3">
            {visibleActive.length === 0 ? (
              <div className="app-card">
                <EmptyState
                  title={searching ? "No active delivery matches" : "No deliveries in progress"}
                  description={
                    searching
                      ? "Try another reference, or check the History tab."
                      : "When you send cash, you'll be able to follow the rider and handoff here."
                  }
                  action={searching ? undefined : { href: "/send", label: "Send cash" }}
                />
              </div>
            ) : (
              visibleActive.map((tx) => {
                const rank = timelineRank(tx.status, tx.timeline);
                const rider = riderFor(state, tx.riderId);
                return (
                  <Link
                    key={tx.id}
                    href={`/track/${tx.id}`}
                    className="app-card group block p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-soft text-[11px] font-bold text-violet-deep">
                          {initials(tx.recipient.name)}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-ink">{tx.recipient.name}</p>
                          <p className="mt-0.5 text-[10.5px] text-ink-soft">
                            {tx.recipient.area} · {timeAgo(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="num text-[16px] font-bold text-ink">{formatNaira(tx.amount)}</p>
                        <div className="mt-1"><StatusBadge status={tx.status} /></div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              step < rank ? "bg-violet" : step === rank ? "bg-violet/35" : "bg-line"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="font-medium text-ink-soft">
                          {rider ? `${rider.name} · ${rider.vehicle}` : "Preparing your cash"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-violet">
                          {tx.etaMinutes ? `${tx.etaMinutes} min` : "View details"}
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="app-card mt-4 overflow-hidden p-2">
            {visibleHistory.length === 0 ? (
              <EmptyState
                title={searching ? "Nothing matches that search" : "No past deliveries yet"}
                description={
                  searching
                    ? "Try a different reference, name or phone number."
                    : "Completed and refunded deliveries will be kept here."
                }
              />
            ) : (
              visibleHistory.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
            )}
          </div>
        )}

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-white/50 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-violet" aria-hidden>
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <p className="text-[10.5px] leading-relaxed text-ink-soft">
            A delivery is only completed after the recipient shares their one-time code with the rider. Reaching the
            door is not enough.
          </p>
        </div>
    </div>
  );

  if (embedded) return content;
  return <AppShell>{content}</AppShell>;
}

export default function TrackPage() {
  return <TrackView />;
}
