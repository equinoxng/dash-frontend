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

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none bg-white text-[#0f0f0f] placeholder-slate-300";
  const borderStyle = { borderColor: "#e0d9d0" };

  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      <nav className="sticky top-0 z-40 border-b px-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "white", border: "1px solid #e0d9d0" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Bank accounts</h1>
          {!adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80"
              style={{ background: "#1e1240", color: "white" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="7" y1="2" x2="7" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Add account
            </button>
          )}
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-white rounded-2xl border p-5 space-y-4" style={borderStyle}>
            <h2 className="font-bold text-[#0f0f0f]">New bank account</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
              <select value={form.bankName} onChange={e => update("bankName", e.target.value)}
                className={inputClass} style={borderStyle}>
                <option value="">Select bank…</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account number</label>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" maxLength={10} placeholder="0123456789"
                  value={form.accountNumber}
                  onChange={e => { update("accountNumber", e.target.value.replace(/\D/g, "")); setForm(f => ({ ...f, accountName: "" })); }}
                  className={`${inputClass} flex-1`} style={borderStyle} />
                <button onClick={handleResolve} disabled={resolving || form.accountNumber.length < 10 || !form.bankName}
                  className="px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0"
                  style={{ background: "#1e1240", color: "white" }}>
                  {resolving ? "…" : "Verify"}
                </button>
              </div>
            </div>

            {form.accountName && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "#ede8fb" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-sm font-semibold" style={{ color: "#1e1240" }}>{form.accountName}</span>
              </div>
            )}

            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAdding(false); setForm({ bankName: "", accountNumber: "", accountName: "" }); setError(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: "#f5f0eb", color: "#334155" }}>
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!form.accountName}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 hover:opacity-90"
                style={{ background: "#1e1240" }}>
                Save account
              </button>
            </div>
          </div>
        )}

        {/* Account list */}
        {accounts.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#ede8fb" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="15"/><line x1="10" y1="13.5" x2="14" y2="13.5"/></svg>
            </div>
            <p className="text-[#0f0f0f] font-semibold">No bank accounts saved</p>
            <p className="text-slate-400 text-sm">Add one to enable withdrawals</p>
            <button onClick={() => setAdding(true)}
              className="mt-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#1e1240" }}>
              Add account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 border" style={borderStyle}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ede8fb" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f0f0f] font-semibold text-sm">{a.accountName}</p>
                  <p className="text-slate-400 text-xs">{a.bankName} · {a.accountNumber.slice(0, 3)}*****{a.accountNumber.slice(-2)}</p>
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
