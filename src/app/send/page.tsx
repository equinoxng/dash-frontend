"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatNaira, SEND_FLOW_AVAILABLE } from "@/lib/requests";
import { getSession } from "@/lib/session";
import { listContacts, type Contact } from "@/lib/contacts";
import { getWallet } from "@/lib/wallet";
import VerifyPhoneBanner from "@/components/VerifyPhoneBanner";

type Stage = "recipient" | "address" | "amount" | "confirm";

const DELIVERY_FEE = 500;
const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000];

const initialsFor = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const STEP_LABELS = ["Recipient", "Address", "Amount", "Confirm"];

function StepHeader({
  step, total, title, subtitle, onBack,
}: { step: number; total: number; title: string; subtitle: string; onBack: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f5f0eb" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-[#0f0f0f] leading-tight">{title}</h1>
          <p className="text-slate-400 text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < step ? "#1e1240" : "#e0d9d0" }} />
        ))}
      </div>
    </>
  );
}

export default function SendCash() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("recipient");

  // Recipient
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientError, setRecipientError] = useState("");

  // Address
  const [addressLine, setAddressLine] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressError, setAddressError] = useState("");

  // Amount
  const [selectedAmt, setSelectedAmt] = useState(20000);
  const [customAmt, setCustomAmt] = useState("");
  const [amountError, setAmountError] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    listContacts(session.token).then(setContacts).catch(() => {});
    getWallet(session.token).then((w) => setBalance(w.balance)).catch(() => {});
  }, []);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;
  const total = finalAmt + DELIVERY_FEE;

  const handleRecipientNext = () => {
    if (!recipientName.trim() || !recipientPhone.trim()) {
      setRecipientError("Please enter the recipient's name and phone number.");
      return;
    }
    setRecipientError("");
    setStage("address");
  };

  const handleAddressNext = () => {
    if (!addressLine.trim() || !addressCity.trim()) {
      setAddressError("Please enter the street address and city.");
      return;
    }
    setAddressError("");
    setStage("amount");
  };

  const handleAmountNext = () => {
    if (finalAmt <= 0) { setAmountError("Enter a valid amount."); return; }
    if (balance !== null && total > balance) {
      setAmountError(`Insufficient balance. You need ${formatNaira(total)} but have ${formatNaira(balance)}.`);
      return;
    }
    setAmountError("");
    setStage("confirm");
  };

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-white text-[#0f0f0f] placeholder-slate-300";
  const borderStyle = { borderColor: "#e0d9d0" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md">
        <VerifyPhoneBanner />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={borderStyle}>

        {/* ── RECIPIENT ── */}
        {stage === "recipient" && (
          <>
            <StepHeader step={1} total={4} title="Send cash" subtitle="Step 1 of 4 · Recipient details"
              onBack={() => router.push("/dashboard")} />

            {/* Saved contacts */}
            {contacts.length > 0 && (
              <div className="mb-5">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Recent contacts</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {contacts.map((c) => (
                    <button key={c.phoneNumber} onClick={() => { setRecipientName(c.name); setRecipientPhone(c.phoneNumber.replace(/^\+234/, "0")); setRecipientError(""); }}
                      className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 transition-all"
                        style={{
                          background: recipientPhone === c.phoneNumber.replace(/^\+234/, "0") ? "#1e1240" : "#ede8fb",
                          color: recipientPhone === c.phoneNumber.replace(/^\+234/, "0") ? "white" : "#5b3fc4",
                          borderColor: recipientPhone === c.phoneNumber.replace(/^\+234/, "0") ? "#1e1240" : "transparent",
                        }}>
                        {initialsFor(c.name)}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{c.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient full name</label>
                <input type="text" placeholder="e.g. Emeka Obi" value={recipientName}
                  onChange={e => { setRecipientName(e.target.value); setRecipientError(""); }}
                  className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl text-sm text-slate-500 whitespace-nowrap border"
                    style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
                    🇳🇬 +234
                  </span>
                  <input type="tel" placeholder="0812 345 6789" value={recipientPhone}
                    onChange={e => { setRecipientPhone(e.target.value); setRecipientError(""); }}
                    className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-white text-[#0f0f0f] placeholder-slate-300" style={borderStyle} />
                </div>
              </div>
            </div>

            {recipientError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{recipientError}</p>
            )}

            <button onClick={handleRecipientNext}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Continue →
            </button>
          </>
        )}

        {/* ── ADDRESS ── */}
        {stage === "address" && (
          <>
            <StepHeader step={2} total={4} title="Send cash" subtitle="Step 2 of 4 · Delivery address"
              onBack={() => setStage("recipient")} />

            {/* Recipient chip */}
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5" style={{ background: "#f5f0eb" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: "#1e1240" }}>
                {recipientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0f0f0f] truncate">{recipientName}</p>
                <p className="text-xs text-slate-400">+234 {recipientPhone}</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Where should cash be delivered?</p>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street address</label>
                <input type="text" placeholder="e.g. 14 Adeola Odeku St" value={addressLine}
                  onChange={e => { setAddressLine(e.target.value); setAddressError(""); }}
                  className={inputClass} style={borderStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City / Area</label>
                  <input type="text" placeholder="Victoria Island" value={addressCity}
                    onChange={e => { setAddressCity(e.target.value); setAddressError(""); }}
                    className={inputClass} style={borderStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Landmark <span className="text-slate-300">(optional)</span></label>
                  <input type="text" placeholder="Near Access Bank" value={addressLandmark}
                    onChange={e => setAddressLandmark(e.target.value)}
                    className={inputClass} style={borderStyle} />
                </div>
              </div>
            </div>

            {/* Estimated time */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5" style={{ background: "#f5f0eb" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <span className="text-sm text-slate-500">Estimated arrival <span className="font-semibold text-[#0f0f0f]">12–18 min</span></span>
            </div>

            {addressError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{addressError}</p>
            )}

            <button onClick={handleAddressNext}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Continue →
            </button>
          </>
        )}

        {/* ── AMOUNT ── */}
        {stage === "amount" && (
          <>
            <StepHeader step={3} total={4} title="Send cash" subtitle="Step 3 of 4 · How much?"
              onBack={() => setStage("address")} />

            {/* Recipient + address recap */}
            <div className="rounded-2xl px-4 py-3 mb-5 space-y-2" style={{ background: "#f5f0eb" }}>
              <div className="flex items-center gap-2 text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-slate-500">To</span>
                <span className="font-semibold text-[#0f0f0f]">{recipientName}</span>
                <span className="text-slate-400 text-xs">+234 {recipientPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-slate-500 shrink-0">At</span>
                <span className="font-medium text-[#0f0f0f]">{addressLine}, {addressCity}{addressLandmark ? ` (${addressLandmark})` : ""}</span>
              </div>
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

            <div className="rounded-xl p-4 mb-5 space-y-2 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Cash amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="font-bold text-[#0f0f0f]">Total debited</span>
                <span className="font-bold text-[#0f0f0f]">{formatNaira(total)}</span>
              </div>
            </div>

            {amountError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{amountError}</p>
            )}

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
            <StepHeader step={4} total={4} title="Send cash" subtitle="Step 4 of 4 · Review & confirm"
              onBack={() => setStage("amount")} />

            {/* Amount hero */}
            <div className="rounded-2xl p-6 mb-4 text-center" style={{ background: "#f5f0eb" }}>
              <p className="text-slate-400 text-xs mb-1">You&apos;re sending</p>
              <p className="text-[#0f0f0f] font-extrabold text-4xl">{formatNaira(finalAmt)}</p>
            </div>

            {/* Recipient */}
            <div className="rounded-2xl p-4 mb-3" style={{ background: "#f5f0eb" }}>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Recipient</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: "#1e1240" }}>
                  {recipientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#0f0f0f]">{recipientName}</p>
                  <p className="text-slate-400 text-xs">+234 {recipientPhone}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl p-4 mb-3" style={{ background: "#f5f0eb" }}>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Delivery address</p>
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <p className="text-sm font-semibold text-[#0f0f0f]">{addressLine}</p>
                  <p className="text-xs text-slate-400">{addressCity}{addressLandmark ? ` · Near ${addressLandmark}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "#e0d9d0" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                <span className="text-xs text-slate-500">Estimated arrival <span className="font-semibold text-[#0f0f0f]">12–18 min</span></span>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="rounded-2xl p-4 mb-4 space-y-2 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Cash amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="font-bold text-[#0f0f0f]">Total debited</span>
                <span className="font-bold text-[#0f0f0f]">{formatNaira(total)}</span>
              </div>
            </div>

            {!SEND_FLOW_AVAILABLE && (
              <div className="flex items-start gap-2.5 mb-4 rounded-xl px-3 py-2.5" style={{ background: "#fdf6e3" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs" style={{ color: "#92400e" }}>Send is being rebuilt on Dash&apos;s new escrow engine. Dispatching isn&apos;t available yet — check back soon.</p>
              </div>
            )}

            {/* Escrow note */}
            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <p className="text-xs text-slate-400">Funds are held in escrow until the recipient confirms receipt with their PIN.</p>
            </div>

            <button disabled={!SEND_FLOW_AVAILABLE}
              className="w-full font-bold py-4 rounded-2xl text-white transition-opacity"
              style={{ background: "#1e1240", opacity: SEND_FLOW_AVAILABLE ? 1 : 0.5, cursor: SEND_FLOW_AVAILABLE ? "pointer" : "not-allowed" }}>
              Confirm & dispatch vendor
            </button>
          </>
        )}
      </div>
    </div>
  );
}
