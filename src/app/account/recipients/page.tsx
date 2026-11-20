"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/dash/AppShell";
import Sheet from "@/components/dash/Sheet";
import Notice from "@/components/dash/Notice";
import EmptyState from "@/components/dash/EmptyState";
import { useDash } from "@/lib/dash/useDash";
import { deleteRecipient, saveRecipient, updateRecipient } from "@/lib/dash/store";
import { formatNgPhone, initials, timeAgo, toNgPhone } from "@/lib/dash/format";
import type { Recipient } from "@/lib/dash/types";

type Form = Omit<Recipient, "id" | "saved" | "lastUsedAt">;

const empty: Form = { name: "", phone: "", street: "", area: "", city: "Lagos", instructions: "" };

export default function RecipientsPage() {
  const state = useDash();
  const recipients = state?.recipients ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recipient | null>(null);
  const [deleting, setDeleting] = useState<Recipient | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState("");

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setError("");
    setOpen(true);
  };

  const openEdit = (recipient: Recipient) => {
    setEditing(recipient);
    setForm({
      name: recipient.name,
      phone: formatNgPhone(recipient.phone),
      street: recipient.street,
      area: recipient.area,
      city: recipient.city,
      instructions: recipient.instructions ?? "",
    });
    setError("");
    setOpen(true);
  };

  const submit = () => {
    const phone = toNgPhone(form.phone);
    if (form.name.trim().length < 3) return setError("Enter the recipient's full name.");
    if (!phone) return setError("Enter a valid Nigerian phone number.");
    if (form.street.trim().length < 5) return setError("Enter a street address.");
    if (form.area.trim().length < 2) return setError("Enter the area.");
    if (form.city.trim().length < 2) return setError("Enter the city.");

    const payload = {
      name: form.name.trim(),
      phone,
      street: form.street.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      instructions: (form.instructions ?? "").trim() || undefined,
    };

    if (editing) {
      const result = updateRecipient(editing.id, payload);
      if (!result.ok) return setError(result.error);
    } else {
      saveRecipient(payload);
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteRecipient(deleting.id);
    setDeleting(null);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-5">
        <Link href="/account" className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Account
        </Link>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Saved recipients</p>
            <h1 className="display mt-1 text-[38px] text-ink">People you send to.</h1>
          </div>
          <button type="button" onClick={openNew} className="btn btn-primary btn-sm shrink-0">
            Add new
          </button>
        </div>
        <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-ink-soft">
          Reuse a recipient to fill their details in seconds. They never need to install Dash.
        </p>

        {recipients.length === 0 ? (
          <div className="app-card mt-5">
            <EmptyState
              title="No saved recipients yet"
              description="Add someone once and their delivery details will be ready next time."
              action={{ href: "/send", label: "Send cash instead" }}
            />
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="app-card-flat bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-soft text-[12px] font-bold text-violet-deep">
                    {initials(recipient.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{recipient.name}</p>
                    <p className="mt-0.5 text-[10.5px] text-ink-soft">{formatNgPhone(recipient.phone)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEdit(recipient)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink" aria-label={`Edit ${recipient.name}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => setDeleting(recipient)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${recipient.name}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-paper px-3 py-2">
                  <p className="text-[10.5px] leading-relaxed text-ink-soft">
                    {recipient.street}, {recipient.area}, {recipient.city}
                  </p>
                  {recipient.instructions && (
                    <p className="mt-1 text-[9.5px] leading-relaxed text-ink-soft/75">{recipient.instructions}</p>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[9px] text-ink-soft/70">
                    {recipient.lastUsedAt ? `Last used ${timeAgo(recipient.lastUsedAt)}` : "Saved recipient"}
                  </span>
                  <Link href="/send" className="text-[9.5px] font-semibold text-violet hover:underline">
                    Send cash
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit recipient" : "Add a recipient"}
        subtitle="Only the name, phone and address are needed."
        footer={
          <button type="button" onClick={submit} className="btn btn-primary btn-block">
            {editing ? "Save changes" : "Save recipient"}
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="field-label" htmlFor="rec-name">Full name</label>
            <input id="rec-name" className="field" placeholder="e.g. Ngozi Uche" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} />
          </div>
          <div>
            <label className="field-label" htmlFor="rec-phone">Phone number</label>
            <div className="flex items-center gap-2">
              <span className="flex h-[46px] shrink-0 items-center rounded-[14px] border border-line-strong bg-paper px-3 text-[12px] font-semibold text-ink-soft">🇳🇬 +234</span>
              <input id="rec-phone" type="tel" className="field" placeholder="803 456 7890" value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError(""); }} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="rec-street">Street address</label>
            <input id="rec-street" className="field" placeholder="House number and street" value={form.street} onChange={(e) => { setForm((f) => ({ ...f, street: e.target.value })); setError(""); }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="rec-area">Area</label>
              <input id="rec-area" className="field" placeholder="Lekki Phase 1" value={form.area} onChange={(e) => { setForm((f) => ({ ...f, area: e.target.value })); setError(""); }} />
            </div>
            <div>
              <label className="field-label" htmlFor="rec-city">City</label>
              <input id="rec-city" className="field" value={form.city} onChange={(e) => { setForm((f) => ({ ...f, city: e.target.value })); setError(""); }} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="rec-instructions">Delivery instructions <span className="font-medium normal-case tracking-normal text-ink-soft/70">(optional)</span></label>
            <textarea id="rec-instructions" rows={2} className="field resize-none" placeholder="Landmark, gate colour, who to call…" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
          </div>
          {error && <Notice tone="error">{error}</Notice>}
        </div>
      </Sheet>

      <Sheet
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete recipient?"
        subtitle={deleting ? `${deleting.name} will be removed from your saved recipients.` : ""}
        footer={
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setDeleting(null)} className="btn btn-outline">Keep</button>
            <button type="button" onClick={confirmDelete} className="btn btn-danger">Delete</button>
          </div>
        }
      >
        <p className="rounded-2xl bg-paper p-4 text-[11px] leading-relaxed text-ink-soft">
          Past deliveries to this person are not affected. You can add them again at any time.
        </p>
      </Sheet>
    </AppShell>
  );
}
