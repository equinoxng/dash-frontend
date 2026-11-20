const TONES = {
  error: "border-danger/20 bg-danger-soft text-danger",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  info: "border-violet/15 bg-violet-soft text-violet-deep",
};

export default function Notice({
  tone = "info",
  children,
  className = "",
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
  className?: string;
}) {
  const icon =
    tone === "success" ? (
      <path d="M2.5 6.2 4.8 8.4 9.5 3.6" />
    ) : tone === "error" ? (
      <path d="M7 4v3.5M7 10h.01" />
    ) : (
      <path d="M7 3.5v4M7 10h.01" />
    );

  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-[12px] font-medium leading-relaxed ${TONES[tone]} ${className}`}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden
      >
        {tone !== "success" && <circle cx="7" cy="7" r="5.5" />}
        {icon}
      </svg>
      <div>{children}</div>
    </div>
  );
}
