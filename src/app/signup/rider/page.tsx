"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerRider, VEHICLE_TYPES, uploadIdentityDocument, deleteIdentityDocument } from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";
import FileUploadField from "@/components/FileUploadField";

const steps = ["Personal info", "Vehicle & docs", "Bank details"];

function Field({
  label, type = "text", placeholder, value, onChange,
}: { label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="dash-input"
      />
    </div>
  );
}

export default function RiderSignup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "", password: "",
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
      await registerRider({
        phoneNumber: toApiPhone(form.phone),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        vehicleType: VEHICLE_TYPES[form.vehicleType] || form.vehicleType,
        vehiclePlateNumber: form.plateNumber,
        nin: form.nin,
        bankName: form.bankName,
        bankAccountNumber: form.accountNumber,
        bankAccountName: form.accountName,
      });
      router.push("/signup/success?type=rider");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={90} height={36} priority />
      </Link>

      <div className="w-full max-w-md dash-card p-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= step ? "bg-ink text-white" : "bg-accent-light text-ink-soft"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-ink" : "text-ink-soft"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-ink" : "bg-line"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Join as a rider</h1>
            <p className="text-ink-soft text-sm mb-6">Earn money delivering cash across the city.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" placeholder="Chukwuemeka" value={form.firstName} onChange={(v) => update("firstName", v)} />
                <Field label="Last name" placeholder="Eze" value={form.lastName} onChange={(v) => update("lastName", v)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone number</label>
                <div className="flex gap-2">
                  <span className="dash-input flex items-center gap-1 w-auto text-ink-soft whitespace-nowrap">🇳🇬 +234</span>
                  <input type="tel" placeholder="0801 234 5678" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    className="dash-input flex-1" />
                </div>
              </div>
              <Field label="Email address" type="email" placeholder="chukwu@email.com" value={form.email} onChange={(v) => update("email", v)} />
              <Field label="Password" type="password" placeholder="At least 8 characters" value={form.password} onChange={(v) => update("password", v)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Vehicle & documents</h1>
            <p className="text-ink-soft text-sm mb-6">We need this to verify and onboard you.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Vehicle type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Bicycle", icon: "🚲" },
                    { label: "Motorcycle", icon: "🏍️" },
                    { label: "Car", icon: "🚗" },
                  ].map((v) => (
                    <button
                      key={v.label}
                      onClick={() => update("vehicleType", v.label)}
                      className={`py-3 px-2 rounded-xl border-2 text-center transition-colors ${form.vehicleType === v.label ? "border-ink bg-accent-light" : "border-line hover:border-ink"}`}
                    >
                      <span className="block text-xl mb-1">{v.icon}</span>
                      <span className="text-xs font-medium text-ink">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Plate number" placeholder="ABC 123 XY" value={form.plateNumber} onChange={(v) => update("plateNumber", v)} />
              <Field label="NIN (National ID Number)" placeholder="12345678901" value={form.nin} onChange={(v) => update("nin", v)} />
              <FileUploadField
                label="Government ID"
                upload={(file, onProgress) => uploadIdentityDocument(toApiPhone(form.phone), file, onProgress)}
                onRemove={() => deleteIdentityDocument(toApiPhone(form.phone))}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">Bank details</h1>
            <p className="text-ink-soft text-sm mb-6">Where we'll send your weekly earnings.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bank name</label>
                <select value={form.bankName} onChange={(e) => update("bankName", e.target.value)} className="dash-input">
                  <option value="">Select bank</option>
                  {["Access Bank","GTBank","First Bank","UBA","Zenith Bank","Kuda","OPay","Moniepoint"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <Field label="Account number" placeholder="0123456789" value={form.accountNumber} onChange={(v) => update("accountNumber", v)} />
              <Field label="Account name" placeholder="Auto-filled after verification" value={form.accountName} onChange={(v) => update("accountName", v)} />

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
                Your application will be reviewed within 24 hours. We'll send a confirmation to your email once approved.
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2 mt-4">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} disabled={loading} className="flex-1 border border-line text-ink font-semibold py-3.5 rounded-xl hover:bg-accent-light transition-colors disabled:opacity-40">
              Back
            </button>
          )}
          <button
            onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}
            disabled={loading}
            className="dash-btn dash-btn-ink flex-1 !py-3.5"
          >
            {step === 2 ? (loading ? "Submitting…" : "Submit application") : "Continue"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-ink hover:underline">Sign in</Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        Looking to request cash?{" "}
        <Link href="/signup" className="underline hover:text-ink">Create a user account</Link>
      </p>
    </div>
  );
}
