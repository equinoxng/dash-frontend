"use client";

import { useState } from "react";
import Link from "next/link";
import PhoneField from "@/components/auth/PhoneField";
import Notice from "@/components/dash/Notice";
import { MIN_AMOUNT, formatNaira, formatNgPhone, toNgPhone } from "@/lib/dash/format";
import { makeReference } from "@/lib/dash/store";
import {
  listDashLinks,
  saveDashLink,
  type DashLinkPayload,
  type SavedDashLink,
} from "@/lib/dash/links";

const QUICK_AMOUNTS = [5_000, 10_000, 20_000, 50_000];

export default function CreateDashLink() {
  const [amountDigits, setAmountDigits] = useState("10000");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    area: "",
    city: "Lagos",
    note: "",
  });
  const [error, setError] = useState("");
  const [created, setCreated] = useState<SavedDashLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [recent] = useState<SavedDashLink[]>(() => listDashLinks());

  const amount = Number(amountDigits || 0);
  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const create = () => {
    if (amount < MIN_AMOUNT) {
      setError(`Enter at least ${formatNaira(MIN_AMOUNT)}.`);
      return;
    }
    const phone = toNgPhone(form.phone);
    if (form.name.trim().length < 3) return setError("Enter who should receive the cash.");
    if (!phone) return setError("Enter a valid Nigerian phone number.");
    if (form.street.trim().length < 5) return setError("Enter a street address.");
    if (form.area.trim().length < 2) return setError("Enter the area or neighbourhood.");
    if (form.city.trim().length < 2) return setError("Enter the city.");

    const payload: DashLinkPayload = {
      reference: makeReference(),
      amount,
      name: form.name.trim(),
      phone,
      street: form.street.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      note: form.note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setCreated(saveDashLink(payload));
    setCopied(false);
    setError("");
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (created) {
    return (
      <div className="rise">
        <div className="app-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-violet-deep">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
            </svg>
          </div>
          <p className="eyebrow mt-4">Dash link ready</p>
          <h2 className="mt-1 text-[22px] font-bold text-ink">Share it and get paid.</h2>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
            {formatNaira(created.amount)} will be delivered to {created.name} at {created.area}, {created.city}.
          </p>

          <div className="mt-4 rounded-2xl border border-line bg-cream p-3">
            <p className="field-label !mb-1.5">Your link</p>
            <p className="break-all text-[11px] leading-relaxed text-ink">{created.url}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={copy} className="btn btn-primary">
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link href={created.path} className="btn btn-outline">
              Preview
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setCopied(false);
              setAmountDigits("10000");
              setForm({ name: "", phone: "", street: "", area: "", city: "Lagos", note: "" });
            }}
            className="mt-3 w-full text-center text-[11px] font-semibold text-ink-soft hover:text-ink"
          >
            Create another link
          </button>
        </div>

        {recent.length > 0 && (
          <div className="mt-4 app-card overflow-hidden p-2">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">Recent links</p>
            {recent.map((link) => (
              <Link
                key={link.token}
                href={link.path}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-cream"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light text-violet-deep">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                    <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
                    <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-ink">{link.name}</span>
                  <span className="block text-[10px] text-ink-soft">{formatNaira(link.amount)} · {link.reference}</span>
                </span>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rise">
      <div className="app-card p-5">
        <p className="eyebrow">Create a Dash link</p>
        <h2 className="mt-1 text-[22px] font-bold text-ink">Let someone pay you.</h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
          Set the amount and delivery details. We&apos;ll make a link you can share on WhatsApp or anywhere else.
        </p>

        <div className="mt-5">
          <label className="field-label" htmlFor="link-amount">Amount to collect</label>
          <div className="flex items-center rounded-2xl border border-line-strong bg-white px-4">
            <span className="text-[18px] font-bold text-ink-soft">₦</span>
            <input
              id="link-amount"
              inputMode="numeric"
              value={amountDigits}
              onChange={(event) => {
                setAmountDigits(event.target.value.replace(/\D/g, "").slice(0, 9));
                setError("");
              }}
              className="num w-full bg-transparent px-2 py-3 text-[22px] font-bold text-ink outline-none"
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmountDigits(String(value))}
                className={`rounded-xl py-2 text-[10px] font-semibold transition-colors ${
                  amount === value ? "bg-violet text-white" : "bg-cream text-ink-soft hover:text-ink"
                }`}
              >
                {formatNaira(value)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="field-label" htmlFor="link-name">Recipient name</label>
            <input
              id="link-name"
              className="field"
              placeholder="Who receives the cash?"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>
          <PhoneField
            id="link-phone"
            value={form.phone}
            onChange={(value) => update("phone", value)}
            label="Recipient phone"
          />
          <div>
            <label className="field-label" htmlFor="link-street">Street address</label>
            <input
              id="link-street"
              className="field"
              placeholder="House number and street"
              value={form.street}
              onChange={(event) => update("street", event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="link-area">Area</label>
              <input
                id="link-area"
                className="field"
                placeholder="e.g. Yaba"
                value={form.area}
                onChange={(event) => update("area", event.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="link-city">City</label>
              <input
                id="link-city"
                className="field"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="link-note">Note <span className="normal-case tracking-normal">(optional)</span></label>
            <input
              id="link-note"
              className="field"
              placeholder="e.g. Lunch money"
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </div>
        </div>

        {error && <Notice tone="error" className="mt-4">{error}</Notice>}

        <button type="button" onClick={create} className="btn btn-primary btn-block mt-5">
          Create Dash link
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p className="mt-3 text-center text-[9.5px] leading-relaxed text-ink-soft">
          Demo links encode the request in the URL. No payment is collected until backend link support is added.
        </p>
      </div>

      {recent.length > 0 && (
        <div className="mt-4 app-card overflow-hidden p-2">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">Recent links</p>
          {recent.slice(0, 3).map((link) => (
            <Link
              key={link.token}
              href={link.path}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-cream"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light text-violet-deep">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
                  <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-ink">{link.name}</span>
                <span className="block text-[10px] text-ink-soft">
                  {formatNaira(link.amount)} · {formatNgPhone(link.phone)}
                </span>
              </span>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
