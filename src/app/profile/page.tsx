"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logout, getProfile, uploadProfilePhoto, deleteProfilePhoto, type UserProfile } from "@/lib/auth";
import { getSession, clearSession } from "@/lib/session";
import { ApiError } from "@/lib/api";

const MENU = [
  {
    section: "Account",
    items: [
      { label: "Edit profile", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, href: "/profile/edit" },
      { label: "Bank accounts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>, href: "/settings/bank" },
      { label: "Change PIN", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, href: "/profile/change-pin" },
      { label: "Change password", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, href: "/profile/change-password" },
    ],
  },
  {
    section: "Preferences",
    items: [
      { label: "Notifications", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>, href: "/settings/notifications" },
      { label: "Delivery address", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, href: "/settings/addresses" },
    ],
  },
  {
    section: "Support",
    items: [
      { label: "Help & FAQ", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, href: "#" },
      { label: "Contact support", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>, href: "#" },
      { label: "Terms & Privacy", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>, href: "#" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }
    getProfile(session.token).then(setProfile).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoSelect = (file: File) => {
    const session = getSession();
    if (!session) return;
    setPhotoError("");
    setPhotoLoading(true);
    const { promise } = uploadProfilePhoto(session.token, file, () => {});
    promise
      .then(setProfile)
      .catch((err) => setPhotoError(err instanceof ApiError ? err.message : "Could not upload photo. Please try again."))
      .finally(() => setPhotoLoading(false));
  };

  const handlePhotoRemove = () => {
    const session = getSession();
    if (!session) return;
    setPhotoError("");
    setPhotoLoading(true);
    deleteProfilePhoto(session.token)
      .then(setProfile)
      .catch((err) => setPhotoError(err instanceof ApiError ? err.message : "Could not remove photo. Please try again."))
      .finally(() => setPhotoLoading(false));
  };

  const handleLogout = async () => {
    const session = getSession();
    if (session) {
      try {
        await logout(session.token);
      } catch {
        // best-effort: still clear local session even if the request fails
      }
    }
    clearSession();
    router.push("/signin");
  };

  const initials = profile ? `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() : "";

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b-2 border-ink px-4 bg-cream">
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Image src="/logo.png" alt="Dash" width={72} height={28} />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="relative mb-3">
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={photoLoading}
              className="w-20 h-20 rounded-full bg-ink flex items-center justify-center text-white text-2xl font-extrabold overflow-hidden disabled:opacity-60"
              aria-label="Change profile photo"
            >
              {profile?.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initials || "—"
              )}
            </button>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={photoLoading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent border-2 border-cream flex items-center justify-center text-white disabled:opacity-60"
              aria-label="Change profile photo"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoSelect(file);
                e.target.value = "";
              }}
            />
          </div>

          {photoError && <p className="text-red-600 text-xs mb-2">{photoError}</p>}
          {profile?.profilePhotoUrl && !photoLoading && (
            <button onClick={handlePhotoRemove} className="text-xs text-ink-soft hover:text-red-500 mb-2 -mt-1">
              Remove photo
            </button>
          )}

          <h1 className="text-xl font-extrabold text-ink">{profile?.fullName || "Loading…"}</h1>
          <p className="text-ink-soft text-sm mt-0.5">{profile?.phoneNumber}</p>
          <p className="text-ink-soft text-sm">{profile?.email}</p>
          {profile && (profile.verified ? (
            <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-light text-accent">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              Verified account
            </span>
          ) : (
            <Link href="/profile/verify-identity"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold hover:underline bg-amber-50 text-amber-700">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Verify your identity
            </Link>
          ))}
        </div>

        {/* Menu sections */}
        {MENU.map((section) => (
          <div key={section.section}>
            <p className="dash-label mb-2 px-1">{section.section}</p>
            <div className="rounded-2xl overflow-hidden border border-line bg-white">
              {section.items.map((item, i) => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-cream transition-colors ${i > 0 ? "border-t border-line" : ""}`}>
                  <span className="text-ink-soft">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium text-ink">{item.label}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 10l4-3-4-3" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full font-semibold py-3.5 rounded-2xl text-sm transition-colors hover:bg-red-50 bg-white text-red-500 border border-red-200">
          Log out
        </button>

        <p className="text-center text-xs text-ink-soft pb-4">Dash by Equinox · v1.0.0</p>
      </div>
    </div>
  );
}
