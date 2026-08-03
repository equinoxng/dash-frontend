"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const session = getSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session) router.push("/signin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!session) return;
    if (!currentPassword || newPassword.length < 8) {
      setError("Enter your current password and a new password of at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await changePassword(session.token, currentPassword, newPassword);
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
        <h1 className="text-2xl font-extrabold text-ink">Change password</h1>

        {success ? (
          <div className="bg-white rounded-2xl border border-line p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            </div>
            <p className="font-semibold text-ink">Password updated</p>
            <Link href="/profile" className="inline-block mt-2 text-sm font-semibold text-accent hover:underline">Back to profile</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-line p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Current password</label>
              <input type="password" value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }} className="dash-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">New password</label>
              <input type="password" placeholder="At least 8 characters" value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(""); }} className="dash-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirm new password</label>
              <input type="password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} className="dash-input" />
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading} className="dash-btn dash-btn-ink w-full">
              {loading ? "Saving…" : "Update password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
