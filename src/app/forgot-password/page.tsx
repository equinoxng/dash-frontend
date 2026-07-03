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

  const borderStyle = { borderColor: "#e0d9d0" };
  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-white";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={borderStyle}>
        {step === 0 ? (
          <>
            <h1 className="text-2xl font-extrabold text-[#0f0f0f] mb-1">Reset your password</h1>
            <p className="text-slate-500 text-sm mb-7">Enter your phone number and transaction PIN to continue.</p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl text-sm text-slate-500 whitespace-nowrap border"
                    style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
                    🇳🇬 +234
                  </span>
                  <input type="tel" placeholder="0801 234 5678" value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-white" style={borderStyle} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction PIN</label>
                <input type="password" inputMode="numeric" maxLength={4} placeholder="4-digit PIN" value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                  className={inputClass} style={borderStyle} />
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full font-bold py-3.5 rounded-xl text-white mt-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#1e1240" }}>
                {loading ? "Verifying…" : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-[#0f0f0f] mb-1">Set a new password</h1>
            <p className="text-slate-500 text-sm mb-7">Choose a new password for your account.</p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
                <input type="password" placeholder="At least 8 characters" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  className={inputClass} style={borderStyle} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                <input type="password" placeholder="Re-enter your new password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className={inputClass} style={borderStyle} />
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full font-bold py-3.5 rounded-xl text-white mt-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#1e1240" }}>
                {loading ? "Saving…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link href="/signin" className="font-semibold hover:underline" style={{ color: "#1e1240" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
