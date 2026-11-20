"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Wordmark from "@/components/dash/Wordmark";
import Notice from "@/components/dash/Notice";
import LegalDisclaimer from "@/components/dash/LegalDisclaimer";
import { getSession, type Session } from "@/lib/session";
import { decodeDashLink } from "@/lib/dash/links";
import { computeDeliveryFee, formatNaira, formatNgPhone } from "@/lib/dash/format";
import { confirmPayment, createCashRequest, makeReference, openPaymentSession } from "@/lib/dash/store";

export default function PayDashLinkPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;
  const link = useMemo(() => decodeDashLink(token), [token]);
  const idempotencyKey = useRef("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => setSession(getSession()), []);

  const path = `/pay/${token ?? ""}`;
  const fee = link ? computeDeliveryFee(link.amount) : 0;
  const total = link ? link.amount + fee : 0;

  const pay = async () => {
    if (!link) return;
    if (!session) {
      router.push(`/signin?next=${encodeURIComponent(path)}`);
      return;
    }

    if (!idempotencyKey.current) idempotencyKey.current = `idem_${makeReference().slice(4)}`;
    setPaying(true);
    setError("");

    const result = createCashRequest({
      recipient: {
        name: link.name,
        phone: link.phone,
        street: link.street,
        area: link.area,
        city: link.city,
        instructions: link.note,
      },
      amount: link.amount,
      deliveryFee: fee,
      serviceCharge: 0,
      currency: "NGN",
      paymentMethod: "Dash link · Demo",
      saveRecipient: false,
    });

    if (!result.ok) {
      setError(result.error);
      setPaying(false);
      return;
    }

    openPaymentSession(result.transaction.id);
    const confirmation = confirmPayment(
      result.transaction.id,
      `LINK-PAY-${link.reference.replace("DSH-", "")}`,
      idempotencyKey.current,
    );

    if (!confirmation.ok) {
      setError(confirmation.error);
      setPaying(false);
      return;
    }

    router.push(`/send/success?ref=${result.transaction.id}`);
  };

  return (
    <main className="min-h-dvh bg-paper">
      <header className="border-b border-line/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Wordmark />
          <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Secure
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pb-20 pt-8">
        {!link ? (
          <div className="app-card p-6 text-center">
            <p className="text-lg font-bold text-ink">This Dash link is invalid</p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              The link may be incomplete or was created in an older format. Ask the sender for a new one.
            </p>
            <Link href="/dashboard" className="btn btn-primary btn-block mt-5">Go to dashboard</Link>
          </div>
        ) : (
          <div className="rise">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-violet-deep">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <p className="eyebrow mt-4">Payment request</p>
              <h1 className="mt-1 text-[30px] font-bold tracking-tight text-ink">
                Pay {formatNaira(link.amount)}
              </h1>
              <p className="mt-1.5 text-[12px] text-ink-soft">
                to {link.name} · {link.reference}
              </p>
            </div>

            <div className="app-card mt-6 overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <p className="field-label !mb-1">Delivering cash to</p>
                <p className="text-[14px] font-semibold text-ink">{link.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-soft">{formatNgPhone(link.phone)}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                  {link.street}, {link.area}, {link.city}
                </p>
                {link.note && (
                  <p className="mt-3 rounded-2xl bg-cream px-3 py-2 text-[11px] italic text-ink-soft">
                    “{link.note}”
                  </p>
                )}
              </div>

              <div className="space-y-2.5 px-5 py-4">
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink-soft">Cash amount</span>
                  <span className="num font-semibold text-ink">{formatNaira(link.amount)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink-soft">Delivery fee</span>
                  <span className="num font-semibold text-ink">{formatNaira(fee)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2.5 text-[13px]">
                  <span className="font-bold text-ink">Total</span>
                  <span className="num font-bold text-ink">{formatNaira(total)}</span>
                </div>
              </div>
            </div>

            {error && <Notice tone="error" className="mt-4">{error}</Notice>}

            <button
              type="button"
              onClick={pay}
              disabled={paying}
              className="btn btn-primary btn-lg btn-block mt-5"
            >
              {paying ? "Processing…" : session ? "Pay and send cash" : "Sign in to pay"}
              {!paying && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>

            <p className="mt-3 text-center text-[9.5px] leading-relaxed text-ink-soft">
              Demo payment. No real money moves. Dash links are URL-based until the backend link API is available.
            </p>

            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-white px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-violet" aria-hidden>
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <p className="text-[10.5px] leading-relaxed text-ink-soft">
                Your recipient confirms handoff with a one-time code. The rider cannot complete the delivery without it.
              </p>
            </div>
          </div>
        )}

        <LegalDisclaimer className="mt-8" />
      </div>
    </main>
  );
}
