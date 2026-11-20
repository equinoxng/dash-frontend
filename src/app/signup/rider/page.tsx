"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PhoneField from "@/components/auth/PhoneField";
import FileUploadField from "@/components/FileUploadField";
import Notice from "@/components/dash/Notice";
import {
  deleteIdentityDocument,
  registerRider,
  uploadIdentityDocument,
  VEHICLE_TYPES,
  type UploadedFile,
} from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

const STEPS = ["Personal", "Vehicle & ID", "Bank"];

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  inputMode,
  maxLength,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  maxLength?: number;
}) {
  const id = `rider-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </div>
  );
}

function StepProgress({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <div className="flex gap-1.5">
        {STEPS.map((_, index) => (
          <div key={STEPS[index]} className={`h-1 flex-1 rounded-full ${index <= current ? "bg-violet" : "bg-line"}`} />
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-[9px] font-bold uppercase tracking-[0.12em]">
        {STEPS.map((step, index) => (
          <span key={step} className={index === current ? "text-violet-deep" : "text-ink-soft/60"}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RiderSignup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    vehicleType: "",
    plateNumber: "",
    nin: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [identityDocument, setIdentityDocument] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handlePersonal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Enter your first name, last name and email address.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid Nigerian phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setStep(1);
  };

  const handleDocuments = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.vehicleType) {
      setError("Choose your vehicle type.");
      return;
    }
    if (!form.plateNumber.trim()) {
      setError("Enter your vehicle plate number.");
      return;
    }
    if (form.nin.length !== 11) {
      setError("NIN must be exactly 11 digits.");
      return;
    }
    if (!identityDocument) {
      setError("Upload your NIN slip or government ID to continue.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerRider({
        phoneNumber: toApiPhone(form.phone),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        vehicleType: VEHICLE_TYPES[form.vehicleType] || form.vehicleType,
        vehiclePlateNumber: form.plateNumber.trim(),
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

  const meta = [
    {
      eyebrow: "Join the network",
      title: "Ride with Dash.",
      subtitle: "Move cash across Lagos and earn on every completed delivery.",
    },
    {
      eyebrow: "Verification",
      title: "Your details.",
      subtitle: "We need your vehicle details and identity documents to onboard you.",
    },
    {
      eyebrow: "Payouts",
      title: "Where to pay you.",
      subtitle: "Add the account where you’d like to receive your weekly earnings.",
    },
  ][step];

  return (
    <AuthShell
      eyebrow={meta.eyebrow}
      title={meta.title}
      subtitle={meta.subtitle}
      wide
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-violet hover:underline">Sign in</Link>
          <div className="mt-3 flex justify-center gap-4 text-[10px] font-semibold">
            <Link href="/signup" className="text-ink-soft hover:text-ink">Send cash instead</Link>
            <Link href="/signup/merchant" className="text-ink-soft hover:text-ink">Register a business</Link>
          </div>
        </>
      }
    >
      <StepProgress current={step} />

      {error && (
        <Notice tone="error" className="mb-5">{error}</Notice>
      )}

      <form onSubmit={handlePersonal} className={`space-y-4 ${step === 0 ? "" : "hidden"}`} aria-hidden={step !== 0}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" placeholder="Chukwuemeka" autoComplete="given-name" value={form.firstName} onChange={(value) => update("firstName", value)} />
          <Field label="Last name" placeholder="Eze" autoComplete="family-name" value={form.lastName} onChange={(value) => update("lastName", value)} />
        </div>
        <PhoneField
          id="rider-phone"
          value={form.phone}
          onChange={(value) => update("phone", value)}
        />
        <Field label="Email address" type="email" placeholder="chukwu@email.com" autoComplete="email" value={form.email} onChange={(value) => update("email", value)} />
        <Field label="Password" type="password" placeholder="At least 8 characters" autoComplete="new-password" value={form.password} onChange={(value) => update("password", value)} />
        <button type="submit" className="btn btn-primary btn-block mt-2">Continue</button>
      </form>

      <form onSubmit={handleDocuments} className={`space-y-4 ${step === 1 ? "" : "hidden"}`} aria-hidden={step !== 1}>
        <div>
          <span className="field-label">Vehicle type</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Bicycle", icon: "🚲" },
              { label: "Motorcycle", icon: "🏍️" },
              { label: "Car", icon: "🚗" },
            ].map((vehicle) => (
              <button
                key={vehicle.label}
                type="button"
                onClick={() => update("vehicleType", vehicle.label)}
                className={`flex flex-col items-center rounded-2xl border px-2 py-3 text-[11px] font-semibold transition-colors ${
                  form.vehicleType === vehicle.label
                    ? "border-violet bg-violet-soft text-violet-deep"
                    : "border-line-strong bg-white text-ink-soft hover:border-ink"
                }`}
              >
                <span className="mb-1 text-xl">{vehicle.icon}</span>
                {vehicle.label}
              </button>
            ))}
          </div>
        </div>
        <Field label="Plate number" placeholder="ABC 123 XY" value={form.plateNumber} onChange={(value) => update("plateNumber", value)} />
        <Field label="NIN" placeholder="12345678901" inputMode="numeric" maxLength={11} value={form.nin} onChange={(value) => update("nin", value.replace(/\D/g, "").slice(0, 11))} />
        <FileUploadField
          label="NIN slip or government ID"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          upload={(file, onProgress) => uploadIdentityDocument(toApiPhone(form.phone), file, onProgress)}
          onRemove={() => deleteIdentityDocument(toApiPhone(form.phone))}
          onUploaded={setIdentityDocument}
        />
        {identityDocument && <Notice tone="success">Your ID has been uploaded securely.</Notice>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setStep(0)} className="btn btn-outline flex-1">Back</button>
          <button type="submit" className="btn btn-primary flex-1">Continue</button>
        </div>
      </form>

      <form onSubmit={handleSubmit} className={`space-y-4 ${step === 2 ? "" : "hidden"}`} aria-hidden={step !== 2}>
        <div>
          <label className="field-label" htmlFor="rider-bank">Bank name</label>
          <select
            id="rider-bank"
            value={form.bankName}
            onChange={(event) => update("bankName", event.target.value)}
            className="field"
          >
            <option value="">Select bank</option>
            {["Access Bank", "GTBank", "First Bank", "UBA", "Zenith Bank", "Kuda", "OPay", "Moniepoint"].map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>
        <Field label="Account number" placeholder="0123456789" inputMode="numeric" maxLength={10} value={form.accountNumber} onChange={(value) => update("accountNumber", value.replace(/\D/g, "").slice(0, 10))} />
        <Field label="Account name" placeholder="Name on account" value={form.accountName} onChange={(value) => update("accountName", value)} />
        <Notice tone="info">We’ll review your application and reach out once your account is approved.</Notice>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setStep(1)} disabled={loading} className="btn btn-outline flex-1">Back</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-[1.4]">
            {loading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
