"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Wordmark from "@/components/dash/Wordmark";
import Notice from "@/components/dash/Notice";
import LegalDisclaimer from "@/components/dash/LegalDisclaimer";
import { useDash } from "@/lib/dash/useDash";
import { listAddresses, type DeliveryAddress } from "@/lib/addresses";
import { getSession, type Session } from "@/lib/session";
import { createCashRequest, confirmPayment, makeReference, openPaymentSession } from "@/lib/dash/store";
import {
  MAX_AMOUNT,
  MIN_AMOUNT,
  computeDeliveryFee,
  formatNaira,
  formatNgPhone,
  initials,
  toNgPhone,
} from "@/lib/dash/format";
import type { Recipient, Transaction } from "@/lib/dash/types";

const STEPS = ["Recipient", "Amount", "Payment", "Review"] as const;
const SUGGESTED = [5_000, 10_000, 20_000, 50_000, 100_000];

type Form = {
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  instructions: string;
  saveRecipient: boolean;
};

type Errors = Partial<Record<keyof Form, string>>;
type RecipientKind = "other" | "self";

const emptyForm: Form = {
  name: "",
  phone: "",
  street: "",
  area: "",
  city: "Lagos",
  instructions: "",
  saveRecipient: true,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SendInitialRecipient = {
  street?: string;
  area?: string;
  city?: string;
};

function buildInitialForm(initialRecipient?: SendInitialRecipient): Form {
  return {
    ...emptyForm,
    street: initialRecipient?.street ?? "",
    area: initialRecipient?.area ?? "",
    city: initialRecipient?.city ?? emptyForm.city,
  };
}

function buildSelfForm(
  session: Session | null,
  address: DeliveryAddress | null,
  initialRecipient?: SendInitialRecipient,
): Form {
  const normalizedPhone = session?.phoneNumber ? toNgPhone(session.phoneNumber) : null;
  return {
    name: session?.fullName ?? "",
    phone: normalizedPhone
      ? formatNgPhone(normalizedPhone)
      : session?.phoneNumber ?? "",
    street: address ? [address.houseNumber, address.street].filter(Boolean).join(" ") : initialRecipient?.street ?? "",
    area: address?.city || initialRecipient?.area || "",
    city: address?.state || initialRecipient?.city || emptyForm.city,
    instructions: address?.landmark ?? "",
    saveRecipient: false,
  };
}

export function SendFlow({
  embedded = false,
  onDone,
  initialRecipient,
}: {
  embedded?: boolean;
  onDone?: (id: string) => void;
  initialRecipient?: SendInitialRecipient;
}) {
  const router = useRouter();
  const state = useDash();
  const saved = state?.recipients;

  const [session, setSession] = useState<Session | null>(null);
  const [selfAddresses, setSelfAddresses] = useState<DeliveryAddress[] | null>(null);
  const [recipientKind, setRecipientKind] = useState<RecipientKind>("other");
  const otherFormRef = useRef<Form | null>(null);
  const selfTouchedRef = useRef(false);

  const [stage, setStage] = useState(0);
  const [form, setForm] = useState<Form>(() => buildInitialForm(initialRecipient));
  const [errors, setErrors] = useState<Errors>({});
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [amountDigits, setAmountDigits] = useState("20000");
  const [paymentMethod, setPaymentMethod] = useState("Debit card");
  const [amountError, setAmountError] = useState("");
  const [payError, setPayError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payPhase, setPayPhase] = useState<"provider" | "verifying" | null>(null);

  const createdTransaction = useRef<Transaction | null>(null);
  const idempotencyKey = useRef("");

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) return;
    let active = true;
    listAddresses(current.token)
      .then((items) => {
        if (active) setSelfAddresses(items);
      })
      .catch(() => {
        if (active) setSelfAddresses([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const selfAddress = selfAddresses?.find((item) => item.defaultAddress) ?? selfAddresses?.[0] ?? null;

  useEffect(() => {
    if (recipientKind !== "self" || selfTouchedRef.current) return;
    setForm(buildSelfForm(session, selfAddress, initialRecipient));
    setErrors({});
  }, [recipientKind, session, selfAddress, initialRecipient?.street, initialRecipient?.area, initialRecipient?.city]);

  useEffect(() => {
    if (!initialRecipient || recipientKind === "self") return;
    setForm((current) => ({
      ...current,
      street: initialRecipient.street ?? current.street,
      area: initialRecipient.area ?? current.area,
      city: initialRecipient.city || current.city,
    }));
  }, [initialRecipient?.street, initialRecipient?.area, initialRecipient?.city, recipientKind]);

  const amount = Number(amountDigits || 0);
  const fee = amount > 0 ? computeDeliveryFee(amount) : 0;
  const total = amount + fee;

  const exactRecipient = useMemo(() => {
    const phone = toNgPhone(form.phone);
    if (!phone) return null;
    return saved?.find((r) => r.phone === phone) ?? null;
  }, [form.phone, saved]);

  const update = (key: keyof Form, value: string | boolean) => {
    if (recipientKind === "self") selfTouchedRef.current = true;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setPayError("");
  };

  const selectRecipientKind = (kind: RecipientKind) => {
    if (kind === recipientKind) return;
    if (kind === "self") {
      if (!session) return;
      otherFormRef.current = form;
      selfTouchedRef.current = false;
      setRecipientKind("self");
      setForm(buildSelfForm(session, selfAddress, initialRecipient));
      setSelectedRecipient(null);
    } else {
      selfTouchedRef.current = false;
      setRecipientKind("other");
      setForm(otherFormRef.current ?? buildInitialForm(initialRecipient));
      setSelectedRecipient(null);
    }
    setErrors({});
    setPayError("");
  };

  const chooseRecipient = (recipient: Recipient) => {
    setRecipientKind("other");
    setSelectedRecipient(recipient.id);
    setForm((f) => ({
      ...f,
      name: recipient.name,
      phone: formatNgPhone(recipient.phone),
      street: recipient.street,
      area: recipient.area,
      city: recipient.city,
      instructions: recipient.instructions ?? "",
    }));
    setErrors({});
  };

  const validateRecipient = () => {
    const next: Errors = {};
    if (form.name.trim().length < 3) {
      next.name = recipientKind === "self" ? "Enter your full name." : "Enter the recipient's full name.";
    }
    if (!toNgPhone(form.phone)) next.phone = "Enter a valid Nigerian phone number.";
    if (form.street.trim().length < 5) next.street = "Enter a street address.";
    if (form.area.trim().length < 2) next.area = "Enter the area or neighbourhood.";
    if (form.city.trim().length < 2) next.city = "Enter the city.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToAmount = () => {
    if (!validateRecipient()) return;
    setStage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPayment = () => {
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT) {
      setAmountError(`Enter at least ${formatNaira(MIN_AMOUNT)}.`);
      return;
    }
    if (amount > MAX_AMOUNT) {
      setAmountError(`The maximum per request is ${formatNaira(MAX_AMOUNT)}.`);
      return;
    }
    setAmountError("");
    setStage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (stage === 0) {
      if (!embedded) router.push("/");
      return;
    }
    setStage((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePay = async () => {
    if (paying) return;
    setPayError("");
    setPaying(true);

    let tx = createdTransaction.current;
    if (!tx) {
      if (!idempotencyKey.current) {
        idempotencyKey.current = `idem_${makeReference().slice(4)}`;
      }

      const result = createCashRequest({
        recipient: {
          name: form.name.trim(),
          phone: toNgPhone(form.phone) ?? form.phone,
          street: form.street.trim(),
          area: form.area.trim(),
          city: form.city.trim(),
          instructions: form.instructions.trim() || undefined,
        },
        amount,
        deliveryFee: fee,
        serviceCharge: 0,
        currency: "NGN",
        paymentMethod: `${paymentMethod} · Demo`,
        saveRecipient: recipientKind === "other" && form.saveRecipient,
      });

      if (!result.ok) {
        setPayError(result.error);
        setPaying(false);
        return;
      }

      tx = result.transaction;
      createdTransaction.current = tx;
      openPaymentSession(tx.id);
    }

    setPayPhase("provider");

    // Demo checkout. In production the provider redirects back, and the
    // backend only confirms on a signed webhook — never on this client.
    await delay(1200);
    const providerReference = `DEMO-PAY-${tx.reference.replace("DSH-", "")}`;
    const confirmation = confirmPayment(tx.id, providerReference, idempotencyKey.current);

    if (!confirmation.ok) {
      setPayError(confirmation.error);
      setPayPhase(null);
      setPaying(false);
      return;
    }

    setPayPhase("verifying");
    await delay(900);
    if (onDone) onDone(tx.id);
    else router.push(`/send/success?ref=${tx.id}`);
  };

  return (
    <div className={embedded ? "" : "min-h-dvh bg-paper"}>
      {!embedded && (
        <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
            <button
              type="button"
              onClick={back}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-line-strong"
              aria-label="Go back"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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
      )}

      <main className={`mx-auto px-4 ${embedded ? "max-w-none pb-4 pt-2" : "max-w-xl pb-16 pt-5"}`}>
        {/* Progress */}
        <div className="mb-7">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Step {stage + 1} of 4
            </span>
            <span className="text-[10px] font-semibold text-ink">{STEPS[stage]}</span>
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {STEPS.map((step, index) => (
              <div key={step} className="space-y-1.5">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index <= stage ? "bg-violet" : "bg-line"
                  }`}
                />
                <p className={`hidden text-[9px] font-semibold sm:block ${index === stage ? "text-ink" : "text-ink-soft/60"}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {stage === 0 && (
          <div className="rise">
            <p className="eyebrow">Recipient</p>
            <h1 className="display mt-2 text-[40px] text-ink">Who needs cash?</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {recipientKind === "self"
                ? "We'll use your Dash details and delivery address — edit them below if needed."
                : "They don't need a Dash account — just a phone number and a place to receive it."}
            </p>

            <div className="mt-6">
              <p className="field-label">Sending to</p>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-paper p-1">
                <button
                  type="button"
                  onClick={() => selectRecipientKind("other")}
                  className={`rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all ${
                    recipientKind === "other" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Someone else
                </button>
                <button
                  type="button"
                  onClick={() => selectRecipientKind("self")}
                  disabled={!session}
                  className={`rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all ${
                    recipientKind === "self" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                  } ${!session ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  Myself
                </button>
              </div>
              {recipientKind === "self" ? (
                <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                  {selfAddress
                    ? `Using your ${selfAddress.label} delivery address.`
                    : "Your saved details are filled in below — edit anything before continuing."}
                </p>
              ) : !session ? (
                <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                  <Link href="/signin?next=/send" className="font-semibold text-violet hover:underline">Sign in</Link>{" "}
                  to select yourself as the recipient.
                </p>
              ) : null}
            </div>

            {recipientKind === "other" && saved && saved.length > 0 && (
              <div className="mt-6">
                <p className="field-label">Saved recipients</p>
                <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {saved.slice(0, 5).map((recipient) => {
                    const active = selectedRecipient === recipient.id;
                    return (
                      <button
                        key={recipient.id}
                        type="button"
                        onClick={() => chooseRecipient(recipient)}
                        className={`flex w-[92px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-all ${
                          active ? "border-violet bg-violet-soft" : "border-line bg-white hover:border-line-strong"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold ${
                            active ? "bg-violet text-white" : "bg-paper text-violet-deep"
                          }`}
                        >
                          {initials(recipient.name)}
                        </span>
                        <span className="w-full truncate text-center text-[10px] font-semibold text-ink">
                          {recipient.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="app-card mt-4 p-5">
              <div className="space-y-4">
                <div>
                  <label className="field-label" htmlFor="recipient-name">
                    {recipientKind === "self" ? "Your full name" : "Full name"}
                  </label>
                  <input
                    id="recipient-name"
                    className={`field ${errors.name ? "field-error" : ""}`}
                    placeholder="e.g. Emeka Obi"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  {errors.name && <p className="mt-1 text-[10.5px] font-medium text-danger">{errors.name}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="recipient-phone">Phone number</label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-[14px] border border-line-strong bg-paper px-3 text-[12px] font-semibold text-ink-soft">
                      <span aria-hidden>🇳🇬</span> +234
                    </span>
                    <input
                      id="recipient-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={`field ${errors.phone ? "field-error" : ""}`}
                      placeholder="803 456 7890"
                      value={form.phone}
                      onChange={(e) => {
                        update("phone", e.target.value);
                        setSelectedRecipient(null);
                      }}
                      onBlur={() => {
                        const normalized = toNgPhone(form.phone);
                        if (normalized) update("phone", formatNgPhone(normalized));
                      }}
                    />
                  </div>
                  {errors.phone ? (
                    <p className="mt-1 text-[10.5px] font-medium text-danger">{errors.phone}</p>
                  ) : (
                    <p className="mt-1 text-[10px] text-ink-soft">We&apos;ll text the delivery code to this number.</p>
                  )}
                </div>

                <div className="h-px bg-line" />

                <div>
                  <label className="field-label" htmlFor="recipient-street">
                    {recipientKind === "self" ? "Your delivery address" : "Delivery address"}
                  </label>
                  <input
                    id="recipient-street"
                    className={`field ${errors.street ? "field-error" : ""}`}
                    placeholder="Street address, house number"
                    autoComplete="street-address"
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                  />
                  {errors.street && <p className="mt-1 text-[10.5px] font-medium text-danger">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label" htmlFor="recipient-area">Area</label>
                    <input
                      id="recipient-area"
                      className={`field ${errors.area ? "field-error" : ""}`}
                      placeholder="e.g. Victoria Island"
                      value={form.area}
                      onChange={(e) => update("area", e.target.value)}
                    />
                    {errors.area && <p className="mt-1 text-[10.5px] font-medium text-danger">{errors.area}</p>}
                  </div>
                  <div>
                    <label className="field-label" htmlFor="recipient-city">City</label>
                    <input
                      id="recipient-city"
                      className={`field ${errors.city ? "field-error" : ""}`}
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                    {errors.city && <p className="mt-1 text-[10.5px] font-medium text-danger">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="recipient-instructions">
                    Delivery instructions <span className="font-medium normal-case tracking-normal text-ink-soft/70">(optional)</span>
                  </label>
                  <textarea
                    id="recipient-instructions"
                    rows={2}
                    className="field resize-none"
                    placeholder="Landmark, gate colour, who to call…"
                    value={form.instructions}
                    onChange={(e) => update("instructions", e.target.value)}
                  />
                </div>

                {recipientKind === "other" ? (
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-paper px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={form.saveRecipient}
                      onChange={(e) => update("saveRecipient", e.target.checked)}
                      className="h-4 w-4 rounded border-line-strong accent-violet"
                    />
                    <span className="text-[11px] text-ink-soft">Save this recipient for next time</span>
                  </label>
                ) : (
                  <p className="rounded-xl bg-paper px-3 py-2.5 text-[11px] text-ink-soft">
                    You&apos;re the recipient, so we won&apos;t save this as a saved contact.
                  </p>
                )}
              </div>
            </div>

            <button type="button" onClick={goToAmount} className="btn btn-primary btn-lg btn-block mt-5">
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            {recipientKind === "other" && exactRecipient && (
              <p className="mt-2 text-center text-[10px] text-ink-soft">
                Matches your saved recipient, {exactRecipient.name}.
              </p>
            )}
          </div>
        )}

        {stage === 1 && (
          <div className="rise">
            <p className="eyebrow">Cash amount</p>
            <h1 className="display mt-2 text-[40px] text-ink">How much cash?</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              For {recipientKind === "self" ? "you" : form.name.split(" ")[0]} at {form.area}, {form.city}.
            </p>

            <div className="app-card mt-6 p-5">
              <label className="field-label" htmlFor="amount">They receive</label>
              <div className="flex items-center gap-2 rounded-2xl bg-paper px-4 py-4">
                <span className="text-2xl font-bold text-ink-soft">₦</span>
                <input
                  id="amount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amountDigits}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 6);
                    setAmountDigits(digits);
                    setAmountError("");
                  }}
                  className="num min-w-0 flex-1 bg-transparent text-[38px] font-bold leading-none tracking-[-0.04em] text-ink outline-none"
                  placeholder="0"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-ink-soft">
                <span>Minimum {formatNaira(MIN_AMOUNT)}</span>
                <span>Maximum {formatNaira(MAX_AMOUNT)} per request</span>
              </div>

              <p className="field-label mt-5">Suggested</p>
              <div className="grid grid-cols-3 gap-2">
                {SUGGESTED.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setAmountDigits(String(value));
                      setAmountError("");
                    }}
                    className={`chip justify-center ${amount === value ? "chip-active" : ""}`}
                  >
                    {formatNaira(value)}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-2.5 border-t border-line pt-4 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Requested cash</span>
                  <span className="num font-semibold text-ink">{formatNaira(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">
                    Delivery fee
                    <span className="ml-1.5 text-[9.5px] text-ink-soft/70">(rider + handover)</span>
                  </span>
                  <span className="num font-semibold text-ink">{formatNaira(fee)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-[13px] font-bold text-ink">Total to pay</span>
                  <span className="num text-[20px] font-bold text-ink">{formatNaira(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-line bg-white/60 px-4 py-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-violet" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <p className="text-[11px] text-ink-soft">
                Estimated delivery <span className="font-semibold text-ink">30–60 minutes</span> within Lagos.
              </p>
            </div>

            {amountError && <Notice tone="error" className="mt-4">{amountError}</Notice>}

            <button type="button" onClick={goToPayment} className="btn btn-primary btn-lg btn-block mt-5">
              Continue to payment
            </button>
          </div>
        )}

        {stage === 2 && (
          <div className="rise">
            <p className="eyebrow">Payment</p>
            <h1 className="display mt-2 text-[40px] text-ink">How would you like to pay?</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              Your card is charged once. Cash is only prepared after the payment provider confirms it.
            </p>

            <div className="mt-6 space-y-2.5">
              <div className="app-card flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-soft text-violet-deep">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
                    <path d="M2.5 10h19M6 15h4" />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-ink">Nigerian Naira</p>
                  <p className="text-[10.5px] text-ink-soft">Card or bank transfer · NGN</p>
                </div>
                <span className="badge badge-success"><span className="badge-dot" />Available</span>
              </div>

              {[
                ["US Dollar", "USD", "Card payment"],
                ["British Pound", "GBP", "Card payment"],
                ["Cryptocurrency", "Crypto", "Stablecoin settlement"],
              ].map(([name, code, sub]) => (
                <div key={code} className="flex items-center gap-3 rounded-[20px] border border-line bg-white/50 p-4 opacity-65">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-ink-soft">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-ink">{name}</p>
                    <p className="text-[10.5px] text-ink-soft">{sub} · {code}</p>
                  </div>
                  <span className="badge badge-neutral">Coming soon</span>
                </div>
              ))}
            </div>

            <p className="field-label mt-6">Pay with</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ["Debit card", "Visa, Mastercard, Verve"],
                ["Bank transfer", "Pay from any Nigerian bank"],
              ].map(([method, sub]) => {
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      active ? "border-violet bg-violet-soft" : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-violet" : "border-line-strong"}`}>
                        {active && <span className="h-2 w-2 rounded-full bg-violet" />}
                      </span>
                      {active && <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-violet-deep">Selected</span>}
                    </div>
                    <p className="mt-3 text-[12.5px] font-semibold text-ink">{method}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-ink-soft">{sub}</p>
                  </button>
                );
              })}
            </div>

            <Notice tone="warning" className="mt-5">
              This prototype uses a simulated provider. No real card is charged and no cash is dispatched.
            </Notice>

            <div className="mt-4 rounded-2xl border border-line bg-white/60 p-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-soft">Paying today</span>
                <span className="num font-bold text-ink">{formatNaira(total)}</span>
              </div>
              <p className="mt-1 text-[10px] text-ink-soft">Includes {formatNaira(fee)} delivery fee.</p>
            </div>

            <button type="button" onClick={() => { setStage(3); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn btn-primary btn-lg btn-block mt-5">
              Review request
            </button>
          </div>
        )}

        {stage === 3 && (
          <div className="rise">
            <p className="eyebrow">Review</p>
            <h1 className="display mt-2 text-[40px] text-ink">One last look.</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              Check the details before you pay. Your transaction reference is created when the request is submitted.
            </p>

            <div className="app-card mt-6 overflow-hidden">
              <div className="bg-ink px-5 py-5 text-white">
                <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">
                  {recipientKind === "self" ? "You receive" : "They receive"}
                </p>
                <p className="num mt-1 text-[38px] font-bold leading-none tracking-[-0.04em]">{formatNaira(amount)}</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[11px] text-white/55">You pay</span>
                  <span className="num text-[13px] font-semibold">{formatNaira(total)}</span>
                </div>
              </div>

              <div className="divide-y divide-line px-5">
                <div className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="field-label !mb-1">{recipientKind === "self" ? "Your details" : "Recipient"}</p>
                    <p className="text-[13px] font-semibold text-ink">{form.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-soft">{formatNgPhone(toNgPhone(form.phone) ?? form.phone)}</p>
                    <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-ink-soft">
                      {form.street}, {form.area}, {form.city}
                      {form.instructions ? ` · ${form.instructions}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => setStage(0)} className="shrink-0 text-[10px] font-semibold text-violet hover:underline">
                    Edit
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="field-label !mb-1">Payment method</p>
                    <p className="text-[13px] font-semibold text-ink">{paymentMethod}</p>
                    <p className="mt-0.5 text-[11px] text-ink-soft">Nigerian Naira · Demo provider</p>
                  </div>
                  <button type="button" onClick={() => setStage(2)} className="shrink-0 text-[10px] font-semibold text-violet hover:underline">
                    Edit
                  </button>
                </div>

                <div className="py-4 text-[12px]">
                  <div className="flex justify-between py-1">
                    <span className="text-ink-soft">{recipientKind === "self" ? "Cash to you" : "Cash to recipient"}</span>
                    <span className="num font-medium text-ink">{formatNaira(amount)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-soft">Delivery fee</span>
                    <span className="num font-medium text-ink">{formatNaira(fee)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-line pt-2.5">
                    <span className="font-bold text-ink">Total payment</span>
                    <span className="num font-bold text-ink">{formatNaira(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-violet-soft/70 px-4 py-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-violet-deep" aria-hidden>
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <p className="text-[10.5px] leading-relaxed text-violet-deep">
                {recipientKind === "self"
                  ? "You'll confirm handoff with a one-time code sent by SMS. The rider cannot complete the delivery without it."
                  : "Your recipient confirms handoff with a one-time code sent by SMS. The rider cannot complete the delivery without it."}
              </p>
            </div>

            {payError && <Notice tone="error" className="mt-4">{payError}</Notice>}

            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="btn btn-primary btn-lg btn-block mt-5"
            >
              {paying ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processing payment…
                </>
              ) : (
                <>Pay and request cash</>
              )}
            </button>
            <p className="mt-3 text-center text-[9.5px] leading-relaxed text-ink-soft">
              Demo checkout. No real money moves. By continuing you agree to Dash&apos;s terms and refund policy.
            </p>
            <LegalDisclaimer className="mt-4 text-center" />
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3 text-[9.5px] text-ink-soft/70">
          <Link href="/account/help" className="hover:text-ink">Need help?</Link>
          <span>·</span>
          <span>Fees shown upfront, always</span>
        </div>
      </main>

      {payPhase && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/55 px-6 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-[26px] bg-white p-6 text-center shadow-2xl rise">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-soft text-violet">
              {payPhase === "provider" ? (
                <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
                  <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 12.5l5 5L20 6.5" />
                </svg>
              )}
            </div>
            <p className="mt-4 text-[15px] font-bold text-ink">
              {payPhase === "provider" ? "Confirming payment" : "Payment verified"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
              {payPhase === "provider"
                ? "Waiting for the payment provider to confirm the charge."
                : "We're preparing your cash delivery."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${payPhase === "provider" ? "bg-violet" : "bg-line"}`} />
              <span className={`h-1.5 w-1.5 rounded-full ${payPhase === "verifying" ? "bg-violet" : "bg-line"}`} />
            </div>
            <p className="mt-4 text-[8.5px] uppercase tracking-[0.12em] text-ink-soft/60">
              Simulated provider webhook
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SendPage() {
  return <SendFlow />;
}
