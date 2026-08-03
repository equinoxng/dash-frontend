"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/lib/auth";
import { getSession, saveSession } from "@/lib/session";
import { ApiError } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    houseNumber: "", street: "", city: "", state: "", dateOfBirth: "",
  });
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }
    getProfile(session.token)
      .then((profile) => {
        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          houseNumber: profile.houseNumber || "",
          street: profile.street || "",
          city: profile.city || "",
          state: profile.state || "",
          dateOfBirth: profile.dateOfBirth || "",
        });
      })
      .catch(() => setError("Could not load your profile. Please try again."))
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    const session = getSession();
    if (!session) return;
    if (!form.firstName || !form.lastName || !form.email) {
      setError("First name, last name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updated = await updateProfile(session.token, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        houseNumber: form.houseNumber,
        street: form.street,
        city: form.city,
        state: form.state,
        dateOfBirth: form.dateOfBirth || null,
      });
      saveSession({ ...session, fullName: updated.fullName });
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-40 border-b-2 border-ink px-4 bg-cream">
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-extrabold text-ink">Edit profile</h1>

        {fetching ? (
          <p className="text-ink-soft text-sm">Loading…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-line p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">First name</label>
                <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="dash-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Last name</label>
                <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="dash-input" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email address</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="dash-input" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date of birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="dash-input" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">House number</label>
              <input type="text" value={form.houseNumber} onChange={(e) => update("houseNumber", e.target.value)} className="dash-input" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Street</label>
              <input type="text" value={form.street} onChange={(e) => update("street", e.target.value)} className="dash-input" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">City</label>
                <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className="dash-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">State</label>
                <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className="dash-input" />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-danger-light border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading} className="dash-btn dash-btn-ink w-full">
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
