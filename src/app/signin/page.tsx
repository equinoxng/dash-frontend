"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PhoneField from "@/components/auth/PhoneField";
import Notice from "@/components/dash/Notice";
import { login } from "@/lib/auth";
import { saveSession } from "@/lib/session";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

function destinationFor(accountType: string) {
  if (accountType === "RIDER") return "/rider";
  if (accountType === "MERCHANT") return "/";
  return "/dashboard";
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const justReset = searchParams.get("reset") === "true";
  const requestedNext = searchParams.get("next");
  const nextPath =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "";

  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.phone || !form.password) {
      setError("Enter your phone number and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const phoneNumber = toApiPhone(form.phone);
      const response = await login(phoneNumber, form.password);
      saveSession({
        token: response.token,
        accountType: response.accountType,
        accountId: response.accountId,
        fullName: response.fullName,
        phoneNumber,
        phoneVerified: response.phoneVerified,
      });
      router.push(nextPath || destinationFor(response.accountType));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Dash."
      subtitle="Pick up where you left off and keep your cash moving."
      footer={
        <>
          New to Dash?{" "}
          <Link href="/signup" className="font-semibold text-violet hover:underline">
            Create an account
          </Link>
          <div className="mt-3 flex justify-center gap-4 text-[10px] font-semibold">
            <Link href="/signup/rider" className="text-ink-soft hover:text-ink">Join as a rider</Link>
            <Link href="/signup/merchant" className="text-ink-soft hover:text-ink">Register a business</Link>
          </div>
        </>
      }
    >
      {justRegistered && (
        <Notice tone="success" className="mb-5">
          Account created. Sign in to continue.
        </Notice>
      )}
      {justReset && (
        <Notice tone="success" className="mb-5">
          Password updated. Sign in with your new password.
        </Notice>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PhoneField
          id="signin-phone"
          value={form.phone}
          onChange={(value) => update("phone", value)}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="field-label !mb-0" htmlFor="signin-password">Password</label>
            <Link href="/forgot-password" className="text-[10.5px] font-semibold text-violet hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              className="field pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink"
            >
              {showPassword ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <button type="submit" disabled={loading} className="btn btn-primary btn-block mt-2">
          {loading ? (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
