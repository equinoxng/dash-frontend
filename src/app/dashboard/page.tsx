"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav, { type DashTab } from "@/components/dash/BottomNav";
import Wordmark from "@/components/dash/Wordmark";
import Notice from "@/components/dash/Notice";
import CreateDashLink from "@/components/dash/CreateDashLink";
import NearbyCashPoints from "@/components/dash/NearbyCashPoints";
import { SendFlow } from "@/app/send/page";
import { TrackView } from "@/app/track/page";
import { useDash } from "@/lib/dash/useDash";
import { getSession, clearSession, type Session } from "@/lib/session";
import { getWallet, type Wallet } from "@/lib/wallet";
import { formatNaira, formatNgPhone, initials } from "@/lib/dash/format";
import {
  DEFAULT_LOCATION,
  loadRecipientLocation,
  saveRecipientLocation,
  type RecipientLocation,
} from "@/lib/dash/location";

type SendMode = "choose" | "pay" | "link";

const TABS: { key: DashTab; label: string }[] = [
  { key: "send", label: "Send" },
  { key: "track", label: "Track" },
  { key: "account", label: "Account" },
];

export default function Dashboard() {
  const state = useDash();
  const [tab, setTab] = useState<DashTab>("send");
  const [sendMode, setSendMode] = useState<SendMode>("choose");
  const [session, setSession] = useState<Session | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [flash, setFlash] = useState("");
  const [location, setLocation] = useState<RecipientLocation>(
    () => loadRecipientLocation() ?? DEFAULT_LOCATION,
  );
  const [locationReady, setLocationReady] = useState(() => Boolean(loadRecipientLocation()));

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (current) getWallet(current.token).then(setWallet).catch(() => {});
  }, []);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(""), 4500);
    return () => clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    if (locationReady) return;
    const latest = state?.recipients?.find((recipient) => recipient.saved) ?? state?.recipients?.[0];
    if (!latest) return;
    setLocation({ street: latest.street, area: latest.area, city: latest.city });
    setLocationReady(true);
  }, [state, locationReady]);

  useEffect(() => {
    if (locationReady) saveRecipientLocation(location);
  }, [location, locationReady]);

  const updateLocation = (patch: Partial<RecipientLocation>) => {
    setLocation((current) => ({ ...current, ...patch }));
    setLocationReady(true);
  };

  const firstName = session?.fullName?.split(" ")[0] || "there";
  const displayName = session?.fullName || state?.customer?.name || "Dash user";
  const displayPhone = session?.phoneNumber || state?.customer?.phone || "";

  const changeTab = (next: DashTab) => {
    setTab(next);
    setFlash("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:text-ink"
              aria-label="Notifications"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-violet" />
            </button>
            <button
              type="button"
              onClick={() => changeTab("account")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white"
              aria-label="Open account"
            >
              {initials(displayName)}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-36 pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-ink-soft">Good to see you,</p>
            <h1 className="mt-0.5 text-[26px] font-bold tracking-tight text-ink">{firstName} 👋</h1>
          </div>
          <span className="hidden rounded-full bg-accent-light px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-violet-deep sm:inline-flex">
            Personal
          </span>
        </div>

        {flash && <Notice tone="success" className="mt-4">{flash}</Notice>}

        {/* Shuttlers-style tab strip, mirrored by the bottom nav. */}
        <div className="mt-6 flex gap-1 rounded-full border border-line bg-cream p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => changeTab(item.key)}
              className={`flex-1 rounded-full py-2.5 text-[12px] font-semibold transition-all ${
                tab === item.key
                  ? "bg-violet text-white shadow-[0_8px_18px_-8px_rgba(13,172,92,0.9)]"
                  : "text-ink-soft hover:text-ink"
              }`}
              aria-current={tab === item.key ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "send" && (
            <section className="rise">
              <p className="eyebrow">Send</p>
              <h2 className="mt-1 text-[25px] font-bold tracking-tight text-ink">Move cash, your way.</h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
                Pay for a delivery now, or create a Dash link and let someone else pay you.
              </p>

              {/* Recipient location tracker — feeds the request form below. */}
              <div className="app-card mt-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Recipient location</p>
                    <h3 className="mt-1 text-[17px] font-bold text-ink">Where should we deliver?</h3>
                    <p className="mt-0.5 text-[11px] text-ink-soft">
                      We&apos;ll prefill this address whenever you start a request.
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-violet-deep">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="recipient-street">Street address</label>
                    <input
                      id="recipient-street"
                      className="field"
                      placeholder="House number and street"
                      value={location.street}
                      onChange={(event) => updateLocation({ street: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="recipient-area">Area / neighbourhood</label>
                    <input
                      id="recipient-area"
                      className="field"
                      placeholder="e.g. Yaba"
                      value={location.area}
                      onChange={(event) => updateLocation({ area: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="recipient-city">City</label>
                    <input
                      id="recipient-city"
                      className="field"
                      value={location.city}
                      onChange={(event) => updateLocation({ city: event.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-[10px] leading-relaxed text-ink-soft">
                    {locationReady && location.street && location.area
                      ? "Location ready for your next request."
                      : "Add a street and area to prefill requests."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!location.street.trim() || !location.area.trim()) {
                        setFlash("Add a street and area first.");
                        return;
                      }
                      saveRecipientLocation(location);
                      setFlash("Recipient location saved. Requests will be prefilled.");
                    }}
                    className="btn btn-primary btn-sm shrink-0"
                  >
                    Use this location
                  </button>
                </div>
              </div>

              {sendMode === "choose" ? (
                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={() => setSendMode("pay")}
                    className="app-card group flex items-center gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet text-white">
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-bold text-ink">Pay for a request</span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-ink-soft">
                        Send cash straight to someone&apos;s door and follow the rider live.
                      </span>
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMode("link")}
                    className="app-card group flex items-center gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-violet-deep">
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
                        <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-bold text-ink">Create a Dash link</span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-ink-soft">
                        Share a payment link so anyone can pay you and arrange the delivery.
                      </span>
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setSendMode("choose")}
                    className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    All send options
                  </button>

                  {sendMode === "pay" ? (
                    <SendFlow
                      embedded
                      initialRecipient={location}
                      onDone={() => {
                        setSendMode("choose");
                        setTab("track");
                        setFlash("Payment complete. Your delivery is now being tracked.");
                      }}
                    />
                  ) : (
                    <CreateDashLink />
                  )}
                </div>
              )}
            </section>
          )}

          {tab === "track" && (
            <section className="rise">
              <p className="eyebrow">Track</p>
              <h2 className="mt-1 text-[25px] font-bold tracking-tight text-ink">Every handoff, in view.</h2>
              <div className="mt-5">
                <NearbyCashPoints location={location} />
              </div>
              <div className="mt-5">
                <TrackView embedded />
              </div>
            </section>
          )}

          {tab === "account" && (
            <section className="rise">
              <p className="eyebrow">Account</p>
              <h2 className="mt-1 text-[25px] font-bold tracking-tight text-ink">Your Dash.</h2>

              <div className="mt-5 overflow-hidden rounded-[26px] bg-ink p-5 text-white shadow-[0_28px_60px_-34px_rgba(22,22,22,0.7)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Wallet balance</p>
                    <p className="num mt-1.5 text-[34px] font-bold leading-none tracking-tight">
                      {balanceVisible ? formatNaira(wallet?.balance ?? 0) : "₦ ••••••"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBalanceVisible((visible) => !visible)}
                    className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                  >
                    {balanceVisible ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                        <path d="M17.9 17.9A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M9.9 9.9a3 3 0 1 0 4.2 4.2" />
                        <path d="M1 1l22 22" />
                      </svg>
                    )}
                  </button>
                </div>

                {wallet && wallet.escrowBalance > 0 && (
                  <p className="mt-2 text-[11px] text-white/55">
                    {formatNaira(wallet.escrowBalance)} in escrow for active deliveries
                  </p>
                )}

                <div className="mt-5 border-t border-white/10 pt-4">
                  <Link href="/fund" className="btn btn-sm w-full bg-white/10 text-white hover:bg-white/15">
                    Add funds
                  </Link>
                </div>
              </div>

              <div className="app-card mt-4 flex items-center gap-3.5 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-bold text-white">
                  {initials(displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-ink">{displayName}</p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-soft">
                    {formatNgPhone(displayPhone) || "No phone on file"}
                  </p>
                  {session?.phoneVerified && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-[9px] font-bold text-violet-deep">
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6.2L4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <Link href="/profile" className="btn btn-outline btn-sm">Edit</Link>
              </div>

              <div className="mt-4">
                <p className="field-label px-1">Wallet</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    {
                      label: "Add funds",
                      href: "/fund",
                      icon: <path d="M12 5v14M5 12h14" />,
                    },
                    {
                      label: "Bank accounts",
                      href: "/settings/bank",
                      icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
                    },
                    {
                      label: "Profile settings",
                      href: "/profile",
                      icon: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
                    },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="app-card-flat flex items-center gap-3 p-3.5 transition-colors hover:border-line-strong"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-violet-deep">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          {action.icon}
                        </svg>
                      </span>
                      <span className="text-[12px] font-semibold text-ink">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 app-card overflow-hidden p-2">
                {[
                  { label: "Saved recipients", description: "People you send cash to", href: "/account/recipients" },
                  { label: "Transaction history", description: "Every cash request and receipt", href: "/activity" },
                  { label: "Delivery addresses", description: "Where your cash can be delivered", href: "/settings/addresses" },
                  { label: "Change PIN", description: "Keep payments protected", href: "/profile/change-pin" },
                  { label: "Help & support", description: "FAQs and delivery help", href: "/account/help" },
                ].map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-cream ${
                      index > 0 ? "border-t border-line/70" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-[10px] text-ink-soft">{item.description}</span>
                    </span>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  clearSession();
                  window.location.assign("/signin");
                }}
                className="mt-4 w-full text-center text-[11px] font-semibold text-danger hover:underline"
              >
                Sign out
              </button>
            </section>
          )}
        </div>
      </main>

      <BottomNav active={tab} onChange={changeTab} showOnDesktop />
    </div>
  );
}
