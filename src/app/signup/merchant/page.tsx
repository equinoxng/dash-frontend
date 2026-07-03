"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, BUSINESS_CATEGORIES } from "@/lib/auth";
import { savePendingSignup } from "@/lib/pendingSignup";
import { toApiPhone } from "@/lib/phone";
import { ApiError } from "@/lib/api";

export default function MerchantSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "", ownerName: "", phone: "", email: "", password: "",
    address: "", businessType: "", cacNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const phoneNumber = toApiPhone(form.phone);
      await requestOtp("merchant", phoneNumber);
      savePendingSignup({
        role: "merchant",
        phoneNumber,
        payload: {
          businessName: form.businessName,
          ownerName: form.ownerName,
          email: form.email,
          password: form.password,
          address: form.address,
          businessRegistrationNumber: form.cacNumber,
          businessCategory: BUSINESS_CATEGORIES[form.businessType] || form.businessType,
        },
      });
      router.push(`/verify?role=merchant&phone=${encodeURIComponent("+234 " + form.phone)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={90} height={36} priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Register your business</h1>
        <p className="text-slate-500 text-sm mb-6">Become a Dash cash pickup point and earn extra revenue.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business type</label>
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
                  className={`py-3 px-3 rounded-xl border-2 text-left flex items-center gap-2 transition-colors ${form.businessType === t.label ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business name</label>
            <input type="text" placeholder="Emeka POS Services" value={form.businessName} onChange={(e) => update("businessName", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner / contact name</label>
            <input type="text" placeholder="Emeka Nwosu" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 whitespace-nowrap">🇳🇬 +234</span>
              <input type="tel" placeholder="0801 234 5678" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business email</label>
            <input type="email" placeholder="emeka@business.com" value={form.email} onChange={(e) => update("email", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business address</label>
            <input type="text" placeholder="12 Adeola Odeku St, Victoria Island, Lagos" value={form.address} onChange={(e) => update("address", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">CAC number <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="text" placeholder="RC123456" value={form.cacNumber} onChange={(e) => update("cacNumber", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4 text-xs text-slate-500">
          By registering, you agree to Dash's{" "}
          <Link href="#" className="underline text-slate-700">Merchant terms</Link> and{" "}
          <Link href="#" className="underline text-slate-700">Privacy policy</Link>.
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="mt-6 w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Submitting…" : "Submit application"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Want to request cash?{" "}
        <Link href="/signup" className="underline hover:text-slate-600">Create a user account</Link>
        {" · "}
        <Link href="/signup/rider" className="underline hover:text-slate-600">Join as a rider</Link>
      </p>
    </div>
  );
}
