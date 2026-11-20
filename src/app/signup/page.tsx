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
  login,
  registerUser,
  uploadIdentityDocument,
  type UploadedFile,
} from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { saveSession } from "@/lib/session";
import { ApiError } from "@/lib/api";

const STEPS = ["Account", "Identity", "PIN"];

const STEP_CONTENT = [
  {
    eyebrow: "Step 1 of 3",
    title: "Create your account.",
    subtitle: "Start with the details we’ll use to set up and secure your Dash account.",
  },
  {
    eyebrow: "Step 2 of 3",
    title: "Add your NIN.",
    subtitle: "We collect your National Identification Number and a photo of your ID for verification.",
  },
  {
    eyebrow: "Step 3 of 3",
    title: "Set your PIN.",
    subtitle: "Your 4-digit PIN authorises cash requests and sensitive account actions.",
  },
];

function StepProgress({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <div className="flex gap-1.5">
        {STEPS.map((_, index) => (
          <div
            key={STEPS[index]}
            className={`h-1 flex-1 rounded-full transition-colors ${index <= current ? "bg-violet" : "bg-line"}`}
          />
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

export default function UserSignup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    nin: "",
    pin: "",
  });
  const [identityDocument, setIdentityDocument] = useState<UploadedFile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleDetails = (event: React.FormEvent) => {
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

  const handleIdentity = (event: React.FormEvent) => {
    event.preventDefault();
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

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.pin.length !== 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }

    const phoneNumber = toApiPhone(form.phone);
    setLoading(true);
    setError("");

    try {
      await registerUser({
        phoneNumber,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        pin: form.pin,
        nin: form.nin,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const response = await login(phoneNumber, form.password);
      saveSession({
        token: response.token,
        accountType: response.accountType,
        accountId: response.accountId,
        fullName: response.fullName || `${form.firstName} ${form.lastName}`.trim(),
        phoneNumber,
        phoneVerified: response.phoneVerified,
      });
      router.push("/dashboard");
    } catch {
      router.push("/signin?registered=true");
    }
  };

  const meta = STEP_CONTENT[step];

  return (
    <AuthShell
      eyebrow={meta.eyebrow}
      title={meta.title}
      subtitle={meta.subtitle}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-violet hover:underline">
            Sign in
          </Link>
          <div className="mt-3 flex justify-center gap-4 text-[10px] font-semibold">
            <Link href="/signup/rider" className="text-ink-soft hover:text-ink">
              Join as a rider
            </Link>
            <Link href="/signup/merchant" className="text-ink-soft hover:text-ink">
              Register a business
            </Link>
          </div>
        </>
      }
    >
      <StepProgress current={step} />

      {error && (
        <Notice tone="error" className="mb-5">
          {error}
        </Notice>
      )}

      <form onSubmit={handleDetails} className={`space-y-4 ${step === 0 ? "" : "hidden"}`} aria-hidden={step !== 0}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="signup-first-name">First name</label>
            <input
              id="signup-first-name"
              type="text"
              autoComplete="given-name"
              placeholder="Ada"
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="signup-last-name">Last name</label>
            <input
              id="signup-last-name"
              type="text"
              autoComplete="family-name"
              placeholder="Okafor"
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              className="field"
            />
          </div>
        </div>

        <PhoneField
          id="signup-phone"
          value={form.phone}
          onChange={(value) => update("phone", value)}
        />

        <div>
          <label className="field-label" htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="ada@email.com"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="signup-password">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <button type="submit" className="btn btn-primary btn-block mt-2">
          Continue
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      <form onSubmit={handleIdentity} className={`space-y-4 ${step === 1 ? "" : "hidden"}`} aria-hidden={step !== 1}>
        <div>
          <label className="field-label" htmlFor="signup-nin">National Identification Number</label>
          <input
            id="signup-nin"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="12345678901"
            value={form.nin}
            onChange={(event) => update("nin", event.target.value.replace(/\D/g, "").slice(0, 11))}
            className="field num"
          />
          <p className="field-hint mt-1.5">Exactly 11 digits. We’ll never share your NIN.</p>
        </div>

        <FileUploadField
          label="NIN slip or government ID"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          upload={(file, onProgress) => uploadIdentityDocument(toApiPhone(form.phone), file, onProgress)}
          onRemove={() => deleteIdentityDocument(toApiPhone(form.phone))}
          onUploaded={setIdentityDocument}
        />

        {identityDocument && (
          <Notice tone="success">Document saved securely. We’ve attached it to your verification record.</Notice>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setStep(0)} className="btn btn-outline flex-1">
            Back
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            Continue
          </button>
        </div>
      </form>

      <form onSubmit={handleCreate} className={`space-y-4 ${step === 2 ? "" : "hidden"}`} aria-hidden={step !== 2}>
        <div>
          <label className="field-label" htmlFor="signup-pin">Transaction PIN</label>
          <input
            id="signup-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000"
            maxLength={4}
            value={form.pin}
            onChange={(event) => update("pin", event.target.value.replace(/\D/g, "").slice(0, 4))}
            className="field num text-center text-2xl tracking-[0.6em]"
          />
          <p className="field-hint mt-1.5">Choose 4 digits you’ll remember. You’ll use this to authorise requests.</p>
        </div>

        <Notice tone="info">
          Your phone number is verified at signup. No OTP or extra step is needed.
        </Notice>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setStep(1)} disabled={loading} className="btn btn-outline flex-1">
            Back
          </button>
          <button type="submit" disabled={loading || form.pin.length !== 4} className="btn btn-primary flex-[1.4]">
            {loading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
