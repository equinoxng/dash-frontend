"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword, resetPassword } from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || pin.length !== 4) { setError("Enter your phone number and 4-digit PIN."); return; }
    setLoading(true);
    setError("");
    try {
      const { resetToken } = await forgotPassword(toApiPhone(phone), pin);
      setResetToken(resetToken);
      setStep(1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword(resetToken, newPassword);
      router.push("/signin?reset=true");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cream">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md dash-card p-8">
        {step === 0 ? (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Reset your password</h1>
            <p className="text-ink-soft text-sm mb-7">Enter your phone number and transaction PIN to continue.</p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone number</label>
                <div className="flex gap-2">
                  <span className="dash-input flex items-center gap-1 w-auto text-ink-soft whitespace-nowrap">🇳🇬 +234</span>
                  <input type="tel" placeholder="0801 234 5678" value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }} className="dash-input flex-1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Transaction PIN</label>
                <input type="password" inputMode="numeric" maxLength={4} placeholder="4-digit PIN" value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                  className="dash-input" />
              </div>

              {error && (
                <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading} className="dash-btn dash-btn-ink w-full mt-2">
                {loading ? "Verifying…" : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Set a new password</h1>
            <p className="text-ink-soft text-sm mb-7">Choose a new password for your account.</p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">New password</label>
                <input type="password" placeholder="At least 8 characters" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }} className="dash-input" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirm password</label>
                <input type="password" placeholder="Re-enter your new password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} className="dash-input" />
              </div>

              {error && (
                <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading} className="dash-btn dash-btn-ink w-full mt-2">
                {loading ? "Saving…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          Remembered your password?{" "}
          <Link href="/signin" className="font-semibold text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
