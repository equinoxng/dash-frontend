"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/dash/AppShell";
import TransactionRow from "@/components/dash/TransactionRow";
import EmptyState from "@/components/dash/EmptyState";
import { useDash } from "@/lib/dash/useDash";
import { customerTransactions } from "@/lib/dash/store";
import { isActiveStatus, isIssueStatus } from "@/lib/dash/status";

const FILTERS = ["All", "Active", "Completed", "Issues"] as const;
type Filter = (typeof FILTERS)[number];

export default function HistoryPage() {
  const state = useDash();
  const all = customerTransactions(state);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = all.filter((tx) => {
    const matchesFilter =
      filter === "All"
        ? true
        : filter === "Active"
          ? isActiveStatus(tx.status)
          : filter === "Completed"
            ? tx.status === "COMPLETED"
            : isIssueStatus(tx.status);
    const matchesSearch =
      !q ||
      tx.reference.toLowerCase().includes(q) ||
      tx.recipient.name.toLowerCase().includes(q) ||
      tx.recipient.phone.includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-5">
        <Link href="/account" className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Account
        </Link>

        <p className="eyebrow mt-4">History</p>
        <h1 className="display mt-1 text-[38px] text-ink">Every handoff.</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
          Cash requests, refunds and receipts — all tied to a reference you can search.
        </p>

        <div className="relative mt-5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input className="field !pl-10" placeholder="Search reference, name or phone" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search transactions" />
        </div>

        <div className="hide-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {FILTERS.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${filter === item ? "bg-ink text-white" : "border border-line bg-white text-ink-soft hover:text-ink"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="app-card mt-4 overflow-hidden p-2">
          {filtered.length === 0 ? (
            <EmptyState
              title={q ? "No matching transactions" : "Nothing here yet"}
              description={q ? "Try a different reference, name or phone number." : "Cash requests will appear here as soon as you send one."}
              action={q ? undefined : { href: "/send", label: "Send cash" }}
            />
          ) : (
            filtered.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
          )}
        </div>

        {filtered.length > 0 && (
          <p className="mt-4 text-center text-[9.5px] text-ink-soft/70">
            Showing {filtered.length} of {all.length} transactions. Completed deliveries include a downloadable receipt.
          </p>
        )}
      </div>
    </AppShell>
  );
}
