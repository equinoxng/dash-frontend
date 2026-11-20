"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PhoneField from "@/components/auth/PhoneField";
import Notice from "@/components/dash/Notice";
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

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phone || pin.length !== 4) {
      setError("Enter your phone number and 4-digit PIN.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await forgotPassword(toApiPhone(phone), pin);
      setResetToken(result.resetToken);
      setStep(1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
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
    <AuthShell
      eyebrow={step === 0 ? "Account recovery" : "Almost done"}
      title={step === 0 ? "Reset your password." : "Set a new password."}
      subtitle={
        step === 0
          ? "Enter your phone number and transaction PIN to continue."
          : "Choose a new password for your Dash account."
      }
      footer={
        <>
          Remembered your password?{" "}
          <Link href="/signin" className="font-semibold text-violet hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error && <Notice tone="error" className="mb-5">{error}</Notice>}

      {step === 0 ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <PhoneField
            id="forgot-phone"
            value={phone}
            onChange={(value) => { setPhone(value); setError(""); }}
          />

          <div>
            <label className="field-label" htmlFor="forgot-pin">Transaction PIN</label>
            <input
              id="forgot-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="4-digit PIN"
              value={pin}
              onChange={(event) => { setPin(event.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
              className="field num"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block mt-2">
            {loading ? "Verifying…" : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(event) => { setNewPassword(event.target.value); setError(""); }}
              className="field"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="reset-confirm">Confirm password</label>
            <input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value); setError(""); }}
              className="field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block mt-2">
            {loading ? "Saving…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
