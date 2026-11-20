"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";
import BottomNav from "./BottomNav";

const NAV = [
  { href: "/send", label: "Send cash" },
  { href: "/track", label: "Track" },
  { href: "/account", label: "Account" },
];

export default function AppShell({
  children,
  wide = false,
  hideNav = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  hideNav?: boolean;
}) {
  const pathname = usePathname();
  const container = wide ? "max-w-6xl" : "max-w-2xl";

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-xl">
        <div className={`mx-auto flex h-16 items-center justify-between px-4 ${container}`}>
          <Wordmark />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                    active ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-full border border-line bg-white/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-soft sm:inline">
              Demo
            </span>
            <Link
              href="/account"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white transition-transform hover:scale-105"
              aria-label="Account"
            >
              AO
            </Link>
          </div>
        </div>
      </header>

      <main className={hideNav ? "" : "pb-28 lg:pb-10"}>{children}</main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
