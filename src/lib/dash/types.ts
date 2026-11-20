export type TxStatus =
  | "CREATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "CASH_PREPARING"
  | "RIDER_ASSIGNED"
  | "CASH_COLLECTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED"
  | "VENDOR_UNAVAILABLE"
  | "RIDER_UNAVAILABLE"
  | "DELIVERY_FAILED"
  | "DELIVERY_CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED";

export type Actor = "SENDER" | "RIDER" | "VENDOR" | "OPS" | "SYSTEM";

export type TimelineEvent = {
  status: TxStatus;
  at: string;
  note: string;
  actor: Actor;
};

export type CurrencyCode = "NGN" | "USD" | "GBP" | "CRYPTO";

export type Recipient = {
  id: string;
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  instructions?: string;
  saved?: boolean;
  lastUsedAt?: string;
};

export type PaymentDetails = {
  provider: "demo" | "paystack" | "flutterwave";
  providerReference: string;
  idempotencyKey: string;
  verifiedAt: string;
};

export type Receipt = {
  receiptNumber: string;
  issuedAt: string;
};

export type Transaction = {
  id: string;
  reference: string;
  status: TxStatus;
  createdAt: string;
  updatedAt: string;
  recipient: Recipient;
  amount: number;
  deliveryFee: number;
  serviceCharge: number;
  total: number;
  currency: CurrencyCode;
  fxRate?: number;
  fxAmount?: number;
  paymentMethod: string;
  etaMinutes?: number;
  vendorId?: string;
  riderId?: string;
  riderAcceptedAt?: string;
  otp: string;
  otpVerifiedAt?: string;
  payment?: PaymentDetails;
  receipt?: Receipt;
  timeline: TimelineEvent[];
  disputeId?: string;
  failureReason?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedAt: string;
  verified: boolean;
};

export type Vendor = {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  available: boolean;
  liquidity: number;
  rating: number;
  jobsToday: number;
};

export type Rider = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  status: "online" | "offline" | "busy";
  rating: number;
  jobsToday: number;
  location: string;
  joinedAt: string;
};

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REFUNDED";

export type Dispute = {
  id: string;
  reference: string;
  transactionId: string;
  reason: string;
  detail: string;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
};

export type DashState = {
  version: number;
  customer: Customer;
  recipients: Recipient[];
  vendors: Vendor[];
  riders: Rider[];
  transactions: Transaction[];
  disputes: Dispute[];
  riderId: string;
  auditLog: { id: string; at: string; action: string; actor: Actor; reference?: string }[];
};

export type NewRequestInput = {
  recipient: Omit<Recipient, "id" | "saved" | "lastUsedAt">;
  amount: number;
  deliveryFee: number;
  serviceCharge: number;
  currency: CurrencyCode;
  paymentMethod: string;
  fxRate?: number;
  fxAmount?: number;
  saveRecipient?: boolean;
};

export type ActionResult = { ok: true } | { ok: false; error: string };
