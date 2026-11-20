"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatNaira, SEND_FLOW_AVAILABLE } from "@/lib/requests";
import { getSession } from "@/lib/session";
import { listAddresses, type DeliveryAddress } from "@/lib/addresses";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cream">
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md dash-card p-8">

        {/* ── AMOUNT ── */}
        {stage === "amount" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <h1 className="text-xl font-extrabold text-ink">Request cash</h1>
            </div>

            <p className="dash-label mb-3">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map((a) => (
                <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); setError(""); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedAmt === a && !customAmt ? "bg-ink text-white" : "bg-cream text-slate-700 hover:bg-accent-light"}`}>
                  {formatNaira(a)}
                </button>
              ))}
            </div>

            <label className="dash-label mb-1.5 block">Or enter amount</label>
            <div className="dash-input flex items-center gap-2 mb-5">
              <span className="text-ink-soft font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={(e) => { setCustomAmt(e.target.value); setError(""); }}
                className="bg-transparent text-ink text-lg font-bold flex-1 outline-none placeholder-ink-soft/40" />
            </div>

            <div className="rounded-xl p-4 mb-5 space-y-2 text-sm bg-cream border border-line">
              {[["Amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)], ["Service fee", formatNaira(SERVICE_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-ink-soft">{l}</span>
                  <span className="text-ink font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t border-line pt-2 flex justify-between">
                <span className="text-ink-soft">Total deducted</span>
                <span className="text-ink font-bold">{formatNaira(total)}</span>
              </div>
            </div>

            {error && <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <button onClick={handleContinue} className="dash-btn dash-btn-ink w-full">
              Continue →
            </button>
          </>
        )}

        {/* ── CONFIRM ── */}
        {stage === "confirm" && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => setStage("amount")} className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div>
                <h1 className="text-lg font-extrabold text-ink leading-tight">Request cash</h1>
                <p className="text-ink-soft text-xs">Step 2 of 2</p>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1.5 mb-6">
              <div className="h-1 flex-1 rounded-full bg-ink" />
              <div className="h-1 flex-1 rounded-full bg-ink" />
            </div>

            {/* Deliver to — only shown when the user has saved addresses; otherwise the backend falls back to their profile address */}
            {addresses.length > 0 && (
              <>
                <p className="text-sm font-bold text-ink mb-3">Deliver to</p>
                <div className="space-y-2 mb-4">
                  {addresses.map((addr, i) => {
                    const selected = selectedAddress === i;
                    return (
                      <button key={addr.id} onClick={() => setSelectedAddress(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${selected ? "bg-ink border-ink" : "bg-cream border-line"}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${selected ? "bg-white/10" : "bg-line"}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke={selected ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${selected ? "text-white" : "text-ink"}`}>{addr.label}</p>
                          <p className={`text-xs truncate ${selected ? "text-white/60" : "text-ink-soft"}`}>{addr.fullAddress}</p>
                        </div>
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ETA */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 bg-cream border border-line">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <span className="text-sm text-ink-soft">Estimated arrival <span className="font-semibold text-ink">12–18 min</span></span>
            </div>

            {/* Fee breakdown */}
            <div className="rounded-2xl px-4 py-4 mb-4 space-y-2.5 text-sm bg-cream border border-line">
              {[["Cash amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-ink-soft">{l}</span>
                  <span className="text-ink font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t border-line pt-2.5 flex justify-between">
                <span className="text-ink font-bold">Total debited</span>
                <span className="text-ink font-bold">{formatNaira(finalAmt + DELIVERY_FEE)}</span>
              </div>
            </div>

            {!SEND_FLOW_AVAILABLE && (
              <div className="flex items-start gap-2.5 mb-4 rounded-xl px-3 py-2.5 bg-amber-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs text-amber-800">Request is being rebuilt on Dash&apos;s new escrow engine, including live rider tracking. Dispatching isn&apos;t available yet — check back soon.</p>
              </div>
            )}

            {/* Escrow note */}
            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <p className="text-xs text-ink-soft">Funds are held in escrow until your PIN confirms the handoff.</p>
            </div>

            <button disabled={!SEND_FLOW_AVAILABLE} className="dash-btn dash-btn-outline w-full !py-4">
              Confirm & dispatch vendor
            </button>
          </>
        )}
      </div>
    </div>
  );
}
