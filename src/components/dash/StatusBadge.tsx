import { STATUS_META } from "@/lib/dash/status";
import type { TxStatus } from "@/lib/dash/types";

export default function StatusBadge({ status, label }: { status: TxStatus; label?: string }) {
  const meta = STATUS_META[status];
  return (
    <span className={`badge badge-${meta.tone}`}>
      <span className="badge-dot" />
      {label ?? meta.customerLabel}
    </span>
  );
}
