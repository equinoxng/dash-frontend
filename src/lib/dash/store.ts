"use client";

import type {
  ActionResult,
  Actor,
  Customer,
  DashState,
  Dispute,
  NewRequestInput,
  Recipient,
  Rider,
  TimelineEvent,
  Transaction,
  TxStatus,
  Vendor,
} from "./types";
import { computeDeliveryFee } from "./format";
import { isActiveStatus } from "./status";

const STORAGE_KEY = "dash:demo:v3";
export const DASH_EVENT = "dash:store-update";
const VERSION = 3;

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const daysAgo = (days: number, extraMinutes = 0) => ago(days * 1440 + extraMinutes);

function ev(status: TxStatus, minutesAgo: number, note: string, actor: Actor): TimelineEvent {
  return { status, at: ago(minutesAgo), note, actor };
}

function makeSeed(): DashState {
  const customer: Customer = {
    id: "cus_ada",
    name: "Ada Okafor",
    phone: "+2348012345678",
    email: "ada.okafor@email.com",
    joinedAt: daysAgo(84),
    verified: true,
  };

  const recipients: Recipient[] = [
    {
      id: "rec_emeka",
      name: "Emeka Obi",
      phone: "+2348034567890",
      street: "14 Adeola Odeku Street",
      area: "Victoria Island",
      city: "Lagos",
      instructions: "Call on arrival. White gate beside the Zenith ATM.",
      saved: true,
      lastUsedAt: ago(42),
    },
    {
      id: "rec_ngozi",
      name: "Ngozi Uche",
      phone: "+2348067890123",
      street: "7 Fola Osibo Close",
      area: "Lekki Phase 1",
      city: "Lagos",
      instructions: "Second building after the yellow kiosk.",
      saved: true,
      lastUsedAt: daysAgo(2),
    },
    {
      id: "rec_tunde",
      name: "Tunde Balogun",
      phone: "+2348090123456",
      street: "23 Herbert Macaulay Way",
      area: "Yaba",
      city: "Lagos",
      saved: true,
      lastUsedAt: daysAgo(6),
    },
    {
      id: "rec_chika",
      name: "Chika Eze",
      phone: "+2348123456789",
      street: "5 Admiralty Road",
      area: "Lekki Phase 1",
      city: "Lagos",
      saved: true,
      lastUsedAt: daysAgo(13),
    },
  ];

  const vendors: Vendor[] = [
    {
      id: "v_vi",
      name: "VI Cash Hub",
      area: "Victoria Island",
      address: "1 Ligali Ayorinde Street, Victoria Island",
      phone: "+2348011110001",
      available: true,
      liquidity: 680_000,
      rating: 4.9,
      jobsToday: 12,
    },
    {
      id: "v_lekki",
      name: "Lekki Notes",
      area: "Lekki Phase 1",
      address: "12 Admiralty Way, Lekki Phase 1",
      phone: "+2348011110002",
      available: true,
      liquidity: 420_000,
      rating: 4.8,
      jobsToday: 8,
    },
    {
      id: "v_ikeja",
      name: "Ikeja Cash Point",
      area: "Ikeja GRA",
      address: "38 Opebi Road, Ikeja",
      phone: "+2348011110003",
      available: true,
      liquidity: 950_000,
      rating: 4.7,
      jobsToday: 6,
    },
    {
      id: "v_yaba",
      name: "Yaba Kiosk 04",
      area: "Yaba",
      address: "9 Alagomeji Street, Yaba",
      phone: "+2348011110004",
      available: false,
      liquidity: 120_000,
      rating: 4.6,
      jobsToday: 3,
    },
  ];

  const riders: Rider[] = [
    {
      id: "r_musa",
      name: "Musa Ibrahim",
      phone: "+2348091110001",
      vehicle: "Motorcycle",
      plate: "LAG-482-QR",
      status: "busy",
      rating: 4.9,
      jobsToday: 4,
      location: "Victoria Island",
      joinedAt: daysAgo(210),
    },
    {
      id: "r_tunde",
      name: "Tunde Akin",
      phone: "+2348091110002",
      vehicle: "Motorcycle",
      plate: "LAG-731-BK",
      status: "online",
      rating: 4.8,
      jobsToday: 2,
      location: "Lekki Phase 1",
      joinedAt: daysAgo(140),
    },
    {
      id: "r_kelechi",
      name: "Kelechi Nwosu",
      phone: "+2348091110003",
      vehicle: "Bicycle",
      plate: "LAG-119-CV",
      status: "online",
      rating: 4.7,
      jobsToday: 3,
      location: "Yaba",
      joinedAt: daysAgo(96),
    },
    {
      id: "r_femi",
      name: "Femi Adeyemi",
      phone: "+2348091110004",
      vehicle: "Motorcycle",
      plate: "LAG-903-TT",
      status: "offline",
      rating: 4.6,
      jobsToday: 0,
      location: "Ikeja GRA",
      joinedAt: daysAgo(58),
    },
    {
      id: "r_joy",
      name: "Joy Okonkwo",
      phone: "+2348091110005",
      vehicle: "Car",
      plate: "LAG-226-AA",
      status: "online",
      rating: 4.9,
      jobsToday: 5,
      location: "Victoria Island",
      joinedAt: daysAgo(310),
    },
  ];

  const tx1: Transaction = {
    id: "tx_k4m2q8",
    reference: "DSH-K4M2Q8",
    status: "IN_TRANSIT",
    createdAt: ago(42),
    updatedAt: ago(9),
    recipient: recipients[0],
    amount: 20_000,
    deliveryFee: 500,
    serviceCharge: 0,
    total: 20_500,
    currency: "NGN",
    paymentMethod: "Debit card · Demo",
    etaMinutes: 14,
    vendorId: "v_vi",
    riderId: "r_musa",
    otp: "4821",
    payment: {
      provider: "demo",
      providerReference: "DEMO-PAY-884120",
      idempotencyKey: "idem_seed_1",
      verifiedAt: ago(38),
    },
    timeline: [
      ev("CREATED", 42, "Cash request created.", "SENDER"),
      ev("PAYMENT_PENDING", 41, "Payment session opened with provider.", "SYSTEM"),
      ev("PAYMENT_CONFIRMED", 38, "Payment verified by provider webhook.", "SYSTEM"),
      ev("CASH_PREPARING", 31, "VI Cash Hub confirmed ₦20,000 is available.", "VENDOR"),
      ev("RIDER_ASSIGNED", 21, "Musa Ibrahim accepted the delivery.", "OPS"),
      ev("CASH_COLLECTED", 12, "Musa collected ₦20,000 from VI Cash Hub.", "RIDER"),
      ev("IN_TRANSIT", 9, "Rider is on the way to Victoria Island.", "RIDER"),
    ],
  };

  const tx2: Transaction = {
    id: "tx_p7x3n5",
    reference: "DSH-P7X3N5",
    status: "CASH_PREPARING",
    createdAt: ago(18),
    updatedAt: ago(8),
    recipient: recipients[1],
    amount: 10_000,
    deliveryFee: 500,
    serviceCharge: 0,
    total: 10_500,
    currency: "NGN",
    paymentMethod: "Bank transfer · Demo",
    etaMinutes: 28,
    vendorId: "v_lekki",
    otp: "7319",
    payment: {
      provider: "demo",
      providerReference: "DEMO-PAY-884209",
      idempotencyKey: "idem_seed_2",
      verifiedAt: ago(14),
    },
    timeline: [
      ev("CREATED", 18, "Cash request created.", "SENDER"),
      ev("PAYMENT_PENDING", 17, "Payment session opened with provider.", "SYSTEM"),
      ev("PAYMENT_CONFIRMED", 14, "Payment verified by provider webhook.", "SYSTEM"),
      ev("CASH_PREPARING", 8, "Lekki Notes confirmed ₦10,000 is available.", "VENDOR"),
    ],
  };

  const tx3: Transaction = {
    id: "tx_b9r6t1",
    reference: "DSH-B9R6T1",
    status: "COMPLETED",
    createdAt: daysAgo(1, 120),
    updatedAt: daysAgo(1, 30),
    recipient: recipients[2],
    amount: 50_000,
    deliveryFee: 750,
    serviceCharge: 0,
    total: 50_750,
    currency: "NGN",
    paymentMethod: "Debit card · Demo",
    etaMinutes: 0,
    vendorId: "v_yaba",
    riderId: "r_kelechi",
    otp: "6052",
    otpVerifiedAt: daysAgo(1, 34),
    payment: {
      provider: "demo",
      providerReference: "DEMO-PAY-880011",
      idempotencyKey: "idem_seed_3",
      verifiedAt: daysAgo(1, 110),
    },
    receipt: { receiptNumber: "RCPT-B9R6T1", issuedAt: daysAgo(1, 34) },
    timeline: [
      ev("CREATED", 1 * 1440 + 120, "Cash request created.", "SENDER"),
      ev("PAYMENT_PENDING", 1 * 1440 + 118, "Payment session opened with provider.", "SYSTEM"),
      ev("PAYMENT_CONFIRMED", 1 * 1440 + 110, "Payment verified by provider webhook.", "SYSTEM"),
      ev("CASH_PREPARING", 1 * 1440 + 95, "Yaba Kiosk 04 confirmed cash available.", "VENDOR"),
      ev("RIDER_ASSIGNED", 1 * 1440 + 78, "Kelechi Nwosu accepted the delivery.", "OPS"),
      ev("CASH_COLLECTED", 1 * 1440 + 61, "Kelechi collected ₦50,000.", "RIDER"),
      ev("IN_TRANSIT", 1 * 1440 + 52, "Rider left the vendor.", "RIDER"),
      ev("DELIVERED", 1 * 1440 + 34, "Recipient OTP verified at the door.", "RIDER"),
      ev("COMPLETED", 1 * 1440 + 30, "Receipt issued and settlement queued.", "SYSTEM"),
    ],
  };

  const tx4: Transaction = {
    id: "tx_h2w8c4",
    reference: "DSH-H2W8C4",
    status: "PAYMENT_PENDING",
    createdAt: ago(6),
    updatedAt: ago(5),
    recipient: recipients[3],
    amount: 5_000,
    deliveryFee: 500,
    serviceCharge: 0,
    total: 5_500,
    currency: "NGN",
    paymentMethod: "Debit card · Demo",
    etaMinutes: 40,
    otp: "2148",
    timeline: [
      ev("CREATED", 6, "Cash request created.", "SENDER"),
      ev("PAYMENT_PENDING", 5, "Waiting for the payment provider to confirm.", "SYSTEM"),
    ],
  };

  const tx5: Transaction = {
    id: "tx_q5j1v7",
    reference: "DSH-Q5J1V7",
    status: "REFUND_PENDING",
    createdAt: daysAgo(2, 90),
    updatedAt: daysAgo(2, 20),
    recipient: {
      id: "rec_bola",
      name: "Bola Ade",
      phone: "+2348076543210",
      street: "18 Bode Thomas Street",
      area: "Surulere",
      city: "Lagos",
    },
    amount: 15_000,
    deliveryFee: 500,
    serviceCharge: 0,
    total: 15_500,
    currency: "NGN",
    paymentMethod: "Debit card · Demo",
    etaMinutes: 0,
    vendorId: "v_yaba",
    riderId: "r_kelechi",
    otp: "9083",
    failureReason: "Recipient unreachable after 15 minutes at the delivery address.",
    payment: {
      provider: "demo",
      providerReference: "DEMO-PAY-879340",
      idempotencyKey: "idem_seed_5",
      verifiedAt: daysAgo(2, 85),
    },
    timeline: [
      ev("CREATED", 2 * 1440 + 90, "Cash request created.", "SENDER"),
      ev("PAYMENT_PENDING", 2 * 1440 + 88, "Payment session opened.", "SYSTEM"),
      ev("PAYMENT_CONFIRMED", 2 * 1440 + 85, "Payment verified by provider webhook.", "SYSTEM"),
      ev("CASH_PREPARING", 2 * 1440 + 75, "Vendor confirmed cash available.", "VENDOR"),
      ev("RIDER_ASSIGNED", 2 * 1440 + 60, "Kelechi Nwosu accepted the delivery.", "OPS"),
      ev("CASH_COLLECTED", 2 * 1440 + 48, "Kelechi collected ₦15,000.", "RIDER"),
      ev("IN_TRANSIT", 2 * 1440 + 40, "Rider left the vendor.", "RIDER"),
      ev("DELIVERY_FAILED", 2 * 1440 + 25, "Recipient unreachable at the delivery address.", "RIDER"),
      ev("REFUND_PENDING", 2 * 1440 + 20, "Refund queued to the original payment method.", "OPS"),
    ],
  };

  const tx6: Transaction = {
    id: "tx_z3n9f2",
    reference: "DSH-Z3N9F2",
    status: "DISPUTED",
    createdAt: daysAgo(3, 260),
    updatedAt: daysAgo(3, 40),
    recipient: recipients[1],
    amount: 30_000,
    deliveryFee: 750,
    serviceCharge: 0,
    total: 30_750,
    currency: "NGN",
    paymentMethod: "Debit card · Demo",
    etaMinutes: 0,
    vendorId: "v_lekki",
    riderId: "r_joy",
    otp: "5571",
    otpVerifiedAt: daysAgo(3, 45),
    payment: {
      provider: "demo",
      providerReference: "DEMO-PAY-876102",
      idempotencyKey: "idem_seed_6",
      verifiedAt: daysAgo(3, 255),
    },
    receipt: { receiptNumber: "RCPT-Z3N9F2", issuedAt: daysAgo(3, 45) },
    timeline: [
      ev("CREATED", 3 * 1440 + 260, "Cash request created.", "SENDER"),
      ev("PAYMENT_PENDING", 3 * 1440 + 258, "Payment session opened.", "SYSTEM"),
      ev("PAYMENT_CONFIRMED", 3 * 1440 + 255, "Payment verified by provider webhook.", "SYSTEM"),
      ev("CASH_PREPARING", 3 * 1440 + 240, "Vendor confirmed cash available.", "VENDOR"),
      ev("RIDER_ASSIGNED", 3 * 1440 + 190, "Joy Okonkwo accepted the delivery.", "OPS"),
      ev("CASH_COLLECTED", 3 * 1440 + 160, "Joy collected ₦30,000.", "RIDER"),
      ev("IN_TRANSIT", 3 * 1440 + 150, "Rider left the vendor.", "RIDER"),
      ev("DELIVERED", 3 * 1440 + 45, "Recipient OTP verified.", "RIDER"),
      ev("COMPLETED", 3 * 1440 + 44, "Receipt issued.", "SYSTEM"),
      ev("DISPUTED", 3 * 1440 + 40, "Sender reported a short cash handoff.", "SENDER"),
    ],
  };

  const disputes: Dispute[] = [
    {
      id: "dsp_1001",
      reference: "DSP-1001",
      transactionId: tx6.id,
      reason: "Cash amount was short",
      detail:
        "Recipient says the envelope contained ₦25,000 instead of ₦30,000. Rider receipt shows the full amount was collected.",
      status: "UNDER_REVIEW",
      createdAt: daysAgo(3, 40),
      updatedAt: daysAgo(2, 300),
    },
  ];

  return {
    version: VERSION,
    customer,
    recipients,
    vendors,
    riders,
    transactions: [tx1, tx2, tx4, tx5, tx6, tx3],
    disputes,
    riderId: "r_musa",
    auditLog: [
      { id: "aud_1", at: ago(38), action: "Payment verified by webhook for DSH-K4M2Q8", actor: "SYSTEM", reference: "DSH-K4M2Q8" },
      { id: "aud_2", at: ago(21), action: "Rider Musa Ibrahim assigned to DSH-K4M2Q8", actor: "OPS", reference: "DSH-K4M2Q8" },
      { id: "aud_3", at: ago(9), action: "Cash collected and delivery started for DSH-K4M2Q8", actor: "RIDER", reference: "DSH-K4M2Q8" },
      { id: "aud_4", at: daysAgo(2, 20), action: "Refund queued for DSH-Q5J1V7", actor: "OPS", reference: "DSH-Q5J1V7" },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

let snapshotRaw: string | null = null;
let snapshotState: DashState | null = null;

export function getState(): DashState {
  if (typeof window === "undefined") return makeSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = makeSeed();
      const serialized = JSON.stringify(seeded);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      snapshotRaw = serialized;
      snapshotState = seeded;
      return seeded;
    }
    if (raw === snapshotRaw && snapshotState) return snapshotState;
    const parsed = JSON.parse(raw) as DashState;
    if (parsed.version !== VERSION) {
      const seeded = makeSeed();
      const serialized = JSON.stringify(seeded);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      snapshotRaw = serialized;
      snapshotState = seeded;
      return seeded;
    }
    snapshotRaw = raw;
    snapshotState = parsed;
    return parsed;
  } catch {
    return makeSeed();
  }
}

function writeState(state: DashState) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, raw);
    snapshotRaw = raw;
    snapshotState = state;
    window.dispatchEvent(new Event(DASH_EVENT));
  } catch {
    // storage can be unavailable in private mode; the UI will simply not persist
  }
}

export function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStore = () => listener();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener(DASH_EVENT, onStore);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DASH_EVENT, onStore);
    window.removeEventListener("storage", onStorage);
  };
}

export function resetDemo() {
  if (typeof window === "undefined") return;
  const seeded = makeSeed();
  writeState(seeded);
}

/* ------------------------------------------------------------------ */
/* Reference + validation helpers                                      */
/* ------------------------------------------------------------------ */

const ALLOWED: Record<TxStatus, TxStatus[]> = {
  CREATED: ["PAYMENT_PENDING", "DELIVERY_CANCELLED"],
  PAYMENT_PENDING: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "DELIVERY_CANCELLED"],
  PAYMENT_CONFIRMED: ["CASH_PREPARING", "VENDOR_UNAVAILABLE", "REFUND_PENDING", "DELIVERY_CANCELLED"],
  CASH_PREPARING: ["RIDER_ASSIGNED", "VENDOR_UNAVAILABLE", "REFUND_PENDING", "DELIVERY_CANCELLED"],
  RIDER_ASSIGNED: ["CASH_COLLECTED", "RIDER_UNAVAILABLE", "DELIVERY_FAILED", "DELIVERY_CANCELLED", "REFUND_PENDING"],
  CASH_COLLECTED: ["IN_TRANSIT", "DELIVERY_FAILED"],
  IN_TRANSIT: ["DELIVERED", "DELIVERY_FAILED", "DELIVERY_CANCELLED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  PAYMENT_FAILED: ["REFUND_PENDING", "DELIVERY_CANCELLED"],
  PAYMENT_EXPIRED: ["REFUND_PENDING", "DELIVERY_CANCELLED"],
  VENDOR_UNAVAILABLE: ["CASH_PREPARING", "REFUND_PENDING", "DELIVERY_CANCELLED"],
  RIDER_UNAVAILABLE: ["RIDER_ASSIGNED", "REFUND_PENDING", "DELIVERY_CANCELLED"],
  DELIVERY_FAILED: ["REFUND_PENDING", "DELIVERY_CANCELLED"],
  DELIVERY_CANCELLED: ["REFUND_PENDING", "REFUNDED"],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: ["DISPUTED"],
  DISPUTED: ["COMPLETED", "REFUND_PENDING", "REFUNDED"],
};

export function canTransition(from: TxStatus, to: TxStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

function applyStatus(state: DashState, tx: Transaction, to: TxStatus, actor: Actor, note: string): ActionResult {
  if (tx.status === to) return { ok: true };
  if (!canTransition(tx.status, to)) {
    return { ok: false, error: `Cannot move ${tx.status} to ${to}.` };
  }
  const at = new Date().toISOString();
  tx.status = to;
  tx.updatedAt = at;
  tx.timeline.push({ status: to, at, note, actor });
  state.auditLog.unshift({
    id: uid("aud"),
    at,
    action: note,
    actor,
    reference: tx.reference,
  });
  return { ok: true };
}

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  } else {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  }
  return `DSH-${code}`;
}

function makeOtp(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(1);
    crypto.getRandomValues(bytes);
    return String(1000 + (bytes[0] % 9000));
  }
  return String(1000 + Math.floor(Math.random() * 9000));
}

export function findTransaction(state: DashState | null, idOrReference: string | undefined): Transaction | undefined {
  if (!state || !idOrReference) return undefined;
  return state.transactions.find(
    (tx) => tx.id === idOrReference || tx.reference.toLowerCase() === idOrReference.toLowerCase()
  );
}

export function vendorFor(state: DashState | null, vendorId?: string): Vendor | undefined {
  return state?.vendors.find((v) => v.id === vendorId);
}

export function riderFor(state: DashState | null, riderId?: string): Rider | undefined {
  return state?.riders.find((r) => r.id === riderId);
}

/* ------------------------------------------------------------------ */
/* Customer actions                                                    */
/* ------------------------------------------------------------------ */

export type CreateRequestResult = { ok: true; transaction: Transaction } | { ok: false; error: string };

export function createCashRequest(input: NewRequestInput): CreateRequestResult {
  const state = clone(getState());
  const at = new Date().toISOString();
  const reference = makeReference();
  const id = uid("tx");

  const recipient: Recipient = {
    ...input.recipient,
    id: uid("rec"),
    saved: Boolean(input.saveRecipient),
    lastUsedAt: at,
  };

  const tx: Transaction = {
    id,
    reference,
    status: "CREATED",
    createdAt: at,
    updatedAt: at,
    recipient,
    amount: input.amount,
    deliveryFee: input.deliveryFee,
    serviceCharge: input.serviceCharge,
    total: input.amount + input.deliveryFee + input.serviceCharge,
    currency: input.currency,
    fxRate: input.fxRate,
    fxAmount: input.fxAmount,
    paymentMethod: input.paymentMethod,
    otp: makeOtp(),
    etaMinutes: 35,
    timeline: [
      { status: "CREATED", at, note: "Cash request created.", actor: "SENDER" },
    ],
  };

  if (input.saveRecipient) {
    const existing = state.recipients.find(
      (r) => r.phone === recipient.phone && r.name.toLowerCase() === recipient.name.toLowerCase()
    );
    if (existing) {
      Object.assign(existing, { ...recipient, id: existing.id });
    } else {
      state.recipients.unshift(recipient);
    }
  }

  state.transactions.unshift(tx);
  state.auditLog.unshift({ id: uid("aud"), at, action: `Request ${reference} created`, actor: "SENDER", reference });
  writeState(state);
  return { ok: true, transaction: tx };
}

export function openPaymentSession(txId: string): ActionResult {
  const state = clone(getState());
  const tx = state.transactions.find((t) => t.id === txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.status !== "CREATED") return { ok: true };
  const result = applyStatus(state, tx, "PAYMENT_PENDING", "SYSTEM", "Payment session opened with provider.");
  if (result.ok) writeState(state);
  return result;
}

/**
 * Mirrors a verified provider webhook, never a frontend success screen.
 * Idempotent: replaying the same provider reference cannot double-apply.
 */
export function confirmPayment(
  txId: string,
  providerReference: string,
  idempotencyKey: string
): ActionResult {
  const state = clone(getState());
  const tx = state.transactions.find((t) => t.id === txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.payment?.providerReference === providerReference) return { ok: true };
  if (["PAYMENT_CONFIRMED", "CASH_PREPARING", "RIDER_ASSIGNED", "CASH_COLLECTED", "IN_TRANSIT", "DELIVERED", "COMPLETED", "DISPUTED"].includes(tx.status)) {
    return { ok: true };
  }
  if (tx.status !== "PAYMENT_PENDING") {
    return { ok: false, error: "This payment can no longer be confirmed." };
  }

  tx.payment = {
    provider: "demo",
    providerReference,
    idempotencyKey,
    verifiedAt: new Date().toISOString(),
  };

  const result = applyStatus(
    state,
    tx,
    "PAYMENT_CONFIRMED",
    "SYSTEM",
    "Payment verified by provider webhook."
  );
  if (!result.ok) return result;
  const preparing = applyStatus(
    state,
    tx,
    "CASH_PREPARING",
    "SYSTEM",
    "Request accepted. Matching a nearby cash vendor."
  );
  if (!preparing.ok) return preparing;
  writeState(state);
  return { ok: true };
}

export function markPaymentFailed(txId: string, reason = "The provider declined the payment."): ActionResult {
  const state = clone(getState());
  const tx = state.transactions.find((t) => t.id === txId);
  if (!tx) return { ok: false, error: "Request not found." };
  tx.failureReason = reason;
  const result = applyStatus(state, tx, "PAYMENT_FAILED", "SYSTEM", reason);
  if (result.ok) writeState(state);
  return result;
}

export function saveRecipient(input: Omit<Recipient, "id" | "saved" | "lastUsedAt">): { ok: true; recipient: Recipient } {
  const state = clone(getState());
  const at = new Date().toISOString();
  const existing = state.recipients.find(
    (r) => r.phone === input.phone && r.name.toLowerCase() === input.name.toLowerCase()
  );
  if (existing) {
    Object.assign(existing, { ...input, saved: true, lastUsedAt: at });
    writeState(state);
    return { ok: true, recipient: existing };
  }
  const recipient: Recipient = { ...input, id: uid("rec"), saved: true, lastUsedAt: at };
  state.recipients.unshift(recipient);
  writeState(state);
  return { ok: true, recipient };
}

export function updateRecipient(
  id: string,
  patch: Omit<Recipient, "id" | "saved" | "lastUsedAt">
): ActionResult {
  const state = clone(getState());
  const recipient = state.recipients.find((r) => r.id === id);
  if (!recipient) return { ok: false, error: "Recipient not found." };
  Object.assign(recipient, patch, { saved: true });
  writeState(state);
  return { ok: true };
}

export function deleteRecipient(id: string): ActionResult {
  const state = clone(getState());
  state.recipients = state.recipients.filter((r) => r.id !== id);
  writeState(state);
  return { ok: true };
}

export function updateCustomer(patch: Partial<Pick<Customer, "name" | "phone" | "email">>): ActionResult {
  const state = clone(getState());
  Object.assign(state.customer, patch);
  state.auditLog.unshift({
    id: uid("aud"),
    at: new Date().toISOString(),
    action: "Customer profile updated",
    actor: "SENDER",
  });
  writeState(state);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Ops actions                                                         */
/* ------------------------------------------------------------------ */

function txAndState(txId: string) {
  const state = clone(getState());
  const tx = state.transactions.find((t) => t.id === txId);
  return { state, tx };
}

export function assignVendor(txId: string, vendorId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  const vendor = state.vendors.find((v) => v.id === vendorId);
  if (!vendor) return { ok: false, error: "Vendor not found." };
  if (!vendor.available) return { ok: false, error: `${vendor.name} is currently paused.` };

  let moved = false;
  if (tx.status === "PAYMENT_CONFIRMED") {
    const result = applyStatus(
      state,
      tx,
      "CASH_PREPARING",
      "OPS",
      `${vendor.name} assigned and confirmed cash availability.`
    );
    if (!result.ok) return result;
    moved = true;
  } else if (tx.status !== "CASH_PREPARING") {
    return { ok: false, error: "Vendor can only be assigned after payment is confirmed." };
  }

  tx.vendorId = vendorId;
  vendor.jobsToday += 1;
  tx.updatedAt = new Date().toISOString();
  if (!moved) {
    tx.timeline.push({
      status: tx.status,
      at: tx.updatedAt,
      note: `Cash vendor changed to ${vendor.name}.`,
      actor: "OPS",
    });
  }
  state.auditLog.unshift({
    id: uid("aud"),
    at: tx.updatedAt,
    action: `Vendor ${vendor.name} assigned to ${tx.reference}`,
    actor: "OPS",
    reference: tx.reference,
  });
  writeState(state);
  return { ok: true };
}

export function assignRider(txId: string, riderId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  const rider = state.riders.find((r) => r.id === riderId);
  if (!rider) return { ok: false, error: "Rider not found." };
  if (rider.status === "offline") return { ok: false, error: `${rider.name} is offline.` };
  if (tx.status !== "CASH_PREPARING" && tx.status !== "RIDER_ASSIGNED") {
    return { ok: false, error: "Cash must be preparing before a rider can be assigned." };
  }

  const previousRider = state.riders.find((r) => r.id === tx.riderId);
  const reassigning = tx.status === "RIDER_ASSIGNED" && Boolean(tx.riderId) && tx.riderId !== riderId;

  if (tx.status === "CASH_PREPARING") {
    const moved = applyStatus(
      state,
      tx,
      "RIDER_ASSIGNED",
      "OPS",
      `${rider.name} assigned to collect the cash.`
    );
    if (!moved.ok) return moved;
  }

  tx.riderId = riderId;
  tx.riderAcceptedAt = undefined;
  tx.updatedAt = new Date().toISOString();
  rider.status = "busy";
  rider.jobsToday += 1;
  if (previousRider && previousRider.id !== rider.id) {
    previousRider.status = "online";
  }
  if (reassigning) {
    tx.timeline.push({
      status: "RIDER_ASSIGNED",
      at: tx.updatedAt,
      note: `Reassigned to ${rider.name} to collect the cash.`,
      actor: "OPS",
    });
  }
  state.auditLog.unshift({
    id: uid("aud"),
    at: tx.updatedAt,
    action: `Rider ${rider.name} assigned to ${tx.reference}`,
    actor: "OPS",
    reference: tx.reference,
  });
  writeState(state);
  return { ok: true };
}

export function riderAcceptJob(txId: string, riderId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.riderId !== riderId) return { ok: false, error: "This job is not assigned to you." };
  if (tx.riderAcceptedAt) return { ok: true };
  if (["CASH_COLLECTED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(tx.status)) return { ok: true };
  if (tx.status !== "RIDER_ASSIGNED") {
    return { ok: false, error: "This job is not ready to accept yet." };
  }

  const at = new Date().toISOString();
  tx.riderAcceptedAt = at;
  tx.updatedAt = at;
  tx.timeline.push({
    status: "RIDER_ASSIGNED",
    at,
    note: "Rider accepted the job and is heading to the cash vendor.",
    actor: "RIDER",
  });
  state.auditLog.unshift({
    id: uid("aud"),
    at,
    action: `Rider accepted ${tx.reference}`,
    actor: "RIDER",
    reference: tx.reference,
  });
  writeState(state);
  return { ok: true };
}

export function riderCollectCash(txId: string, riderId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.riderId !== riderId) return { ok: false, error: "This job is not assigned to you." };
  if (tx.status === "CASH_COLLECTED" || tx.status === "IN_TRANSIT" || tx.status === "COMPLETED") return { ok: true };
  if (tx.status === "RIDER_ASSIGNED" && !tx.riderAcceptedAt) {
    return { ok: false, error: "Accept this job before collecting the cash." };
  }
  const vendor = state.vendors.find((v) => v.id === tx.vendorId);
  const result = applyStatus(
    state,
    tx,
    "CASH_COLLECTED",
    "RIDER",
    `${vendor?.name ?? "Vendor"} handed over ₦${tx.amount.toLocaleString("en-NG")}.`
  );
  if (result.ok) writeState(state);
  return result;
}

export function riderStartTransit(txId: string, riderId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.riderId !== riderId) return { ok: false, error: "This job is not assigned to you." };
  if (tx.status === "IN_TRANSIT" || tx.status === "COMPLETED") return { ok: true };
  if (tx.status !== "CASH_COLLECTED") return { ok: false, error: "Confirm cash collection first." };
  const result = applyStatus(state, tx, "IN_TRANSIT", "RIDER", "Rider is on the way to the recipient.");
  if (result.ok) writeState(state);
  return result;
}

export function riderVerifyOtp(txId: string, riderId: string, otp: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.riderId !== riderId) return { ok: false, error: "This job is not assigned to you." };
  if (tx.status === "COMPLETED" || tx.status === "DELIVERED") return { ok: true };
  if (tx.status !== "IN_TRANSIT") return { ok: false, error: "Start the delivery before verifying handoff." };
  if (otp.replace(/\D/g, "") !== tx.otp) {
    return { ok: false, error: "That code doesn't match. Ask the recipient to read it again." };
  }

  const at = new Date().toISOString();
  tx.otpVerifiedAt = at;
  const delivered = applyStatus(
    state,
    tx,
    "DELIVERED",
    "RIDER",
    "Recipient OTP verified at the door. Cash handed over."
  );
  if (!delivered.ok) return delivered;

  tx.receipt = { receiptNumber: `RCPT-${tx.reference.replace("DSH-", "")}`, issuedAt: at };
  const completed = applyStatus(
    state,
    tx,
    "COMPLETED",
    "SYSTEM",
    "Delivery complete. Sender notified and settlement queued."
  );
  if (!completed.ok) return completed;

  const rider = state.riders.find((r) => r.id === riderId);
  if (rider) {
    rider.status = "online";
    rider.jobsToday += 1;
  }
  writeState(state);
  return { ok: true };
}

export function riderMarkFailed(txId: string, riderId: string, reason: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  if (tx.riderId !== riderId) return { ok: false, error: "This job is not assigned to you." };
  tx.failureReason = reason;
  const result = applyStatus(state, tx, "DELIVERY_FAILED", "RIDER", reason);
  if (result.ok) {
    const rider = state.riders.find((r) => r.id === riderId);
    if (rider) rider.status = "online";
    writeState(state);
  }
  return result;
}

export function markDeliveryFailed(txId: string, reason: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  tx.failureReason = reason;
  const result = applyStatus(state, tx, "DELIVERY_FAILED", "OPS", reason);
  if (result.ok) {
    const rider = state.riders.find((r) => r.id === tx.riderId);
    if (rider) rider.status = "online";
    writeState(state);
  }
  return result;
}

export function queueRefund(txId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  const result = applyStatus(
    state,
    tx,
    "REFUND_PENDING",
    "OPS",
    "Refund queued to the original payment method."
  );
  if (result.ok) writeState(state);
  return result;
}

export function markRefunded(txId: string): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  const result = applyStatus(state, tx, "REFUNDED", "SYSTEM", "Refund settled by payment provider.");
  if (result.ok) {
    const dispute = state.disputes.find((d) => d.transactionId === tx.id);
    if (dispute) {
      dispute.status = "REFUNDED";
      dispute.updatedAt = new Date().toISOString();
      dispute.resolution = "Refund settled to the sender.";
    }
    writeState(state);
  }
  return result;
}

export function cancelTransaction(txId: string, actor: Actor = "OPS", note = "Delivery cancelled."): ActionResult {
  const { state, tx } = txAndState(txId);
  if (!tx) return { ok: false, error: "Request not found." };
  const result = applyStatus(state, tx, "DELIVERY_CANCELLED", actor, note);
  if (result.ok) {
    const rider = state.riders.find((r) => r.id === tx.riderId);
    if (rider) rider.status = "online";
    writeState(state);
  }
  return result;
}

export function setVendorAvailability(vendorId: string, available: boolean): ActionResult {
  const state = clone(getState());
  const vendor = state.vendors.find((v) => v.id === vendorId);
  if (!vendor) return { ok: false, error: "Vendor not found." };
  vendor.available = available;
  state.auditLog.unshift({
    id: uid("aud"),
    at: new Date().toISOString(),
    action: `${vendor.name} ${available ? "resumed" : "paused"}`,
    actor: "OPS",
  });
  writeState(state);
  return { ok: true };
}

export function addVendor(input: Omit<Vendor, "id" | "jobsToday" | "rating">): ActionResult {
  const state = clone(getState());
  state.vendors.push({ ...input, id: uid("v"), jobsToday: 0, rating: 4.8 });
  state.auditLog.unshift({
    id: uid("aud"),
    at: new Date().toISOString(),
    action: `Vendor ${input.name} added`,
    actor: "OPS",
  });
  writeState(state);
  return { ok: true };
}

export function setRiderStatus(riderId: string, status: Rider["status"]): ActionResult {
  const state = clone(getState());
  const rider = state.riders.find((r) => r.id === riderId);
  if (!rider) return { ok: false, error: "Rider not found." };
  rider.status = status;
  state.auditLog.unshift({
    id: uid("aud"),
    at: new Date().toISOString(),
    action: `${rider.name} marked ${status}`,
    actor: "OPS",
  });
  writeState(state);
  return { ok: true };
}

export function addRider(input: Omit<Rider, "id" | "jobsToday" | "rating" | "joinedAt">): ActionResult {
  const state = clone(getState());
  state.riders.push({
    ...input,
    id: uid("r"),
    jobsToday: 0,
    rating: 4.8,
    joinedAt: new Date().toISOString(),
  });
  state.auditLog.unshift({
    id: uid("aud"),
    at: new Date().toISOString(),
    action: `Rider ${input.name} added`,
    actor: "OPS",
  });
  writeState(state);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Disputes                                                            */
/* ------------------------------------------------------------------ */

export function createDispute(transactionId: string, reason: string, detail: string): { ok: true; dispute: Dispute } | { ok: false; error: string } {
  const state = clone(getState());
  const tx = state.transactions.find((t) => t.id === transactionId);
  if (!tx) return { ok: false, error: "Transaction not found." };
  const existing = state.disputes.find((d) => d.transactionId === transactionId && d.status !== "RESOLVED" && d.status !== "REFUNDED");
  if (existing) return { ok: false, error: "There is already an open dispute for this delivery." };

  const now = new Date().toISOString();
  const dispute: Dispute = {
    id: uid("dsp"),
    reference: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
    transactionId,
    reason,
    detail,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };
  state.disputes.unshift(dispute);
  tx.disputeId = dispute.id;
  if (tx.status === "COMPLETED" || tx.status === "DELIVERED") {
    applyStatus(state, tx, "DISPUTED", "SENDER", `Dispute opened: ${reason}.`);
  }
  state.auditLog.unshift({
    id: uid("aud"),
    at: now,
    action: `Dispute ${dispute.reference} opened for ${tx.reference}`,
    actor: "SENDER",
    reference: tx.reference,
  });
  writeState(state);
  return { ok: true, dispute };
}

export function updateDisputeStatus(disputeId: string, status: Dispute["status"], resolution?: string): ActionResult {
  const state = clone(getState());
  const dispute = state.disputes.find((d) => d.id === disputeId);
  if (!dispute) return { ok: false, error: "Dispute not found." };
  dispute.status = status;
  dispute.updatedAt = new Date().toISOString();
  if (resolution) dispute.resolution = resolution;
  state.auditLog.unshift({
    id: uid("aud"),
    at: dispute.updatedAt,
    action: `Dispute ${dispute.reference} marked ${status}`,
    actor: "OPS",
    reference: dispute.reference,
  });
  writeState(state);
  return { ok: true };
}

export function resolveDispute(disputeId: string, outcome: "resolved" | "refund"): ActionResult {
  const state = clone(getState());
  const dispute = state.disputes.find((d) => d.id === disputeId);
  if (!dispute) return { ok: false, error: "Dispute not found." };
  const tx = state.transactions.find((t) => t.id === dispute.transactionId);
  const now = new Date().toISOString();

  if (outcome === "refund") {
    if (tx) {
      tx.disputeId = undefined;
      const result = applyStatus(state, tx, "REFUND_PENDING", "OPS", "Dispute resolved in sender's favour. Refund queued.");
      if (!result.ok) return result;
    }
    dispute.status = "REFUNDED";
    dispute.resolution = "Resolved in the sender's favour. Full refund queued.";
  } else {
    if (tx && tx.status === "DISPUTED") {
      const result = applyStatus(state, tx, "COMPLETED", "OPS", "Dispute reviewed and closed. Delivery stands.");
      if (!result.ok) return result;
    }
    dispute.status = "RESOLVED";
    dispute.resolution = "Reviewed by operations. Delivery stands.";
  }
  dispute.updatedAt = now;
  state.auditLog.unshift({
    id: uid("aud"),
    at: now,
    action: `Dispute ${dispute.reference} ${outcome === "refund" ? "refunded" : "resolved"}`,
    actor: "OPS",
    reference: dispute.reference,
  });
  writeState(state);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Derived data                                                        */
/* ------------------------------------------------------------------ */

export function customerTransactions(state: DashState | null): Transaction[] {
  if (!state) return [];
  return [...state.transactions].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function activeTransactions(state: DashState | null): Transaction[] {
  return customerTransactions(state).filter((tx) => isActiveStatus(tx.status));
}

export function riderJobs(state: DashState | null, riderId: string): Transaction[] {
  if (!state) return [];
  return customerTransactions(state).filter(
    (tx) => tx.riderId === riderId && !["COMPLETED", "REFUNDED", "DELIVERY_CANCELLED"].includes(tx.status)
  );
}

export function riderHistory(state: DashState | null, riderId: string): Transaction[] {
  if (!state) return [];
  return customerTransactions(state).filter(
    (tx) => tx.riderId === riderId && ["COMPLETED", "REFUNDED", "DELIVERY_CANCELLED", "DELIVERY_FAILED"].includes(tx.status)
  );
}

export function totalForFee(amount: number): { fee: number; total: number } {
  const fee = computeDeliveryFee(amount);
  return { fee, total: amount + fee };
}
