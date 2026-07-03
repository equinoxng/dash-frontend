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

  const borderStyle = { borderColor: "#e0d9d0" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={borderStyle}>

        {stage === "amount" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <h1 className="text-xl font-extrabold text-[#0f0f0f]">Add funds</h1>
            </div>

            <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map((a) => (
                <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); setAmountError(""); }}
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
            <div className="border rounded-xl px-4 py-3 flex items-center gap-2 mb-5" style={borderStyle}>
              <span className="text-slate-400 font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={e => { setCustomAmt(e.target.value); setAmountError(""); }}
                className="bg-transparent text-[#0f0f0f] text-lg font-bold flex-1 outline-none placeholder-slate-300" />
            </div>

            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <p className="text-xs text-slate-400">This tops up your Dash wallet balance, used to fund Send and Request cash deliveries.</p>
            </div>

            {amountError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{amountError}</p>
            )}

            <button onClick={handleContinue}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Add {formatNaira(finalAmt)}
            </button>
          </>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: "#1e1240" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#0f0f0f] font-extrabold text-2xl">Wallet funded!</p>
            <p className="text-slate-500 text-sm mb-2">{formatNaira(finalAmt)} was added to your wallet</p>

            <div className="rounded-2xl p-4 w-full space-y-2.5 text-sm mt-2" style={{ background: "#f5f0eb" }}>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount added</span>
                <span className="text-[#0f0f0f] font-semibold">{formatNaira(finalAmt)}</span>
              </div>
              <div className="border-t pt-2.5 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="text-slate-400">New balance</span>
                <span className="text-[#0f0f0f] font-bold">{formatNaira(newBalance)}</span>
              </div>
            </div>

            <button onClick={() => router.push("/dashboard")}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity mt-4"
              style={{ background: "#1e1240" }}>
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
