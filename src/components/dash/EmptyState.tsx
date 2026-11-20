import Link from "next/link";

export default function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-soft text-violet">
        {icon ?? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
            <path d="M16.5 7V5.5A2.5 2.5 0 0 0 14 3h-4a2.5 2.5 0 0 0-2.5 2.5V7" />
            <circle cx="12" cy="13.5" r="2" />
          </svg>
        )}
      </div>
      <p className="text-[15px] font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-ink-soft">{description}</p>
      {action && (
        <Link href={action.href} className="btn btn-primary btn-sm mt-5">
          {action.label}
        </Link>
      )}
    </div>
  );
}
