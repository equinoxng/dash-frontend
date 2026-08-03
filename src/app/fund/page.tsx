"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/requests";
import { fundWallet } from "@/lib/wallet";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";
import PinModal from "@/components/PinModal";

type Stage = "amount" | "success";

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000];

export default function FundWallet() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("amount");
  const [selectedAmt, setSelectedAmt] = useState(20000);
  const [customAmt, setCustomAmt] = useState("");
  const [amountError, setAmountError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [newBalance, setNewBalance] = useState(0);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;

  const handleContinue = () => {
    if (finalAmt <= 0) { setAmountError("Enter a valid amount."); return; }
    setAmountError("");
    setPinError("");
    setShowPin(true);
  };

  const handlePinConfirm = async (pin: string) => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }

    setPinError("");
    setPinLoading(true);
    try {
      const wallet = await fundWallet(session.token, finalAmt, pin);
      setPinLoading(false);
      setShowPin(false);
      setNewBalance(wallet.balance);
      setStage("success");
    } catch (err) {
      setPinLoading(false);
      setPinError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cream">
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md dash-card p-8">

        {stage === "amount" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <h1 className="text-xl font-extrabold text-ink">Add funds</h1>
            </div>

            <p className="dash-label mb-3">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map((a) => (
                <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); setAmountError(""); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedAmt === a && !customAmt ? "bg-ink text-white" : "bg-cream text-slate-700 hover:bg-accent-light"}`}>
                  {formatNaira(a)}
                </button>
              ))}
            </div>

            <label className="dash-label mb-1.5 block">Or enter amount</label>
            <div className="dash-input flex items-center gap-2 mb-5">
              <span className="text-ink-soft font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={e => { setCustomAmt(e.target.value); setAmountError(""); }}
                className="bg-transparent text-ink text-lg font-bold flex-1 outline-none placeholder-ink-soft/40" />
            </div>

            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <p className="text-xs text-ink-soft">This tops up your Dash wallet balance, used to fund Send and Request cash deliveries.</p>
            </div>

            {amountError && (
              <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2 mb-4">{amountError}</p>
            )}

            <button onClick={handleContinue} className="dash-btn dash-btn-ink w-full">
              Add {formatNaira(finalAmt)}
            </button>
          </>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-ink font-extrabold text-2xl">Wallet funded!</p>
            <p className="text-ink-soft text-sm mb-2">{formatNaira(finalAmt)} was added to your wallet</p>

            <div className="rounded-2xl p-4 w-full space-y-2.5 text-sm mt-2 bg-cream border border-line">
              <div className="flex justify-between">
                <span className="text-ink-soft">Amount added</span>
                <span className="text-ink font-semibold">{formatNaira(finalAmt)}</span>
              </div>
              <div className="border-t border-line pt-2.5 flex justify-between">
                <span className="text-ink-soft">New balance</span>
                <span className="text-ink font-bold">{formatNaira(newBalance)}</span>
              </div>
            </div>

            <button onClick={() => router.push("/dashboard")} className="dash-btn dash-btn-ink w-full mt-4">
              Back to dashboard
            </button>
          </div>
        )}
      </div>

      {showPin && (
        <PinModal
          title="Confirm funding"
          subtitle={`Enter your PIN to add ${formatNaira(finalAmt)} to your wallet`}
          loading={pinLoading}
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => setShowPin(false)}
        />
      )}
    </div>
  );
}
