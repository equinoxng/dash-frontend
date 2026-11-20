import Link from "next/link";
import Wordmark from "@/components/dash/Wordmark";
import LegalDisclaimer from "@/components/dash/LegalDisclaimer";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="min-h-dvh bg-paper">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between">
          <Wordmark />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 12 6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
            <div className="app-card p-6 sm:p-9">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="display mt-3 text-[40px] leading-[0.95] text-ink sm:text-[46px]">{title}</h1>
              <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-ink-soft">{subtitle}</p>
              <div className="mt-8">{children}</div>
            </div>

            {footer && <div className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-soft">{footer}</div>}

            <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-ink-soft/60">
              Dash by Equinox · Secure onboarding
            </p>
            <LegalDisclaimer className="mx-auto mt-3 max-w-md text-center" />
          </div>
        </div>
      </div>
    </main>
  );
}
