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
        <h1 className="text-2xl font-extrabold text-ink">Change PIN</h1>

        {success ? (
          <div className="bg-white rounded-2xl border border-line p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            </div>
            <p className="font-semibold text-ink">PIN updated</p>
            <Link href="/profile" className="inline-block mt-2 text-sm font-semibold text-accent hover:underline">Back to profile</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-line p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Current PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={currentPin}
                onChange={(e) => { setCurrentPin(e.target.value.replace(/\D/g, "")); setError(""); }} className="dash-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">New PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} placeholder="4 digits" value={newPin}
                onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "")); setError(""); }} className="dash-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirm new PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={confirmPin}
                onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, "")); setError(""); }} className="dash-input" />
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading} className="dash-btn dash-btn-ink w-full">
              {loading ? "Saving…" : "Update PIN"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
