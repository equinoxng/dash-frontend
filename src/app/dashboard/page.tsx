"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { formatNaira, listRequests, type CashRequest } from "@/lib/requests";
import { getSession } from "@/lib/session";
import { getWallet, type Wallet } from "@/lib/wallet";

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
  if (s === "COMPLETED") return "#16a34a";
  if (s === "CANCELLED" || s === "PAYMENT_FAILED") return "#ef4444";
  return "#64748b";
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function Dashboard() {
  const [activity, setActivity] = useState<CashRequest[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [inProgressCount, setInProgressCount] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    getWallet(session.token).then(setWallet).catch(() => {});
    listRequests(session.token)
      .then((requests) => {
        setActivity(requests.slice(0, 4));
        setInProgressCount(requests.filter((r) => r.status === "RIDER_ASSIGNED" || r.status === "IN_PROGRESS").length);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      {/* Top nav */}
      <nav className="sticky top-0 z-40 border-b px-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <div className="max-w-2xl mx-auto h-16 flex items-center justify-between">
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-white/60 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#5b3fc4" }} />
            </button>
            <Link href="/profile" className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#1e1240" }}>
              AO
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Greeting */}
        <div>
          <p className="text-slate-500 text-sm">Good afternoon,</p>
          <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Ada Okafor 👋</h1>
        </div>

        {/* Balance card */}
        <div className="rounded-3xl px-6 pt-6 pb-5" style={{ background: "#1e1240" }}>
          {/* Label + eye toggle */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Wallet balance</span>
            <button onClick={() => setBalanceVisible(v => !v)} className="transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
              {balanceVisible
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              }
            </button>
          </div>

          {/* Balance amount */}
          <p className="text-white font-extrabold text-4xl tracking-tight mb-1">
            {balanceVisible ? formatNaira(wallet?.balance ?? 0) : "₦ ••••••"}
          </p>

          {/* Escrow pill */}
          {wallet && wallet.escrowBalance > 0 && (
            <Link href="/deliveries" className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 hover:underline" style={{ color: "rgba(255,255,255,0.6)" }}>
              {formatNaira(wallet.escrowBalance)} in escrow · {inProgressCount} in progress
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          )}

          {/* Divider */}
          <div className="mb-5" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

          {/* Action icon buttons */}
          <div className="flex justify-around">
            {[
              { label: "Add funds", href: "/fund",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
              { label: "Request", href: "/request",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
              { label: "Send", href: "/send",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg> },
              { label: "Withdraw", href: "/withdraw",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg> },
            ].map(({ label, href, icon }) => (
              <Link key={label} href={href} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
                  {icon}
                </div>
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Request", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>, href: "/request" },
            { label: "Send", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>, href: "/send" },
            { label: "History", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, href: "/activity" },
            { label: "Profile", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, href: "/profile" },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className="flex flex-col items-center gap-2 py-3.5 rounded-2xl border hover:bg-white/60 transition-colors"
              style={{ background: "white", borderColor: "#e0d9d0", color: "#1e1240" }}>
              {a.icon}
              <span className="text-xs font-semibold text-slate-600">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* Trust badge */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{ background: "white", borderColor: "#e0d9d0" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ede8fb" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <p className="text-slate-500 text-xs">PIN-confirmed handoff. Every vendor is verified and ID-checked.</p>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#0f0f0f]">Recent activity</h2>
            <Link href="/activity" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: "#5b3fc4" }}>
              See all
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
          <div className="space-y-2">
            {activity.length === 0 && (
              <p className="text-slate-400 text-sm px-1">No activity yet</p>
            )}
            {activity.map((a) => (
              <div key={a.requestId} className="flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{ background: "white", borderColor: "#e0d9d0" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ede8fb" }}>
                  {a.type === "RECEIVE_CASH"
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f0f0f] text-sm font-semibold">{a.type === "RECEIVE_CASH" ? "Cash received" : "Cash sent"}</p>
                  <p className="text-slate-400 text-xs">{formatDate(a.createdAt)} · {a.requestId}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#0f0f0f] font-bold text-sm">{formatNaira(a.amount)}</p>
                  <p className="text-xs font-medium" style={{ color: statusColor(a.status) }}>{STATUS_LABEL[a.status]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 border-t flex items-center justify-around px-6 py-3 safe-area-pb"
        style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <Link href="/dashboard" className="flex flex-col items-center gap-1" style={{ color: "#1e1240" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          <span className="text-xs font-semibold">Home</span>
        </Link>

        <Link href="/request"
          className="w-14 h-14 rounded-full flex items-center justify-center -mt-6 shadow-lg text-white hover:opacity-90 transition-opacity"
          style={{ background: "#1e1240" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </Link>

        <Link href="/activity" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
          <span className="text-xs font-semibold">Activity</span>
        </Link>
      </div>

      {/* Bottom padding for fixed nav */}
      <div className="h-24" />
    </div>
  );
}
