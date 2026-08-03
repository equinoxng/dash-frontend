"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

export default function UserSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "", pin: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (form.pin.length < 4) return;
    setLoading(true);
    setError("");
    try {
      await registerUser({
        phoneNumber: toApiPhone(form.phone),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        pin: form.pin,
      });
      router.push("/signin?registered=true");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cream">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md dash-card p-8">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? "bg-ink" : "bg-line"}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Create your account</h1>
            <p className="text-ink-soft text-sm mb-6">Get cash delivered in minutes.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">First name</label>
                  <input type="text" placeholder="Ada" value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)} className="dash-input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Last name</label>
                  <input type="text" placeholder="Okafor" value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)} className="dash-input" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone number</label>
                <div className="flex gap-2">
                  <span className="dash-input flex items-center gap-1 w-auto text-ink-soft whitespace-nowrap">🇳🇬 +234</span>
                  <input type="tel" placeholder="0801 234 5678" value={form.phone}
                    onChange={(e) => update("phone", e.target.value)} className="dash-input flex-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email address</label>
                <input type="email" placeholder="ada@email.com" value={form.email}
                  onChange={(e) => update("email", e.target.value)} className="dash-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={form.password}
                    onChange={(e) => update("password", e.target.value)} className="dash-input pr-11" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="dash-btn dash-btn-ink w-full mt-6">
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Set your transaction PIN</h1>
            <p className="text-ink-soft text-sm mb-6">Used to authorise every cash request.</p>

            <div className="flex gap-3 justify-center mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`dash-otp-box w-14 h-14 flex items-center justify-center text-xl font-bold ${form.pin.length > i ? "filled" : ""}`}>
                  {form.pin[i] ? "•" : ""}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k) => (
                <button key={k} onClick={() => {
                  if (k === "⌫") update("pin", form.pin.slice(0, -1));
                  else if (k && form.pin.length < 4) update("pin", form.pin + k);
                }}
                  className={`h-14 rounded-xl font-semibold text-lg transition-colors text-ink bg-cream ${k === "" ? "invisible" : "hover:bg-accent-light active:scale-95"}`}>
                  {k}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <button onClick={handleCreate} disabled={form.pin.length < 4 || loading} className="dash-btn dash-btn-ink w-full">
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Creating account…
                </>
              ) : "Create account"}
            </button>
            <button onClick={() => setStep(1)} className="mt-3 w-full text-sm text-ink-soft hover:text-ink transition-colors">
              ← Back
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-accent hover:underline">Sign in</Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-ink-soft text-center">
        Are you a rider?{" "}
        <Link href="/signup/rider" className="underline hover:text-ink">Apply here</Link>
        {" · "}
        <Link href="/signup/merchant" className="underline hover:text-ink">Register a business</Link>
      </p>
    </div>
  );
}
