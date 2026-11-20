"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/dash/AppShell";
import Sheet from "@/components/dash/Sheet";
import Notice from "@/components/dash/Notice";
import LegalDisclaimer from "@/components/dash/LegalDisclaimer";
import { useDash } from "@/lib/dash/useDash";
import { resetDemo, updateCustomer } from "@/lib/dash/store";
import { clearSession } from "@/lib/session";
import { formatNgPhone, initials, toNgPhone } from "@/lib/dash/format";

const MENU = [
  {
    label: "Add funds",
    description: "Top up your Dash wallet",
    href: "/fund",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    label: "Saved recipients",
    description: "People you send cash to",
    href: "/account/recipients",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </svg>
    ),
  },
  {
    label: "Transaction history",
    description: "Every cash request and receipt",
    href: "/account/history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    label: "Help & support",
    description: "FAQs, contact and delivery help",
    href: "/account/help",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 17.5h.01" />
      </svg>
    ),
  },
  {
    label: "Dispute resolution",
    description: "Report a problem with a delivery",
    href: "/account/disputes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M12 8v4M12 15.5h.01" />
      </svg>
    ),
  },
];

export default function AccountPage() {
  const router = useRouter();
  const state = useDash();
  const customer = state?.customer;
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [form, setForm] = useState({ name: customer?.name ?? "", phone: customer ? formatNgPhone(customer.phone) : "", email: customer?.email ?? "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const recipients = state?.recipients.length ?? 0;
  const transactions = state?.transactions.length ?? 0;
  const openDisputes = state?.disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW").length ?? 0;

  const openEdit = () => {
    if (!customer) return;
    setForm({ name: customer.name, phone: formatNgPhone(customer.phone), email: customer.email });
    setError("");
    setSaved(false);
    setEditOpen(true);
  };

  const saveProfile = () => {
    const phone = toNgPhone(form.phone);
    if (form.name.trim().length < 2) return setError("Enter your name.");
    if (!phone) return setError("Enter a valid Nigerian phone number.");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    updateCustomer({ name: form.name.trim(), phone, email: form.email.trim() });
    setSaved(true);
    setError("");
    setTimeout(() => setEditOpen(false), 650);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/signin");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-7">
        <p className="eyebrow">Account</p>
        <h1 className="display mt-1 text-[40px] text-ink">Your Dash.</h1>
        <p className="mt-2 text-[13px] text-ink-soft">Profile, recipients, history and support — all in one place.</p>

        {/* Profile card */}
        <div className="mt-6 overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_24px_60px_-30px_rgba(27,19,48,0.55)]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[17px] font-bold">
              {customer ? initials(customer.name) : "—"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[16px] font-bold">{customer?.name ?? "Loading…"}</p>
                {customer?.verified && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-ink" title="Verified">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-white/50">{customer ? formatNgPhone(customer.phone) : ""}</p>
              <p className="truncate text-[10.5px] text-white/40">{customer?.email}</p>
            </div>
            <button type="button" onClick={openEdit} className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold text-white/80 hover:bg-white/10">
              Edit
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            {[
              [`${recipients}`, "Recipients"],
              [`${transactions}`, "Transactions"],
              [`${openDisputes}`, "Open cases"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="num text-[18px] font-bold leading-none">{value}</p>
                <p className="mt-1 text-[8.5px] uppercase tracking-[0.1em] text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 overflow-hidden rounded-[22px] border border-line bg-white">
          {MENU.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper ${index > 0 ? "border-t border-line" : ""}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-ink-soft">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-ink">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-ink-soft">{item.description}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-line-strong" aria-hidden>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mt-4 w-full rounded-2xl border border-line bg-white py-3.5 text-[12px] font-semibold text-danger transition-colors hover:border-danger/30 hover:bg-danger-soft"
        >
          Log out
        </button>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-white/50 px-4 py-3">
          <div>
            <p className="text-[10.5px] font-semibold text-ink">Demo data</p>
            <p className="mt-0.5 text-[9.5px] text-ink-soft">Reset transactions, recipients and riders.</p>
          </div>
          <button type="button" onClick={() => setResetOpen(true)} className="text-[10px] font-semibold text-violet hover:underline">
            Reset
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9.5px] text-ink-soft/70">
          <Link href="/rider" className="hover:text-ink">Rider app</Link>
          <Link href="/ops" className="hover:text-ink">Operations</Link>
          <span>Dash by Equinox · Prototype v1</span>
        </div>
        <LegalDisclaimer className="mx-auto mt-4 max-w-xl text-center" />
      </div>

      <Sheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        subtitle="Your phone number is used for delivery updates."
        footer={
          <button type="button" onClick={saveProfile} className="btn btn-primary btn-block">
            {saved ? "Saved" : "Save changes"}
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="field-label" htmlFor="profile-name">Full name</label>
            <input id="profile-name" className="field" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} />
          </div>
          <div>
            <label className="field-label" htmlFor="profile-phone">Phone number</label>
            <div className="flex items-center gap-2">
              <span className="flex h-[46px] items-center rounded-[14px] border border-line-strong bg-paper px-3 text-[12px] font-semibold text-ink-soft">🇳🇬 +234</span>
              <input id="profile-phone" className="field" value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError(""); }} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="profile-email">Email</label>
            <input id="profile-email" type="email" className="field" value={form.email} onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setError(""); }} />
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          {saved && <Notice tone="success">Profile updated.</Notice>}
        </div>
      </Sheet>

      <Sheet
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out of Dash?"
        subtitle="You'll need to sign in again to send cash."
        footer={
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setLogoutOpen(false)} className="btn btn-outline">Stay</button>
            <button type="button" onClick={handleLogout} className="btn btn-dark">Log out</button>
          </div>
        }
      >
        <p className="rounded-2xl bg-paper p-4 text-[11px] leading-relaxed text-ink-soft">
          Your saved recipients and transaction history stay attached to your phone number. In this prototype you
          can return with the demo account link on the sign-in screen.
        </p>
      </Sheet>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data?"
        subtitle="This restores the seeded transactions, riders and vendors."
        footer={
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setResetOpen(false)} className="btn btn-outline">Cancel</button>
            <button type="button" onClick={() => { resetDemo(); setResetOpen(false); }} className="btn btn-danger">Reset demo</button>
          </div>
        }
      >
        <p className="rounded-2xl bg-paper p-4 text-[11px] leading-relaxed text-ink-soft">
          Any requests you created in this session will be removed. This is only available because the app is running
          with local demo data.
        </p>
      </Sheet>
    </AppShell>
  );
}
