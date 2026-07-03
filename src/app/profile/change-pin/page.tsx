"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { changePin } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";

export default function ChangePinPage() {
  const router = useRouter();
  const session = getSession();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session) router.push("/signin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none bg-white text-[#0f0f0f] placeholder-slate-300";
  const borderStyle = { borderColor: "#e0d9d0" };

  const handleSubmit = async () => {
    if (!session) return;
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
      setError("Enter your current 4-digit PIN and a new 4-digit PIN.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PINs do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await changePin(session.token, currentPin, newPin);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

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
        <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Change PIN</h1>

        {success ? (
          <div className="bg-white rounded-2xl border p-6 text-center space-y-2" style={borderStyle}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "#d1fae5" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            </div>
            <p className="font-semibold text-[#0f0f0f]">PIN updated</p>
            <Link href="/profile" className="inline-block mt-2 text-sm font-semibold hover:underline" style={{ color: "#1e1240" }}>Back to profile</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-5 space-y-4" style={borderStyle}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={currentPin}
                onChange={(e) => { setCurrentPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                className={inputClass} style={borderStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} placeholder="4 digits" value={newPin}
                onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                className={inputClass} style={borderStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm new PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={confirmPin}
                onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                className={inputClass} style={borderStyle} />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              {loading ? "Saving…" : "Update PIN"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
