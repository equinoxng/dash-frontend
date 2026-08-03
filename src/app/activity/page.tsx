"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatNaira, listRequests, type CashRequest, type RequestType } from "@/lib/requests";
import { getSession } from "@/lib/session";

const TABS = ["All", "Deliveries", "Sent"] as const;
type Tab = (typeof TABS)[number];

const TYPE_CONFIG: Record<RequestType, {
  label: string;
  icon: React.ReactNode;
  amtPrefix: string;
  amtColorClass: string;
}> = {
  RECEIVE_CASH: {
    label: "Cash received",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
    amtPrefix: "",
    amtColorClass: "text-emerald-600",
  },
  SEND_CASH: {
    label: "Cash sent",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    amtPrefix: "−",
    amtColorClass: "text-ink",
  },
};

const STATUS_LABEL: Record<CashRequest["status"], string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Pending",
  PAYMENT_FAILED: "Failed",
  PAYMENT_RECEIVED: "Pending",
  RIDER_ASSIGNED: "In progress",
  IN_PROGRESS: "In progress",
  CONFIRMED: "In progress",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const statusColor = (s: CashRequest["status"]) => {
  if (s === "COMPLETED") return "text-emerald-600";
  if (s === "CANCELLED" || s === "PAYMENT_FAILED") return "text-red-500";
  return "text-ink-soft";
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function ActivityPage() {
  const [tab, setTab] = useState<Tab>("All");
  const [activity, setActivity] = useState<CashRequest[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listRequests(session.token).then(setActivity).catch(() => {});
  }, []);

  const filtered = activity.filter((a) => {
    if (tab === "Deliveries") return a.type === "RECEIVE_CASH";
    if (tab === "Sent") return a.type === "SEND_CASH";
    return true;
  });

  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-40 border-b-2 border-ink px-4 bg-cream">
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-ink mb-5">Activity</h1>

        {/* Tabs — horizontally scrollable */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 border ${tab === t ? "bg-ink text-white border-ink" : "bg-white text-ink-soft border-line"}`}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
            </div>
            <p className="text-ink font-semibold">No activity yet</p>
            <p className="text-ink-soft text-sm">Your transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => {
              const cfg = TYPE_CONFIG[a.type];
              return (
                <div key={a.requestId} className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-line bg-white">
                  <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-sm font-semibold">{cfg.label}</p>
                    <p className="text-ink-soft text-xs truncate">{a.recipientName ? `To ${a.recipientName} · ` : ""}{formatDate(a.createdAt)} · {a.requestId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${cfg.amtColorClass}`}>
                      {cfg.amtPrefix}{formatNaira(a.amount)}
                    </p>
                    <p className={`text-xs font-medium ${statusColor(a.status)}`}>{STATUS_LABEL[a.status]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
