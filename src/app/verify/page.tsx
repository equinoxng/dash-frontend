"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestOtp, verifyOtp, type Role, type AccountType } from "@/lib/auth";
import { getSession, markPhoneVerified } from "@/lib/session";
import { ApiError } from "@/lib/api";

const ROLE_BY_ACCOUNT_TYPE: Record<AccountType, Role> = {
  USER: "user",
  RIDER: "rider",
  MERCHANT: "merchant",
};

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const session = getSession();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }
    requestOtp(ROLE_BY_ACCOUNT_TYPE[session.accountType], session.phoneNumber).catch((err) => {
      setError(err instanceof ApiError ? err.message : "Could not send verification code. Please try again.");
    });
    inputs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  if (!session) return null;

  const role = ROLE_BY_ACCOUNT_TYPE[session.accountType];

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError("");
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otp];
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setResendTimer(30);
    setCanResend(false);
    inputs.current[0]?.focus();
    try {
      await requestOtp(role, session.phoneNumber);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend code. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (otp.join("").length < 6) { setError("Enter the 6-digit code sent to your phone."); return; }

    setLoading(true);
    setError("");
    try {
      await verifyOtp(role, session.phoneNumber, otp.join(""));
      markPhoneVerified();
      router.push(from);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const filled = otp.join("").length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#e0d9d0" }}>
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#ede8fb" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-[#0f0f0f] mb-1">Verify your number</h1>
        <p className="text-slate-500 text-sm mb-6">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[#0f0f0f]">{session.phoneNumber}</span>.
          Enter it below.
        </p>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all"
              style={{
                borderColor: digit ? "#1e1240" : error ? "#ef4444" : "#e0d9d0",
                background: digit ? "#f5f0ff" : "white",
                color: "#0f0f0f",
              }}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-5">
          {otp.map((d, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: d ? "#1e1240" : "#e0d9d0" }} />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        <button onClick={handleVerify} disabled={filled < 6 || loading}
          className="w-full font-bold py-3.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "#1e1240" }}>
          {loading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Verifying…
            </>
          ) : "Verify"}
        </button>

        {/* Resend */}
        <div className="mt-5 text-center text-sm text-slate-500">
          Didn't receive a code?{" "}
          {canResend ? (
            <button onClick={handleResend} className="font-semibold hover:underline" style={{ color: "#5b3fc4" }}>
              Resend code
            </button>
          ) : (
            <span className="text-slate-400">Resend in <span className="font-semibold tabular-nums" style={{ color: "#1e1240" }}>{resendTimer}s</span></span>
          )}
        </div>
      </div>

      <button onClick={() => router.push(from)} className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition-colors">
        Skip for now
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
