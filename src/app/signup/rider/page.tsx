"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, VEHICLE_TYPES } from "@/lib/auth";
import { savePendingSignup } from "@/lib/pendingSignup";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

const steps = ["Personal info", "Vehicle & docs", "Bank details"];

export default function RiderSignup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", password: "",
    vehicleType: "", plateNumber: "", nin: "",
    bankName: "", accountNumber: "", accountName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const phoneNumber = toApiPhone(form.phone);
      await requestOtp("rider", phoneNumber);
      savePendingSignup({
        role: "rider",
        phoneNumber,
        payload: {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          vehicleType: VEHICLE_TYPES[form.vehicleType] || form.vehicleType,
          vehiclePlateNumber: form.plateNumber,
          nin: form.nin,
          bankName: form.bankName,
          bankAccountNumber: form.accountNumber,
          bankAccountName: form.accountName,
        },
      });
      router.push(`/verify?role=rider&phone=${encodeURIComponent("+234 " + form.phone)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name as keyof typeof form]}
        onChange={(e) => update(name, e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={90} height={36} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-slate-900" : "bg-slate-100"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Join as a rider</h1>
            <p className="text-slate-500 text-sm mb-6">Earn money delivering cash across the city.</p>
            <div className="space-y-4">
              <Field label="Full name" name="fullName" placeholder="Chukwuemeka Eze" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 whitespace-nowrap">🇳🇬 +234</span>
                  <input type="tel" placeholder="0801 234 5678" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
                </div>
              </div>
              <Field label="Email address" name="email" type="email" placeholder="chukwu@email.com" />
              <Field label="Password" name="password" type="password" placeholder="At least 8 characters" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Vehicle & documents</h1>
            <p className="text-slate-500 text-sm mb-6">We need this to verify and onboard you.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Bicycle", icon: "🚲" },
                    { label: "Motorcycle", icon: "🏍️" },
                    { label: "Car", icon: "🚗" },
                  ].map((v) => (
                    <button
                      key={v.label}
                      onClick={() => update("vehicleType", v.label)}
                      className={`py-3 px-2 rounded-xl border-2 text-center transition-colors ${form.vehicleType === v.label ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <span className="block text-xl mb-1">{v.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Plate number" name="plateNumber" placeholder="ABC 123 XY" />
              <Field label="NIN (National ID Number)" name="nin" placeholder="12345678901" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Government ID</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 text-slate-400"><path d="M12 16V8m0 0l-3 3m3-3l3 3M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-xs text-slate-500">Upload NIN slip or passport</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" />
                </label>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Bank details</h1>
            <p className="text-slate-500 text-sm mb-6">Where we'll send your weekly earnings.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank name</label>
                <select value={form.bankName} onChange={(e) => update("bankName", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white">
                  <option value="">Select bank</option>
                  {["Access Bank","GTBank","First Bank","UBA","Zenith Bank","Kuda","OPay","Moniepoint"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <Field label="Account number" name="accountNumber" placeholder="0123456789" />
              <Field label="Account name" name="accountName" placeholder="Auto-filled after verification" />

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
                Your application will be reviewed within 24 hours. We'll send a confirmation to your email once approved.
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} disabled={loading} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40">
              Back
            </button>
          )}
          <button
            onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}
            disabled={loading}
            className="flex-1 bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {step === 2 ? (loading ? "Submitting…" : "Submit application") : "Continue"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Looking to request cash?{" "}
        <Link href="/signup" className="underline hover:text-slate-600">Create a user account</Link>
      </p>
    </div>
  );
}
