"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashTab = "send" | "track" | "account";

const items: { key: DashTab; href: string; label: string; match: string[]; icon: React.ReactNode }[] = [
  {
    key: "send",
    href: "/send",
    label: "Send",
    match: ["/send", "/dashboard"],
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    key: "track",
    href: "/track",
    label: "Track",
    match: ["/track"],
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="5" r="2" />
        <path d="M8 19h5a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h5" />
      </svg>
    ),
  },
  {
    key: "account",
    href: "/account",
    label: "Account",
    match: ["/account", "/profile"],
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </svg>
    ),
  },
];

export default function BottomNav({
  active,
  onChange,
  showOnDesktop = false,
}: {
  active?: DashTab;
  onChange?: (tab: DashTab) => void;
  showOnDesktop?: boolean;
}) {
  const pathname = usePathname();
  const controlled = typeof onChange === "function";

  const isActive = (item: (typeof items)[number]) =>
    active
      ? active === item.key
      : item.match.some((match) => pathname === match || pathname.startsWith(`${match}/`));

  return (
    <nav
      className={`fixed inset-x-3 bottom-3 z-50 ${showOnDesktop ? "" : "lg:hidden"}`}
      aria-label="Primary"
    >
      <div className="bottom-nav mx-auto flex max-w-md items-center gap-1 rounded-[24px] p-1.5">
        {items.map((item) => {
          const selected = isActive(item);
          const className = `flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2.5 text-[10.5px] font-semibold transition-all ${
            selected
              ? "bg-violet text-white shadow-[0_8px_18px_-8px_rgba(13,172,92,0.9)]"
              : "text-ink-soft hover:bg-cream hover:text-ink"
          }`;

          if (controlled) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange?.(item.key)}
                className={className}
                aria-current={selected ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={className}
              aria-current={selected ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
