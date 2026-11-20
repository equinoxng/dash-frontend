"use client";

import Link from "next/link";
import AppShell from "@/components/dash/AppShell";
import { useDash } from "@/lib/dash/useDash";

const FAQ = [
  {
    q: "Does the recipient need a Dash account?",
    a: "No. Dash only needs their full name, an active Nigerian phone number and a delivery address. The one-time handoff code is sent by SMS — no app, no sign-up.",
  },
  {
    q: "How is the delivery fee calculated?",
    a: "The fee depends on the cash amount and is always shown before you pay. It covers rider dispatch and the OTP handover. There are no hidden charges added later.",
  },
  {
    q: "When is my cash actually on the way?",
    a: "A rider is only assigned after the payment provider confirms your charge through a signed webhook, and a cash vendor confirms the notes are available. The tracking page reflects each step as it happens.",
  },
  {
    q: "What if the recipient is not reachable?",
    a: "The rider will call the recipient and wait. If handoff cannot happen, the delivery is marked failed and operations reviews it. You are notified and any captured payment is protected or refunded.",
  },
  {
    q: "How does the OTP handoff work?",
    a: "We text a one-time code to the recipient. The rider enters that code only after the cash is physically in the recipient's hands. A rider reaching the address does not complete the delivery.",
  },
  {
    q: "How long do refunds take?",
    a: "Refunds are sent back to your original payment method. Most settle within 3–5 business days, depending on your bank or card issuer. You can follow the status from the transaction page.",
  },
  {
    q: "I entered the wrong delivery address. What now?",
    a: "Contact support immediately with your reference. If a rider has not collected the cash, we may be able to update the address. If delivery has already started, we will coordinate with the rider or arrange a refund.",
  },
];

export default function HelpPage() {
  const state = useDash();
  const openDisputes = state?.disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW").length ?? 0;
  const active = state?.transactions.filter((tx) => !["COMPLETED", "REFUNDED", "DELIVERY_CANCELLED"].includes(tx.status)).length ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-5">
        <Link href="/account" className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Account
        </Link>

        <p className="eyebrow mt-4">Help & support</p>
        <h1 className="display mt-1 text-[38px] text-ink">We&apos;re here.</h1>
        <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-ink-soft">
          Cash delivery has a few moving parts. If something feels unclear, talk to a person — not a bot.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {[
            ["Call support", "Mon–Sun · 8am–10pm", "tel:+2347000000000"],
            ["WhatsApp", "Usually under 5 min", "https://wa.me/2347000000000"],
            ["Email", "support@dash.ng", "mailto:support@dash.ng"],
            ["Open a dispute", openDisputes > 0 ? `${openDisputes} case${openDisputes === 1 ? "" : "s"} in review` : "Report a delivery", "/account/disputes"],
          ].map(([title, sub, href]) => (
            <a key={title} href={href} className="app-card-flat bg-white p-4 transition-colors hover:border-line-strong">
              <p className="text-[12px] font-semibold text-ink">{title}</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-ink-soft">{sub}</p>
            </a>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-violet/15 bg-violet-soft px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11.5px] font-bold text-violet-deep">
                {active > 0 ? `${active} delivery${active === 1 ? "" : "s"} in progress` : "No active deliveries"}
              </p>
              <p className="mt-0.5 text-[10px] text-violet-deep/65">
                {active > 0 ? "Track the rider, ETA and OTP status live." : "Start a request whenever you need cash delivered."}
              </p>
            </div>
            <Link href={active > 0 ? "/track" : "/send"} className="btn btn-primary btn-sm shrink-0">
              {active > 0 ? "Track" : "Send cash"}
            </Link>
          </div>
        </div>

        <h2 className="mt-7 text-[15px] font-bold tracking-[-0.015em] text-ink">Common questions</h2>
        <div className="mt-3 divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-white">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-4 py-3.5 open:bg-paper/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0 text-ink-soft transition-transform group-open:rotate-45" aria-hidden>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-2 pr-5 text-[11px] leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="app-card mt-5 p-5">
          <p className="eyebrow">If something goes wrong</p>
          <h2 className="mt-1 text-[15px] font-bold tracking-[-0.015em] text-ink">You will never be left guessing.</h2>
          <ul className="mt-4 space-y-3">
            {[
              ["Payment declined", "No rider is dispatched. Nothing is taken. Retry with another method."],
              ["Payment confirmed but delayed", "Your request is safe. We keep the reference and match a vendor; tracking updates automatically."],
              ["No rider available", "Operations is alerted. If we cannot fulfil the request, you are refunded in full."],
              ["Recipient unreachable", "The rider waits, calls, and escalates. A failed handoff goes to refund review."],
              ["Invalid or expired OTP", "The rider can request a fresh code. Delivery cannot complete without a valid code."],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                <p className="text-[10.5px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{title}.</span> {body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-[9.5px] text-ink-soft/65">
          Demo help centre. Live contact routes and support tooling are not connected in this prototype.
        </p>
      </div>
    </AppShell>
  );
}
