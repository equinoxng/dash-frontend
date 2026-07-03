"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp } from "@/lib/auth";
import { savePendingSignup } from "@/lib/pendingSignup";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

export default function UserSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", pin: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (form.pin.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const phoneNumber = toApiPhone(form.phone);
      await requestOtp("user", phoneNumber);
      savePendingSignup({
        role: "user",
        phoneNumber,
        payload: { fullName: form.fullName, email: form.email, password: form.password, pin: form.pin },
      });
      router.push(`/verify?role=user&phone=${encodeURIComponent("+234 " + form.phone)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-white";
  const borderStyle = { borderColor: "#e0d9d0" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#e0d9d0" }}>
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all"
              style={{ background: step >= s ? "#1e1240" : "#e0d9d0" }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold text-[#0f0f0f] mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm mb-6">Get cash delivered in minutes.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <input type="text" placeholder="Ada Okafor" value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl text-sm text-slate-500 whitespace-nowrap border" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
                    🇳🇬 +234
                  </span>
                  <input type="tel" placeholder="0801 234 5678" value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none transition bg-white" style={borderStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input type="email" placeholder="ada@email.com" value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={`${inputClass} pr-11`} style={borderStyle} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)}
              className="mt-6 w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold text-[#0f0f0f] mb-1">Set your transaction PIN</h1>
            <p className="text-slate-500 text-sm mb-6">Used to authorise every cash request.</p>

            <div className="flex gap-3 justify-center mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all"
                  style={{
                    borderColor: form.pin.length > i ? "#1e1240" : "#e0d9d0",
                    background: form.pin.length > i ? "#1e1240" : "#f5f0eb",
                    color: form.pin.length > i ? "white" : "transparent",
                  }}>
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
                  className={`h-14 rounded-xl font-semibold text-lg transition-colors text-[#0f0f0f] ${k === "" ? "invisible" : "hover:opacity-80 active:scale-95"}`}
                  style={{ background: k === "" ? "transparent" : "#f5f0eb" }}>
                  {k}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <button onClick={handleCreate} disabled={form.pin.length < 4 || loading}
              className="w-full font-bold py-3.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "#1e1240" }}>
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
            <button onClick={() => setStep(1)} className="mt-3 w-full text-sm text-slate-400 hover:text-slate-600 transition-colors">
              ← Back
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold hover:underline" style={{ color: "#1e1240" }}>Sign in</Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center">
        Are you a rider?{" "}
        <Link href="/signup/rider" className="underline hover:text-slate-600">Apply here</Link>
        {" · "}
        <Link href="/signup/merchant" className="underline hover:text-slate-600">Register a business</Link>
      </p>
    </div>
  );
}
