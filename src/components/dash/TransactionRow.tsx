import Link from "next/link";
import { formatNaira, initials, timeAgo } from "@/lib/dash/format";
import StatusBadge from "./StatusBadge";
import type { Transaction } from "@/lib/dash/types";

export default function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <Link
      href={`/track/${transaction.id}`}
      className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-white"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-soft text-[11px] font-bold text-violet-deep">
        {initials(transaction.recipient.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{transaction.recipient.name}</p>
        <p className="mt-0.5 truncate text-[10.5px] text-ink-soft">
          {transaction.reference} · {timeAgo(transaction.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="num text-[13px] font-bold text-ink">{formatNaira(transaction.amount)}</p>
        <div className="mt-1">
          <StatusBadge status={transaction.status} />
        </div>
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="ml-0.5 shrink-0 text-line-strong transition-transform group-hover:translate-x-0.5 group-hover:text-ink-soft"
        aria-hidden
      >
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
