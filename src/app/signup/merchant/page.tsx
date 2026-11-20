"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PhoneField from "@/components/auth/PhoneField";
import Notice from "@/components/dash/Notice";
import { BUSINESS_CATEGORIES, registerMerchant } from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

const BUSINESS_TYPES = [
  { label: "POS Agent", icon: "💳" },
  { label: "Microfinance", icon: "🏦" },
  { label: "Cash Agent", icon: "💵" },
  { label: "Other", icon: "🏪" },
];

export default function MerchantSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    ownerFirstName: "",
    ownerLastName: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    businessType: "",
    cacNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.businessType) {
      setError("Choose a business type.");
      return;
    }
    if (!form.businessName.trim() || !form.ownerFirstName.trim() || !form.ownerLastName.trim()) {
      setError("Enter your business name and the owner’s name.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid Nigerian phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid business email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerMerchant({
        phoneNumber: toApiPhone(form.phone),
        businessName: form.businessName.trim(),
        ownerFirstName: form.ownerFirstName.trim(),
        ownerLastName: form.ownerLastName.trim(),
        email: form.email.trim(),
        password: form.password,
        address: form.address.trim(),
        businessRegistrationNumber: form.cacNumber.trim(),
        businessCategory: BUSINESS_CATEGORIES[form.businessType] || form.businessType,
      });
      router.push("/signup/success?type=merchant");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Become a cash point"
      title="Register your business."
      subtitle="Serve Dash cash requests from your location and earn on every handoff."
      wide
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-violet hover:underline">Sign in</Link>
          <div className="mt-3 flex justify-center gap-4 text-[10px] font-semibold">
            <Link href="/signup" className="text-ink-soft hover:text-ink">Create a user account</Link>
            <Link href="/signup/rider" className="text-ink-soft hover:text-ink">Join as a rider</Link>
          </div>
        </>
      }
    >
      {error && <Notice tone="error" className="mb-5">{error}</Notice>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="field-label">Business type</span>
          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type.label}
                type="button"
                onClick={() => update("businessType", type.label)}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-[11.5px] font-semibold transition-colors ${
                  form.businessType === type.label
                    ? "border-violet bg-violet-soft text-violet-deep"
                    : "border-line-strong bg-white text-ink-soft hover:border-ink"
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="merchant-business-name">Business name</label>
          <input
            id="merchant-business-name"
            type="text"
            placeholder="Emeka POS Services"
            value={form.businessName}
            onChange={(event) => update("businessName", event.target.value)}
            className="field"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="merchant-owner-first">Owner first name</label>
            <input
              id="merchant-owner-first"
              type="text"
              autoComplete="given-name"
              placeholder="Emeka"
              value={form.ownerFirstName}
              onChange={(event) => update("ownerFirstName", event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="merchant-owner-last">Owner last name</label>
            <input
              id="merchant-owner-last"
              type="text"
              autoComplete="family-name"
              placeholder="Nwosu"
              value={form.ownerLastName}
              onChange={(event) => update("ownerLastName", event.target.value)}
              className="field"
            />
          </div>
        </div>

        <PhoneField
          id="merchant-phone"
          value={form.phone}
          onChange={(value) => update("phone", value)}
        />

        <div>
          <label className="field-label" htmlFor="merchant-email">Business email</label>
          <input
            id="merchant-email"
            type="email"
            autoComplete="email"
            placeholder="emeka@business.com"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="merchant-address">Business address</label>
          <input
            id="merchant-address"
            type="text"
            autoComplete="street-address"
            placeholder="12 Adeola Odeku St, Victoria Island, Lagos"
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="merchant-cac">
            CAC number <span className="normal-case tracking-normal text-ink-soft/70">(optional)</span>
          </label>
          <input
            id="merchant-cac"
            type="text"
            placeholder="RC123456"
            value={form.cacNumber}
            onChange={(event) => update("cacNumber", event.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="merchant-password">Password</label>
          <input
            id="merchant-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            className="field"
          />
        </div>

        <Notice tone="info">
          By registering, you agree to Dash’s merchant terms and privacy policy.
        </Notice>

        <button type="submit" disabled={loading} className="btn btn-primary btn-block mt-2">
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
      </form>
    </AuthShell>
  );
}
