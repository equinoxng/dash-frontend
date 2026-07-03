"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { formatNaira, listRequests, confirmDelivery, type CashRequest } from "@/lib/requests";
import { getWallet } from "@/lib/wallet";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";
import PinModal from "@/components/PinModal";

const STATUS_LABEL: Record<CashRequest["status"], string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Pending",
  PAYMENT_FAILED: "Failed",
  PAYMENT_RECEIVED: "Payment received",
  RIDER_ASSIGNED: "Rider assigned",
  IN_PROGRESS: "En route",
  CONFIRMED: "Confirmed",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function DeliveriesInProgress() {
  const [deliveries, setDeliveries] = useState<CashRequest[]>([]);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  const refresh = useCallback(() => {
    const session = getSession();
    if (!session) return;
    listRequests(session.token)
      .then((requests) =>
        setDeliveries(requests.filter((r) => r.status === "RIDER_ASSIGNED" || r.status === "IN_PROGRESS"))
      )
      .catch(() => {});
    getWallet(session.token).then((w) => setEscrowBalance(w.escrowBalance)).catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handlePinConfirm = async (pin: string) => {
    const session = getSession();
    if (!session || !confirmingId) return;

    setPinError("");
    setPinLoading(true);
    try {
      await confirmDelivery(session.token, confirmingId, pin);
      setPinLoading(false);
      setConfirmingId(null);
      refresh();
    } catch (err) {
      setPinLoading(false);
      setPinError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      <nav className="sticky top-0 z-40 border-b px-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "white", border: "1px solid #e0d9d0" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Deliveries in progress</h1>

        {/* Escrow summary */}
        <div className="rounded-3xl px-6 py-5" style={{ background: "#1e1240" }}>
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>In escrow</span>
          <p className="text-white font-extrabold text-3xl tracking-tight mt-1">{formatNaira(escrowBalance)}</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {deliveries.length} {deliveries.length === 1 ? "delivery" : "deliveries"} in progress
          </p>
        </div>

        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#ede8fb" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
            </div>
            <p className="text-[#0f0f0f] font-semibold">No deliveries in progress</p>
            <p className="text-slate-400 text-sm">Requests awaiting rider handoff will show up here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deliveries.map((d) => (
              <div key={d.requestId} className="rounded-2xl px-4 py-4 border space-y-3" style={{ background: "white", borderColor: "#e0d9d0" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ede8fb" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0f0f0f] text-sm font-semibold">{d.type === "RECEIVE_CASH" ? "Cash delivery" : "Cash sent"}</p>
                    <p className="text-slate-400 text-xs">{formatDate(d.createdAt)} · {d.requestId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#0f0f0f] font-bold text-sm">{formatNaira(d.totalAmount)}</p>
                    <p className="text-xs font-medium" style={{ color: "#5b3fc4" }}>{STATUS_LABEL[d.status]}</p>
                  </div>
                </div>
                {d.status === "IN_PROGRESS" && (
                  <button onClick={() => { setPinError(""); setConfirmingId(d.requestId); }}
                    className="w-full font-semibold text-sm py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                    style={{ background: "#1e1240" }}>
                    Confirm delivery
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmingId && (
        <PinModal
          title="Confirm delivery"
          subtitle="Enter your PIN to release escrow and complete this delivery"
          loading={pinLoading}
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => setConfirmingId(null)}
        />
      )}
    </div>
  );
}
