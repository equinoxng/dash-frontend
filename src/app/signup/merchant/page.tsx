"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerMerchant, BUSINESS_CATEGORIES } from "@/lib/auth";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

export default function MerchantSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "", ownerFirstName: "", ownerLastName: "", phone: "", email: "", password: "",
    address: "", businessType: "", cacNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await registerMerchant({
        phoneNumber: toApiPhone(form.phone),
        businessName: form.businessName,
        ownerFirstName: form.ownerFirstName,
        ownerLastName: form.ownerLastName,
        email: form.email,
        password: form.password,
        address: form.address,
        businessRegistrationNumber: form.cacNumber,
        businessCategory: BUSINESS_CATEGORIES[form.businessType] || form.businessType,
      });
      router.push("/signup/success?type=merchant");
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
        <h1 className="text-2xl font-extrabold text-ink mb-1">Register your business</h1>
        <p className="text-ink-soft text-sm mb-6">Become a Dash cash pickup point and earn extra revenue.</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "POS Agent", icon: "💳" },
                { label: "Microfinance", icon: "🏦" },
                { label: "Cash Agent", icon: "💵" },
                { label: "Other", icon: "🏪" },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => update("businessType", t.label)}
                  className={`py-3 px-3 rounded-xl border-2 text-left flex items-center gap-2 transition-colors ${form.businessType === t.label ? "border-ink bg-accent-light" : "border-line hover:border-ink"}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-medium text-ink">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business name</label>
            <input type="text" placeholder="Emeka POS Services" value={form.businessName} onChange={(e) => update("businessName", e.target.value)}
              className="dash-input" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Owner first name</label>
              <input type="text" placeholder="Emeka" value={form.ownerFirstName} onChange={(e) => update("ownerFirstName", e.target.value)}
                className="dash-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Owner last name</label>
              <input type="text" placeholder="Nwosu" value={form.ownerLastName} onChange={(e) => update("ownerLastName", e.target.value)}
                className="dash-input" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone number</label>
            <div className="flex gap-2">
              <span className="dash-input flex items-center gap-1 w-auto text-ink-soft whitespace-nowrap">🇳🇬 +234</span>
              <input type="tel" placeholder="0801 234 5678" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="dash-input flex-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business email</label>
            <input type="email" placeholder="emeka@business.com" value={form.email} onChange={(e) => update("email", e.target.value)}
              className="dash-input" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business address</label>
            <input type="text" placeholder="12 Adeola Odeku St, Victoria Island, Lagos" value={form.address} onChange={(e) => update("address", e.target.value)}
              className="dash-input" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">CAC number <span className="text-ink-soft font-normal">(optional)</span></label>
            <input type="text" placeholder="RC123456" value={form.cacNumber} onChange={(e) => update("cacNumber", e.target.value)}
              className="dash-input" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
            <input type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)}
              className="dash-input" />
          </div>
        </div>

        <div className="bg-cream border border-line rounded-xl p-4 mt-4 text-xs text-ink-soft">
          By registering, you agree to Dash's{" "}
          <Link href="#" className="underline text-ink">Merchant terms</Link> and{" "}
          <Link href="#" className="underline text-ink">Privacy policy</Link>.
        </div>

        {error && (
          <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2 mt-4">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading} className="dash-btn dash-btn-ink w-full mt-6">
          {loading ? "Submitting…" : "Submit application"}
        </button>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-ink hover:underline">Sign in</Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        Want to request cash?{" "}
        <Link href="/signup" className="underline hover:text-ink">Create a user account</Link>
        {" · "}
        <Link href="/signup/rider" className="underline hover:text-ink">Join as a rider</Link>
      </p>
    </div>
  );
}
