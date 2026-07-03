"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/requests";
import { withdrawWallet, getWallet } from "@/lib/wallet";
import { getBankAccounts, type BankAccount } from "@/lib/bank";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";
import PinModal from "@/components/PinModal";

type Stage = "amount" | "success";

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000];

export default function WithdrawFunds() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("amount");
  const [selectedAmt, setSelectedAmt] = useState(20000);
  const [customAmt, setCustomAmt] = useState("");
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [newBalance, setNewBalance] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    getWallet(session.token).then((w) => setBalance(w.balance)).catch(() => {});
    setAccounts(getBankAccounts());
  }, []);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;

  const handleContinue = () => {
    if (finalAmt <= 0) { setError("Enter a valid amount."); return; }
    if (finalAmt > balance) { setError(`Insufficient balance. You have ${formatNaira(balance)}.`); return; }
    if (accounts.length === 0) { setError("Add a bank account first to withdraw."); return; }
    setError("");
    setPinError("");
    setShowPin(true);
  };

  const handlePinConfirm = async (pin: string) => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }

    setPinError("");
    setPinLoading(true);
    try {
      const wallet = await withdrawWallet(session.token, finalAmt, pin);
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
              <h1 className="text-xl font-extrabold text-[#0f0f0f]">Withdraw</h1>
            </div>

            <p className="text-slate-400 text-xs mb-3">Wallet balance: <span className="font-semibold text-[#0f0f0f]">{formatNaira(balance)}</span></p>

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
            <div className="border rounded-xl px-4 py-3 flex items-center gap-2 mb-5" style={borderStyle}>
              <span className="text-slate-400 font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={e => { setCustomAmt(e.target.value); setError(""); }}
                className="bg-transparent text-[#0f0f0f] text-lg font-bold flex-1 outline-none placeholder-slate-300" />
            </div>

            <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Withdraw to</p>
            {accounts.length === 0 ? (
              <Link href="/settings/bank" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border mb-5 hover:bg-[#f5f0eb] transition-colors" style={borderStyle}>
                <span className="text-sm font-semibold" style={{ color: "#5b3fc4" }}>Add a bank account to withdraw →</span>
              </Link>
            ) : (
              <div className="space-y-2 mb-5">
                {accounts.map((acc, i) => (
                  <button key={acc.id} onClick={() => setSelectedAccount(i)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
                    style={{
                      background: selectedAccount === i ? "#1e1240" : "#f5f0eb",
                      borderColor: selectedAccount === i ? "#1e1240" : "#e0d9d0",
                    }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: selectedAccount === i ? "white" : "#0f0f0f" }}>{acc.accountName}</p>
                      <p className="text-xs" style={{ color: selectedAccount === i ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{acc.bankName} · {acc.accountNumber.slice(0, 3)}*****{acc.accountNumber.slice(-2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <button onClick={handleContinue}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Withdraw {formatNaira(finalAmt)}
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
            <p className="text-[#0f0f0f] font-extrabold text-2xl">Withdrawal initiated!</p>
            <p className="text-slate-500 text-sm mb-2">{formatNaira(finalAmt)} is on its way to your bank account</p>

            <div className="rounded-2xl p-4 w-full space-y-2.5 text-sm mt-2" style={{ background: "#f5f0eb" }}>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount withdrawn</span>
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
          title="Confirm withdrawal"
          subtitle={`Enter your PIN to withdraw ${formatNaira(finalAmt)}`}
          loading={pinLoading}
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => setShowPin(false)}
        />
      )}
    </div>
  );
}
