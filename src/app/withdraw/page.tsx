"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBalance, addToBalance, formatNaira } from "@/lib/wallet";
import { addActivity } from "@/lib/activity";
import { getBankAccounts, type BankAccount } from "@/lib/bank";
import PinModal from "@/components/PinModal";

type Stage = "account" | "amount" | "confirm" | "success";
const AMOUNTS = [5000, 10000, 20000, 50000, 100000];
const WITHDRAWAL_FEE = 100;

export default function Withdraw() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("account");
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedAmt, setSelectedAmt] = useState(10000);
  const [customAmt, setCustomAmt] = useState("");
  const [balance, setBalanceState] = useState(0);
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    setBalanceState(getBalance());
    const accs = getBankAccounts();
    setAccounts(accs);
    if (accs.length > 0) setSelectedAccount(accs[0]);
  }, []);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;
  const total = finalAmt + WITHDRAWAL_FEE;

  const handleAccountNext = () => {
    if (!selectedAccount) { setError("Select a bank account."); return; }
    setError("");
    setStage("amount");
  };

  const handleAmountNext = () => {
    if (finalAmt <= 0) { setError("Enter a valid amount."); return; }
    if (total > balance) { setError(`Insufficient balance. You have ${formatNaira(balance)}.`); return; }
    setError("");
    setStage("confirm");
  };

  const handlePinConfirm = async (_pin: string) => {
    setPinLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setPinLoading(false);
    setShowPin(false);
    addToBalance(-total);
    addActivity({ amount: finalAmt, status: "Completed", type: "withdrawal", meta: selectedAccount!.bankName });
    setStage("success");
  };

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none bg-white text-[#0f0f0f] placeholder-slate-300";
  const borderStyle = { borderColor: "#e0d9d0" };

  const steps = ["Account", "Amount", "Confirm"];
  const stepIdx = stage === "account" ? 1 : stage === "amount" ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={borderStyle}>

        {/* ── SELECT ACCOUNT ── */}
        {stage === "account" && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <div>
                <h1 className="text-lg font-extrabold text-[#0f0f0f] leading-tight">Withdraw funds</h1>
                <p className="text-slate-400 text-xs">Step 1 of 3 · Select account</p>
              </div>
            </div>
            <div className="flex gap-1.5 mb-6">
              {steps.map((_, i) => <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < stepIdx ? "#1e1240" : "#e0d9d0" }} />)}
            </div>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 py-8">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#ede8fb" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <p className="font-semibold text-[#0f0f0f]">No bank account saved</p>
                <p className="text-slate-400 text-sm">Add one in settings to withdraw</p>
                <Link href="/settings/bank"
                  className="mt-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#1e1240" }}>
                  Add bank account
                </Link>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Withdraw to</p>
                <div className="space-y-2 mb-6">
                  {accounts.map(a => (
                    <button key={a.id} onClick={() => { setSelectedAccount(a); setError(""); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
                      style={{
                        background: selectedAccount?.id === a.id ? "#1e1240" : "#f5f0eb",
                        borderColor: selectedAccount?.id === a.id ? "#1e1240" : "#e0d9d0",
                      }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: selectedAccount?.id === a.id ? "rgba(255,255,255,0.15)" : "#e0d9d0" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke={selectedAccount?.id === a.id ? "white" : "#64748b"} strokeWidth="1.8" strokeLinecap="round">
                          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: selectedAccount?.id === a.id ? "white" : "#0f0f0f" }}>{a.accountName}</p>
                        <p className="text-xs truncate" style={{ color: selectedAccount?.id === a.id ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>
                          {a.bankName} · {a.accountNumber.slice(0, 3)}*****{a.accountNumber.slice(-2)}
                        </p>
                      </div>
                      {selectedAccount?.id === a.id && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <Link href="/settings/bank" className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70" style={{ color: "#5b3fc4" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  Add another account
                </Link>

                {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
                <button onClick={handleAccountNext}
                  className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#1e1240" }}>
                  Continue →
                </button>
              </>
            )}
          </>
        )}

        {/* ── AMOUNT ── */}
        {stage === "amount" && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => setStage("account")} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div>
                <h1 className="text-lg font-extrabold text-[#0f0f0f] leading-tight">Withdraw funds</h1>
                <p className="text-slate-400 text-xs">Step 2 of 3 · Enter amount</p>
              </div>
            </div>
            <div className="flex gap-1.5 mb-6">
              {steps.map((_, i) => <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < stepIdx ? "#1e1240" : "#e0d9d0" }} />)}
            </div>

            <p className="text-slate-400 text-xs mb-1">Available balance: <span className="font-semibold text-[#0f0f0f]">{formatNaira(balance)}</span></p>
            <p className="text-slate-400 text-xs mb-4 uppercase tracking-widest mt-3">Select amount</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); setError(""); }}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: selectedAmt === a && !customAmt ? "#1e1240" : "#f5f0eb", color: selectedAmt === a && !customAmt ? "white" : "#334155" }}>
                  {formatNaira(a)}
                </button>
              ))}
            </div>

            <label className="text-slate-400 text-xs mb-1.5 block uppercase tracking-widest">Or enter amount</label>
            <div className="border rounded-xl px-4 py-3 flex items-center gap-2 mb-5" style={borderStyle}>
              <span className="text-slate-400 font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={e => { setCustomAmt(e.target.value); setError(""); }}
                className="bg-transparent text-[#0f0f0f] text-lg font-bold flex-1 outline-none placeholder-slate-300" />
            </div>

            <div className="rounded-xl p-4 mb-5 space-y-2 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Amount", formatNaira(finalAmt)], ["Processing fee", formatNaira(WITHDRAWAL_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="font-bold text-[#0f0f0f]">Total deducted</span>
                <span className="font-bold text-[#0f0f0f]">{formatNaira(total)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            <button onClick={handleAmountNext}
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
                <h1 className="text-lg font-extrabold text-[#0f0f0f] leading-tight">Withdraw funds</h1>
                <p className="text-slate-400 text-xs">Step 3 of 3 · Confirm</p>
              </div>
            </div>
            <div className="flex gap-1.5 mb-6">
              {steps.map((_, i) => <div key={i} className="h-1 flex-1 rounded-full" style={{ background: "#1e1240" }} />)}
            </div>

            <div className="rounded-2xl p-6 mb-4 text-center" style={{ background: "#f5f0eb" }}>
              <p className="text-slate-400 text-xs mb-1">Withdrawing</p>
              <p className="text-[#0f0f0f] font-extrabold text-4xl">{formatNaira(finalAmt)}</p>
            </div>

            <div className="rounded-2xl p-4 mb-3" style={{ background: "#f5f0eb" }}>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Destination</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ede8fb" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div>
                  <p className="font-bold text-[#0f0f0f]">{selectedAccount?.accountName}</p>
                  <p className="text-slate-400 text-xs">{selectedAccount?.bankName} · {selectedAccount?.accountNumber}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 mb-4 space-y-2 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Amount", formatNaira(finalAmt)], ["Processing fee", formatNaira(WITHDRAWAL_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span><span className="font-semibold text-[#0f0f0f]">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="font-bold text-[#0f0f0f]">Total deducted</span>
                <span className="font-bold text-[#0f0f0f]">{formatNaira(total)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-xs text-slate-400">Funds are typically credited within 5–15 minutes.</p>
            </div>

            <button onClick={() => setShowPin(true)}
              className="w-full font-bold py-4 rounded-2xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Confirm withdrawal
            </button>
          </>
        )}

        {/* ── SUCCESS ── */}
        {stage === "success" && (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: "#1e1240" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-[#0f0f0f] font-extrabold text-2xl">Withdrawal successful</p>
            <p className="text-slate-500 text-sm mb-2">{formatNaira(finalAmt)} is on its way to your bank</p>
            <div className="rounded-2xl p-4 w-full space-y-2 text-sm mt-2" style={{ background: "#f5f0eb" }}>
              {[["Account", selectedAccount?.accountName ?? ""], ["Bank", selectedAccount?.bankName ?? ""], ["Amount", formatNaira(finalAmt)], ["Status", "Processing"]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-medium">{v}</span>
                </div>
              ))}
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
          title="Confirm withdrawal"
          subtitle="Enter your 4-digit PIN to authorise this withdrawal"
          loading={pinLoading}
          onConfirm={handlePinConfirm}
          onCancel={() => setShowPin(false)}
        />
      )}
    </div>
  );
}
