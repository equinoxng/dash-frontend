"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatNaira, SEND_FLOW_AVAILABLE } from "@/lib/requests";
import { getSession } from "@/lib/session";
import { listAddresses, type DeliveryAddress } from "@/lib/addresses";
import VerifyPhoneBanner from "@/components/VerifyPhoneBanner";

type Stage = "amount" | "confirm";

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000];
const DELIVERY_FEE = 500;
const SERVICE_FEE = 100;

export default function RequestCash() {
  const [stage, setStage] = useState<Stage>("amount");
  const [selectedAmt, setSelectedAmt] = useState(20000);
  const [customAmt, setCustomAmt] = useState("");
  const [error, setError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listAddresses(session.token).then(setAddresses).catch(() => {});
  }, []);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;
  const total = finalAmt + DELIVERY_FEE + SERVICE_FEE;

  const handleContinue = () => {
    if (finalAmt <= 0) { setError("Enter a valid amount."); return; }
    setError("");
    setStage("confirm");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md">
        <VerifyPhoneBanner />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#e0d9d0" }}>

        {/* ── AMOUNT ── */}
        {stage === "amount" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <h1 className="text-xl font-extrabold text-[#0f0f0f]">Request cash</h1>
            </div>

            <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map((a) => (
                <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); setError(""); }}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: selectedAmt === a && !customAmt ? "#1e1240" : "#f5f0eb",
                    color: selectedAmt === a && !customAmt ? "white" : "#334155",
                  }}>
                  {formatNaira(a)}
                </button>
              ))}
            </div>

            <label className="text-slate-400 text-xs mb-1.5 block uppercase tracking-widest">Or enter amount</label>
            <div className="border rounded-xl px-4 py-3 flex items-center gap-2 mb-5" style={{ borderColor: "#e0d9d0" }}>
              <span className="text-slate-400 font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={(e) => { setCustomAmt(e.target.value); setError(""); }}
                className="bg-transparent text-[#0f0f0f] text-lg font-bold flex-1 outline-none placeholder-slate-300" />
            </div>

            <div className="rounded-xl p-4 mb-5 space-y-2 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)], ["Service fee", formatNaira(SERVICE_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="text-slate-500">Total deducted</span>
                <span className="text-[#0f0f0f] font-bold">{formatNaira(total)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <button onClick={handleContinue}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Continue →
            </button>
          </>
        )}

        {/* ── CONFIRM ── */}
        {stage === "confirm" && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => setStage("amount")} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div>
                <h1 className="text-lg font-extrabold text-[#0f0f0f] leading-tight">Request cash</h1>
                <p className="text-slate-400 text-xs">Step 2 of 2</p>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1.5 mb-6">
              <div className="h-1 flex-1 rounded-full" style={{ background: "#1e1240" }} />
              <div className="h-1 flex-1 rounded-full" style={{ background: "#1e1240" }} />
            </div>

            {/* Deliver to — only shown when the user has saved addresses; otherwise the backend falls back to their profile address */}
            {addresses.length > 0 && (
              <>
                <p className="text-sm font-bold text-[#0f0f0f] mb-3">Deliver to</p>
                <div className="space-y-2 mb-4">
                  {addresses.map((addr, i) => (
                    <button key={addr.id} onClick={() => setSelectedAddress(i)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
                      style={{
                        background: selectedAddress === i ? "#1e1240" : "#f5f0eb",
                        borderColor: selectedAddress === i ? "#1e1240" : "#e0d9d0",
                      }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: selectedAddress === i ? "rgba(255,255,255,0.12)" : "#e0d9d0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke={selectedAddress === i ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: selectedAddress === i ? "white" : "#0f0f0f" }}>{addr.label}</p>
                        <p className="text-xs truncate" style={{ color: selectedAddress === i ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{addr.fullAddress}</p>
                      </div>
                      {selectedAddress === i && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ETA */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4" style={{ background: "#f5f0eb" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <span className="text-sm text-slate-500">Estimated arrival <span className="font-semibold text-[#0f0f0f]">12–18 min</span></span>
            </div>

            {/* Fee breakdown */}
            <div className="rounded-2xl px-4 py-4 mb-4 space-y-2.5 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Cash amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2.5 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="text-[#0f0f0f] font-bold">Total debited</span>
                <span className="text-[#0f0f0f] font-bold">{formatNaira(finalAmt + DELIVERY_FEE)}</span>
              </div>
            </div>

            {!SEND_FLOW_AVAILABLE && (
              <div className="flex items-start gap-2.5 mb-4 rounded-xl px-3 py-2.5" style={{ background: "#fdf6e3" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs" style={{ color: "#92400e" }}>Request is being rebuilt on Dash&apos;s new escrow engine, including live rider tracking. Dispatching isn&apos;t available yet — check back soon.</p>
              </div>
            )}

            {/* Escrow note */}
            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <p className="text-xs text-slate-400">Funds are held in escrow until your PIN confirms the handoff.</p>
            </div>

            <button disabled={!SEND_FLOW_AVAILABLE}
              className="w-full font-bold py-4 rounded-2xl text-[#0f0f0f] transition-opacity"
              style={{ background: "#eee9e3", opacity: SEND_FLOW_AVAILABLE ? 1 : 0.5, cursor: SEND_FLOW_AVAILABLE ? "pointer" : "not-allowed" }}>
              Confirm & dispatch vendor
            </button>
          </>
        )}
      </div>
    </div>
  );
}
