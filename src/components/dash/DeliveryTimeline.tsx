import { formatTime } from "@/lib/dash/format";
import { TIMELINE_STEPS, timelineRank } from "@/lib/dash/status";
import type { Transaction } from "@/lib/dash/types";

export default function DeliveryTimeline({ transaction }: { transaction: Transaction }) {
  const rank = timelineRank(transaction.status, transaction.timeline);
  const failed = ["DELIVERY_FAILED", "DELIVERY_CANCELLED", "RIDER_UNAVAILABLE", "VENDOR_UNAVAILABLE"].includes(
    transaction.status
  );

  return (
    <ol className="relative">
      {TIMELINE_STEPS.map((step, index) => {
        const done = index < rank;
        const current = index === rank && rank < TIMELINE_STEPS.length;
        const event = [...transaction.timeline].reverse().find((e) => e.status === step.status);
        const isLast = index === TIMELINE_STEPS.length - 1;

        return (
          <li key={step.status} className="relative flex gap-3.5 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[10px] top-6 h-[calc(100%-12px)] w-px ${
                  done ? "bg-violet/40" : "bg-line"
                }`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                done
                  ? "border-violet bg-violet text-white"
                  : current && failed
                    ? "border-danger bg-danger-soft text-danger"
                    : current
                      ? "border-violet bg-white text-violet pulse-dot"
                      : "border-line-strong bg-white text-transparent"
              }`}
            >
              {done ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 6.2 4.8 8.4 9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className={`h-1.5 w-1.5 rounded-full ${current ? "bg-current" : "bg-transparent"}`} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={`text-[13px] font-semibold ${
                    done || current ? "text-ink" : "text-ink-soft/70"
                  }`}
                >
                  {step.label}
                </p>
                {event && (
                  <span className="shrink-0 text-[10px] font-medium text-ink-soft">{formatTime(event.at)}</span>
                )}
              </div>
              {(current || done) && (
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">
                  {current && !done ? (event?.note ?? step.description) : done ? event?.note ?? step.description : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
