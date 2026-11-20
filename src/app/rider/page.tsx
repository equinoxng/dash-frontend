"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Wordmark from "@/components/dash/Wordmark";
import Sheet from "@/components/dash/Sheet";
import Notice from "@/components/dash/Notice";
import StatusBadge from "@/components/dash/StatusBadge";
import { useDash } from "@/lib/dash/useDash";
import {
  riderAcceptJob,
  riderCollectCash,
  riderFor,
  riderHistory,
  riderJobs,
  riderMarkFailed,
  riderStartTransit,
  riderVerifyOtp,
  setRiderStatus,
  vendorFor,
} from "@/lib/dash/store";
import { formatDate, formatNaira, formatNgPhone, initials, timeAgo } from "@/lib/dash/format";
import type { ActionResult, Transaction } from "@/lib/dash/types";

type Flash = { tone: "success" | "error"; message: string };

const FAILURE_REASONS = [
  "Recipient unreachable",
  "Address could not be found",
  "Recipient refused the cash",
  "Safety concern",
  "Other",
];

function StepRail({ status }: { status: Transaction["status"] }) {
  const stage =
    status === "RIDER_ASSIGNED" ? 0 : status === "CASH_COLLECTED" ? 1 : status === "IN_TRANSIT" ? 2 : 3;

  return (
    <div className="mt-1 flex gap-1.5">
      {["Collect", "On the way", "Confirm handoff"].map((label, index) => (
        <div key={label} className="flex-1">
          <span
            className={`block h-1.5 rounded-full ${
              index < stage ? "bg-lime" : index === stage ? "bg-white/45" : "bg-white/10"
            }`}
          />
          <span
            className={`mt-1.5 block text-[8.5px] font-semibold uppercase tracking-[0.08em] ${
              index <= stage ? "text-white/60" : "text-white/25"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function OtpField({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < 3) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex gap-2.5">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
            if (!pasted) return;
            event.preventDefault();
            onChange(pasted.split("").concat(["", "", "", ""]).slice(0, 4));
            refs.current[Math.min(pasted.length, 3)]?.focus();
          }}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Handoff code digit ${index + 1}`}
          className={`otp-box !h-14 !w-[3.25rem] ${digit ? "filled" : ""}`}
        />
      ))}
    </div>
  );
}

function RiderJobCard({
  transaction,
  riderId,
  vendorName,
  onSuccess,
}: {
  transaction: Transaction;
  riderId: string;
  vendorName?: string;
  onSuccess: (message: string) => void;
}) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [failOpen, setFailOpen] = useState(false);
  const [failReason, setFailReason] = useState(FAILURE_REASONS[0]);
  const [failDetail, setFailDetail] = useState("");

  const handle = (result: ActionResult, success: string) => {
    if (result.ok) {
      setError("");
      onSuccess(success);
    } else {
      setError(result.error);
    }
  };

  const submitOtp = () => {
    const code = otp.join("");
    if (code.length !== 4) {
      setError("Enter the full 4-digit code from the recipient.");
      return;
    }
    handle(riderVerifyOtp(transaction.id, riderId, code), "Handoff confirmed. Delivery complete.");
  };

  const reportProblem = () => {
    const detail = failDetail.trim();
    const reason = detail ? `${failReason}. ${detail}` : failReason;
    const result = riderMarkFailed(transaction.id, riderId, reason);
    if (result.ok) {
      setFailOpen(false);
      setFailDetail("");
      onSuccess("Delivery marked as failed. Operations has been notified.");
    } else {
      setError(result.error);
    }
  };

  const accepted = Boolean(transaction.riderAcceptedAt) || transaction.status !== "RIDER_ASSIGNED";

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)] rise">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
              {transaction.reference}
            </p>
            <p className="num mt-1.5 text-[38px] font-bold leading-none tracking-[-0.04em]">
              {formatNaira(transaction.amount)}
            </p>
          </div>
          <div className="text-right">
            <StatusBadge status={transaction.status} />
            <p className="mt-1.5 text-[9px] text-white/40">{timeAgo(transaction.updatedAt)}</p>
          </div>
        </div>

        <div className="mt-5">
          <StepRail status={transaction.status} />
        </div>

        {!accepted && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-lime/25 bg-lime/10 px-3.5 py-3">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime pulse-dot" />
            <div>
              <p className="text-[11.5px] font-bold text-lime">New assignment</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-white/55">
                Accept this job to unlock pickup details and the delivery route.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/35">Pickup</p>
            <p className="mt-1 text-[12.5px] font-semibold">{vendorName ?? "Cash vendor"}</p>
            <p className="mt-0.5 text-[10.5px] text-white/45">
              {accepted ? "Collect the exact amount, then confirm below." : "Details unlock after accepting."}
            </p>
          </div>

          <div className="border-t border-white/10 pt-3.5">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/35">Drop-off</p>
            <p className="mt-1 text-[12.5px] font-semibold">{transaction.recipient.name}</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-white/50">
              {transaction.recipient.street}, {transaction.recipient.area}, {transaction.recipient.city}
            </p>
            {transaction.recipient.instructions && (
              <p className="mt-1.5 rounded-xl bg-white/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-white/55">
                {transaction.recipient.instructions}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 pt-3.5">
            <a
              href={`tel:${transaction.recipient.phone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1z" />
              </svg>
              Call
            </a>
            <a
              href={`https://wa.me/${transaction.recipient.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Notice tone="error">{error}</Notice>
          </div>
        )}

        {transaction.status === "RIDER_ASSIGNED" && !transaction.riderAcceptedAt && (
          <button
            type="button"
            onClick={() =>
              handle(riderAcceptJob(transaction.id, riderId), "Job accepted. Head to the cash vendor.")
            }
            className="mt-4 w-full rounded-2xl bg-lime py-3.5 text-[13px] font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            Accept job
          </button>
        )}

        {transaction.status === "RIDER_ASSIGNED" && transaction.riderAcceptedAt && (
          <button
            type="button"
            onClick={() =>
              handle(
                riderCollectCash(transaction.id, riderId),
                "Cash collected. Start the delivery when you're moving."
              )
            }
            className="mt-4 w-full rounded-2xl bg-violet py-3.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-deep"
          >
            Confirm cash collection
          </button>
        )}

        {transaction.status === "CASH_COLLECTED" && (
          <button
            type="button"
            onClick={() =>
              handle(riderStartTransit(transaction.id, riderId), "Delivery started. Head to the recipient.")
            }
            className="mt-4 w-full rounded-2xl bg-violet py-3.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-deep"
          >
            Start delivery
          </button>
        )}

        {transaction.status === "IN_TRANSIT" && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-white">Confirm handoff</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-white/45">
                  Ask {transaction.recipient.name.split(" ")[0]} for their 4-digit code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCode((value) => !value)}
                className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-semibold text-white/60 hover:text-white"
              >
                {showCode ? "Hide demo code" : "Demo code"}
              </button>
            </div>

            {showCode && (
              <p className="mt-2 rounded-xl bg-lime/10 px-3 py-2 text-[10px] text-lime">
                Recipient demo code: <span className="font-mono text-[12px] font-bold tracking-[0.2em]">{transaction.otp}</span>
              </p>
            )}

            <div className="mt-3.5">
              <OtpField value={otp} onChange={setOtp} disabled={false} />
            </div>

            <button
              type="button"
              onClick={submitOtp}
              className="mt-3 w-full rounded-2xl bg-lime py-3.5 text-[13px] font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              Verify code & complete
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
        <span className="text-[9px] text-white/35">
          {transaction.etaMinutes ? `${transaction.etaMinutes} min ETA` : "Awaiting update"}
        </span>
        <button
          type="button"
          onClick={() => setFailOpen(true)}
          className="text-[9.5px] font-semibold text-white/45 underline-offset-2 hover:text-danger hover:underline"
        >
          Report a problem
        </button>
      </div>

      <Sheet
        open={failOpen}
        onClose={() => setFailOpen(false)}
        title="Report a delivery problem"
        subtitle="This is logged against the job and sent to operations immediately."
        footer={
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setFailOpen(false)} className="btn btn-outline">
              Back
            </button>
            <button type="button" onClick={reportProblem} className="btn btn-danger">
              Mark failed
            </button>
          </div>
        }
      >
        <div className="space-y-2.5">
          {FAILURE_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setFailReason(reason)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[12px] font-semibold transition-colors ${
                failReason === reason
                  ? "border-violet bg-violet-soft text-violet-deep"
                  : "border-line bg-white text-ink hover:border-line-strong"
              }`}
            >
              {reason}
              {failReason === reason && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
          <textarea
            value={failDetail}
            onChange={(event) => setFailDetail(event.target.value)}
            rows={3}
            placeholder="Anything else the operations team should know? (optional)"
            className="field mt-2 resize-none"
          />
          <p className="text-[9.5px] leading-relaxed text-ink-soft">
            The cash is still in your possession. Operations will contact you before any next step.
          </p>
        </div>
      </Sheet>
    </article>
  );
}

export default function RiderPage() {
  const state = useDash();
  const riderId = state?.riderId ?? "r_musa";
  const rider = riderFor(state, riderId);
  const jobs = riderJobs(state, riderId);
  const history = riderHistory(state, riderId);
  const activeJobs = jobs.filter((tx) =>
    ["RIDER_ASSIGNED", "CASH_COLLECTED", "IN_TRANSIT"].includes(tx.status)
  );
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string, tone: Flash["tone"] = "success") => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash({ message, tone });
    flashTimer.current = setTimeout(() => setFlash(null), 4500);
  };

  const online = rider?.status !== "offline";
  const completedCount = history.filter((tx) => tx.status === "COMPLETED").length;

  const toggleOnline = () => {
    if (!rider) return;
    if (activeJobs.length > 0 && online) {
      notify("Finish your active delivery before going offline.", "error");
      return;
    }
    const result = setRiderStatus(rider.id, online ? "offline" : "online");
    if (result.ok) notify(online ? "You're offline." : "You're online and ready for jobs.");
  };

  return (
    <div className="min-h-dvh bg-ink text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Wordmark dark href="/" />
            <span className="rounded-full border border-white/15 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/55">
              Rider
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/40">
              Demo
            </span>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-semibold text-white/60 transition-colors hover:text-white"
            >
              Customer app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-12 pt-5">
        {!state || !rider ? (
          <div className="space-y-4">
            <div className="skeleton h-40 rounded-[28px]" />
            <div className="skeleton h-80 rounded-[28px]" />
          </div>
        ) : (
          <>
            {flash && (
              <div className="fixed inset-x-4 bottom-5 z-[90] mx-auto max-w-md sm:bottom-6">
                <div
                  className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[12px] font-medium shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl ${
                    flash.tone === "error"
                      ? "border-danger/30 bg-danger text-white"
                      : "border-lime/30 bg-lime text-ink"
                  }`}
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/10">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                      {flash.tone === "error" ? (
                        <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      ) : (
                        <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                    </svg>
                  </span>
                  <p className="leading-relaxed">{flash.message}</p>
                </div>
              </div>
            )}

            {/* Rider identity */}
            <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-[17px] font-black text-ink">
                  {initials(rider.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[16px] font-bold">{rider.name}</p>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-lime" title="Verified rider">
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10.5px] text-white/45">
                    {rider.vehicle} · {rider.plate}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/35">
                    ★ {rider.rating.toFixed(1)} · {rider.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleOnline}
                  aria-pressed={online}
                  className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                    online ? "bg-lime" : "bg-white/15"
                  }`}
                  aria-label={online ? "Go offline" : "Go online"}
                >
                  <span
                    className={`absolute h-5 w-5 rounded-full bg-ink transition-transform ${
                      online ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                {[
                  [`${rider.jobsToday}`, "Jobs today"],
                  [`${completedCount}`, "Completed"],
                  [online ? (activeJobs.length ? "On job" : "Online") : "Offline", "Status"],
                ].map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-[13px] font-bold leading-none">{value}</p>
                    <p className="mt-1 text-[8px] uppercase tracking-[0.1em] text-white/35">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">Today</p>
                <h1 className="display mt-0.5 text-[30px] text-white">
                  {activeJobs.length ? "Your next handoff." : "Ready for a job."}
                </h1>
              </div>
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.1em] ${
                  online ? "bg-lime/15 text-lime" : "bg-white/10 text-white/45"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-lime pulse-dot" : "bg-white/30"}`} />
                {online ? "Online" : "Offline"}
              </span>
            </div>

            <div className="mt-3 space-y-4">
              {activeJobs.length > 0 ? (
                activeJobs.map((tx) => (
                  <RiderJobCard
                    key={tx.id}
                    transaction={tx}
                    riderId={rider.id}
                    vendorName={vendorFor(state, tx.vendorId)?.name}
                    onSuccess={(message) => notify(message)}
                  />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.025] px-6 py-12 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-white/40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="6" cy="19" r="2" />
                      <circle cx="18" cy="5" r="2" />
                      <path d="M8 19h5a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h5" />
                    </svg>
                  </span>
                  <p className="mt-4 text-[14px] font-bold">
                    {online ? "Waiting for the next assignment" : "You're offline"}
                  </p>
                  <p className="mx-auto mt-1.5 max-w-[260px] text-[11px] leading-relaxed text-white/45">
                    {online
                      ? "Operations assigns jobs based on vendor and recipient location. Keep this screen open."
                      : "Go online to receive cash pickup and delivery jobs."}
                  </p>
                  {!online && (
                    <button
                      type="button"
                      onClick={toggleOnline}
                      className="mt-5 rounded-2xl bg-lime px-5 py-3 text-[12px] font-bold text-ink"
                    >
                      Go online
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* History */}
            <section className="mt-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">History</p>
                  <h2 className="mt-0.5 text-[15px] font-bold">Recent deliveries</h2>
                </div>
                <span className="text-[9.5px] text-white/35">{history.length} jobs</span>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                {history.length > 0 ? (
                  history.slice(0, 6).map((tx, index) => (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-white/10" : ""}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[9px] font-bold text-white/55">
                        {initials(tx.recipient.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-semibold">{tx.recipient.name}</p>
                        <p className="mt-0.5 text-[9px] text-white/35">
                          {tx.reference} · {formatDate(tx.updatedAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="num text-[11.5px] font-semibold">{formatNaira(tx.amount)}</p>
                        <p
                          className={`mt-0.5 text-[8.5px] font-semibold uppercase tracking-[0.08em] ${
                            tx.status === "COMPLETED"
                              ? "text-lime"
                              : tx.status === "DELIVERY_FAILED"
                                ? "text-danger"
                                : "text-white/40"
                          }`}
                        >
                          {tx.status === "DELIVERY_FAILED" ? "Failed" : tx.status.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-[11px] text-white/35">
                    Completed deliveries will appear here.
                  </p>
                )}
              </div>
            </section>

            {/* Session + links */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <div>
                <p className="text-[9.5px] font-semibold text-white/55">Signed in as {rider.name}</p>
                <p className="mt-0.5 text-[9px] text-white/30">
                  {formatNgPhone(rider.phone)} · rider demo session
                </p>
              </div>
              <div className="flex items-center gap-3 text-[9.5px] font-semibold text-white/45">
                <Link href="/ops" className="hover:text-white">Operations</Link>
                <Link href="/signin" className="hover:text-white">Sign out</Link>
              </div>
            </div>

            <p className="mt-5 text-center text-[9px] leading-relaxed text-white/25">
              Dash rider prototype · Demo data only. Never hand over cash without a verified recipient code.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
