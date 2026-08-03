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
              <h1 className="text-xl font-extrabold text-ink">Withdraw</h1>
            </div>

            <p className="text-ink-soft text-xs mb-3">Wallet balance: <span className="font-semibold text-ink">{formatNaira(balance)}</span></p>

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
                onChange={e => { setCustomAmt(e.target.value); setError(""); }}
                className="bg-transparent text-ink text-lg font-bold flex-1 outline-none placeholder-ink-soft/40" />
            </div>

            <p className="dash-label mb-3">Withdraw to</p>
            {accounts.length === 0 ? (
              <Link href="/settings/bank" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-line mb-5 hover:bg-cream transition-colors">
                <span className="text-sm font-semibold text-accent">Add a bank account to withdraw →</span>
              </Link>
            ) : (
              <div className="space-y-2 mb-5">
                {accounts.map((acc, i) => {
                  const selected = selectedAccount === i;
                  return (
                    <button key={acc.id} onClick={() => setSelectedAccount(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${selected ? "bg-ink border-ink" : "bg-cream border-line"}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${selected ? "text-white" : "text-ink"}`}>{acc.accountName}</p>
                        <p className={`text-xs ${selected ? "text-white/60" : "text-ink-soft"}`}>{acc.bankName} · {acc.accountNumber.slice(0, 3)}*****{acc.accountNumber.slice(-2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {error && <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <button onClick={handleContinue} className="dash-btn dash-btn-ink w-full">
              Withdraw {formatNaira(finalAmt)}
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
            <p className="text-ink font-extrabold text-2xl">Withdrawal initiated!</p>
            <p className="text-ink-soft text-sm mb-2">{formatNaira(finalAmt)} is on its way to your bank account</p>

            <div className="rounded-2xl p-4 w-full space-y-2.5 text-sm mt-2 bg-cream border border-line">
              <div className="flex justify-between">
                <span className="text-ink-soft">Amount withdrawn</span>
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
