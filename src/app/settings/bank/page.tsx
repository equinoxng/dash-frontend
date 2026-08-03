"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getBankAccounts, addBankAccount, removeBankAccount, type BankAccount } from "@/lib/bank";

const BANKS = [
  "Access Bank", "First Bank", "GTBank", "Zenith Bank", "UBA",
  "Fidelity Bank", "Union Bank", "Sterling Bank", "Stanbic IBTC",
  "Opay", "Kuda Bank", "Moniepoint", "Palmpay",
];

export default function BankSettings() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setAccounts(getBankAccounts()); }, []);

  const update = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const handleResolve = async () => {
    if (form.accountNumber.replace(/\D/g, "").length < 10) { setError("Enter a valid 10-digit account number."); return; }
    if (!form.bankName) { setError("Select a bank."); return; }
    setResolving(true);
    await new Promise(r => setTimeout(r, 1200));
    setResolving(false);
    setForm(f => ({ ...f, accountName: "Ada Okafor" }));
  };

  const handleAdd = () => {
    if (!form.accountName) { setError("Resolve account name first."); return; }
    const updated = [...accounts, addBankAccount(form)];
    setAccounts(updated);
    setForm({ bankName: "", accountNumber: "", accountName: "" });
    setAdding(false);
  };

  const handleRemove = (id: string) => {
    removeBankAccount(id);
    setAccounts(a => a.filter(x => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-40 border-b-2 border-ink px-4 bg-cream">
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-ink">Bank accounts</h1>
          {!adding && (
            <button onClick={() => setAdding(true)} className="dash-btn dash-btn-ink !py-2 !px-4 text-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="7" y1="2" x2="7" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Add account
            </button>
          )}
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-white rounded-2xl border border-line p-5 space-y-4">
            <h2 className="font-bold text-ink">New bank account</h2>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bank</label>
              <select value={form.bankName} onChange={e => update("bankName", e.target.value)} className="dash-input">
                <option value="">Select bank…</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Account number</label>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" maxLength={10} placeholder="0123456789"
                  value={form.accountNumber}
                  onChange={e => { update("accountNumber", e.target.value.replace(/\D/g, "")); setForm(f => ({ ...f, accountName: "" })); }}
                  className="dash-input flex-1" />
                <button onClick={handleResolve} disabled={resolving || form.accountNumber.length < 10 || !form.bankName}
                  className="dash-btn dash-btn-ink !px-4 text-sm shrink-0 disabled:opacity-40">
                  {resolving ? "…" : "Verify"}
                </button>
              </div>
            </div>

            {form.accountName && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 bg-accent-light">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-sm font-semibold text-ink">{form.accountName}</span>
              </div>
            )}

            {error && <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAdding(false); setForm({ bankName: "", accountNumber: "", accountName: "" }); setError(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-cream text-slate-700">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!form.accountName} className="dash-btn dash-btn-ink flex-1 !py-3 text-sm disabled:opacity-40">
                Save account
              </button>
            </div>
          </div>
        )}

        {/* Account list */}
        {accounts.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="15"/><line x1="10" y1="13.5" x2="14" y2="13.5"/></svg>
            </div>
            <p className="text-ink font-semibold">No bank accounts saved</p>
            <p className="text-ink-soft text-sm">Add one to enable withdrawals</p>
            <button onClick={() => setAdding(true)} className="dash-btn dash-btn-ink mt-1 text-sm">
              Add account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 border border-line">
                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink font-semibold text-sm">{a.accountName}</p>
                  <p className="text-ink-soft text-xs">{a.bankName} · {a.accountNumber.slice(0, 3)}*****{a.accountNumber.slice(-2)}</p>
                </div>
                <button onClick={() => handleRemove(a.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
