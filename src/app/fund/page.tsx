"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addToBalance, formatNaira } from "@/lib/wallet";
import VerifyPhoneBanner from "@/components/VerifyPhoneBanner";

const PRESETS = [5000, 10000, 20000, 50000, 100000];
const EXPIRY_SECONDS = 30 * 60;

function genAccountNumber() {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

export default function FundWallet() {
  const router = useRouter();
  const [stage, setStage] = useState<"amount" | "account" | "confirming" | "success">("amount");
  const [amount, setAmount] = useState(20000);
  const [customAmt, setCustomAmt] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || amount : amount;

  useEffect(() => {
    if (stage === "account") {
      setAccountNumber(genAccountNumber());
      setSecondsLeft(EXPIRY_SECONDS);
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage]);

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const expired = secondsLeft === 0;

  const handleGenerate = () => setStage("account");

  const handleNotify = async () => {
    setStage("confirming");
    await new Promise((r) => setTimeout(r, 2200));
    addToBalance(finalAmt);
    setStage("success");
  };

  const handleDone = () => router.push("/dashboard");

  const copyAccount = () => {
    navigator.clipboard?.writeText(accountNumber);
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
              <h1 className="text-xl font-extrabold text-[#0f0f0f]">Add funds to wallet</h1>
            </div>

            <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESETS.map((a) => (
                <button key={a} onClick={() => { setAmount(a); setCustomAmt(""); }}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: amount === a && !customAmt ? "#1e1240" : "#f5f0eb",
                    color: amount === a && !customAmt ? "white" : "#334155",
                  }}>
                  {formatNaira(a)}
                </button>
              ))}
            </div>

            <label className="text-slate-400 text-xs mb-1.5 block uppercase tracking-widest">Or enter amount</label>
            <div className="border rounded-xl px-4 py-3 flex items-center gap-2 mb-6" style={{ borderColor: "#e0d9d0" }}>
              <span className="text-slate-400 font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={(e) => setCustomAmt(e.target.value)}
                className="bg-transparent text-[#0f0f0f] text-lg font-bold flex-1 outline-none placeholder-slate-300" />
            </div>

            <button onClick={handleGenerate} disabled={finalAmt <= 0}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ background: "#1e1240" }}>
              Generate account number →
            </button>
          </>
        )}

        {/* ── VIRTUAL ACCOUNT ── */}
        {stage === "account" && (
          <>
            <div className="text-center mb-6">
              <p className="text-slate-400 text-xs mb-1 uppercase tracking-widest">Transfer exactly</p>
              <p className="text-[#0f0f0f] font-extrabold text-3xl">{formatNaira(finalAmt)}</p>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={expired ? "#ef4444" : "#5b3fc4"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <span className="text-sm font-semibold tabular-nums" style={{ color: expired ? "#ef4444" : "#5b3fc4" }}>
                {expired ? "Account expired" : `Expires in ${mm}:${ss}`}
              </span>
            </div>

            {/* Virtual account card */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: "#1e1240" }}>
              <p className="text-slate-400 text-xs mb-3">Bank transfer to</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-extrabold text-2xl tabular-nums tracking-wide">
                  {accountNumber.slice(0,3)} {accountNumber.slice(3,6)} {accountNumber.slice(6)}
                </span>
                <button onClick={copyAccount} className="text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg" style={{ background: "#2d1f5e" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
              </div>
              <div className="flex justify-between text-sm border-t pt-3" style={{ borderColor: "#3d2d70" }}>
                <span className="text-slate-400">Bank name</span>
                <span className="text-white font-semibold">Equinox Microfinance Bank</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-400">Account name</span>
                <span className="text-white font-semibold">Ada Okafor / Dash</span>
              </div>
            </div>

            <div className="rounded-xl p-3 mb-6 flex items-center gap-2" style={{ background: "#ede8fb" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
              <p className="text-xs" style={{ color: "#5b3fc4" }}>This account number is unique to this transaction only.</p>
            </div>

            {expired ? (
              <button onClick={handleGenerate}
                className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                style={{ background: "#1e1240" }}>
                Generate new account
              </button>
            ) : (
              <button onClick={handleNotify}
                className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                style={{ background: "#1e1240" }}>
                I've made this payment
              </button>
            )}
          </>
        )}

        {/* ── CONFIRMING ── */}
        {stage === "confirming" && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 animate-ping" style={{ borderColor: "#ede8fb" }} />
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#1e1240", borderTopColor: "transparent" }} />
            </div>
            <div>
              <p className="text-[#0f0f0f] font-bold text-lg mb-1">Confirming payment…</p>
              <p className="text-slate-400 text-sm">This usually takes a few seconds</p>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {stage === "success" && (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: "#1e1240" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-[#0f0f0f] font-extrabold text-2xl">Wallet funded!</p>
            <p className="text-slate-500 text-sm mb-2">{formatNaira(finalAmt)} has been added to your wallet</p>
            <button onClick={handleDone}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity mt-4"
              style={{ background: "#1e1240" }}>
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
