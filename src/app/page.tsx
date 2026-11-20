import type { Metadata } from "next";
import Link from "next/link";
import Wordmark from "@/components/dash/Wordmark";
import LegalDisclaimer from "@/components/dash/LegalDisclaimer";

export const metadata: Metadata = {
  title: "Dash — Cash, delivered",
  description:
    "Send money from your phone. Your recipient receives physical naira at their door — no app, no wallet, no account needed.",
};

const assurances = [
  ["Physical naira, not credit", "M12 3v18M7 7h7a3 3 0 0 1 0 6H7h8a3 3 0 0 1 0 6H7"],
  ["Recipient confirms with a code", "M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"],
  ["Live tracking to the door", "M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"],
];

const steps = [
  {
    number: "01",
    title: "Tell us who needs cash",
    detail: "Add a recipient, their phone number and where they should receive the cash.",
  },
  {
    number: "02",
    title: "Choose an amount and pay",
    detail: "See the full fee upfront, pay securely, and we prepare the physical naira.",
  },
  {
    number: "03",
    title: "Track it to the door",
    detail: "A verified rider delivers it. Your recipient confirms handoff with a one-time code.",
  },
];

const features = [
  {
    title: "Cash, not a transfer",
    detail: "Your recipient gets physical naira in hand. No bank app, no wallet, no account on their side.",
    path: "M3 7h18v12H3zM3 11h18M7 15h3",
  },
  {
    title: "Delivery you can see",
    detail: "Follow every handoff from vendor to rider to doorstep, with a live status at each step.",
    path: "M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z",
  },
  {
    title: "PIN-confirmed handoff",
    detail: "Cash is only released when the recipient enters the code you shared with them.",
    path: "M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
  },
  {
    title: "Built for Lagos",
    detail: "A local rider network and cash partners that understand the city and move at its pace.",
    path: "M4 20V8l8-5 8 5v12M9 20v-6h6v6",
  },
];

const audiences = [
  {
    eyebrow: "For senders",
    title: "Send cash in minutes",
    detail: "Create an account, add a recipient and pay. We handle the rest.",
    href: "/signup",
    cta: "Create an account",
  },
  {
    eyebrow: "For riders",
    title: "Move cash, earn daily",
    detail: "Verified riders get dispatch alerts, predictable jobs and weekly earnings.",
    href: "/signup/rider",
    cta: "Join as a rider",
  },
  {
    eyebrow: "For cash points",
    title: "Put your float to work",
    detail: "POS agents and cash hubs can serve Dash requests and earn on every handoff.",
    href: "/signup/merchant",
    cta: "Register a business",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a href="#how-it-works" className="text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#why-dash" className="text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink">
              Why Dash
            </a>
            <Link href="/track" className="text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink">
              Track a delivery
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/signin" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-lime/25 blur-3xl" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="eyebrow">Lagos · same-day cash delivery</span>
            </div>

            <h1 className="display mt-6 text-[62px] leading-[0.9] text-ink sm:text-[86px] lg:text-[104px]">
              Cash,
              <br />
              <span className="italic text-violet">delivered.</span>
            </h1>

            <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-ink-soft sm:text-[17px]">
              Send money from your phone. They receive physical naira at their door — no bank app, no wallet, no
              account needed on their side.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Create your account
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="/signin" className="btn btn-outline btn-lg">
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {assurances.map(([label, path]) => (
                <span key={label} className="flex items-center gap-2 text-[11px] font-medium text-ink-soft">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={path} />
                  </svg>
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-8 text-[11px] text-ink-soft/75">
              Already sent cash with Dash?{" "}
              <Link href="/track" className="font-semibold text-violet hover:underline">
                Track a delivery
              </Link>
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[48px] bg-gradient-to-br from-violet/10 via-transparent to-lime/20 blur-2xl" aria-hidden />

            <div className="app-card-ink relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-violet/30 blur-3xl" aria-hidden />

              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime pulse-dot" />
                  Live delivery
                </span>
                <span className="text-[10px] font-medium text-white/45">Today · 10:42</span>
              </div>

              <div className="relative mt-9">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">You sent</p>
                <p className="num mt-1 text-[52px] font-bold leading-none tracking-[-0.05em] sm:text-[58px]">₦25,000</p>
                <p className="mt-2 text-[11px] text-white/50">To Ada Okafor · Ikeja GRA</p>
              </div>

              <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  <span>Vendor</span>
                  <span>Rider</span>
                  <span>Recipient</span>
                </div>
                <div className="relative mt-3 h-[3px] rounded-full bg-white/10">
                  <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-violet to-lime" />
                  {[0, 50, 100].map((point) => (
                    <span
                      key={point}
                      className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${point <= 50 ? "bg-white" : "bg-white/25"}`}
                      style={{ left: `calc(${point}% - 4px)` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-white/80">Musa is on the way</p>
                    <p className="mt-0.5 text-[9.5px] text-white/40">Motorcycle · 8 min away</p>
                  </div>
                  <span className="rounded-full bg-lime/15 px-2.5 py-1 text-[9px] font-bold text-lime">In transit</span>
                </div>
              </div>

              <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                    MI
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold">Musa Ibrahim</p>
                    <p className="mt-0.5 text-[9px] text-white/40">Verified Dash rider · ★ 4.9</p>
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10" aria-hidden>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-line bg-white px-4 py-3 shadow-soft sm:block">
              <p className="eyebrow !text-[8px]">For the recipient</p>
              <p className="mt-1 text-[11px] font-semibold text-ink">No app needed</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-line bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="display mt-3 text-[38px] leading-none text-ink sm:text-[48px]">As simple as a delivery.</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              Three steps between you and cash in someone else&apos;s hands.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="app-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-soft text-[11px] font-bold text-violet-deep">
                  {step.number}
                </span>
                <h3 className="mt-5 text-[15px] font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-dash" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow">Why Dash</p>
            <h2 className="display mt-3 text-[38px] leading-none text-ink sm:text-[48px]">Built for the last mile.</h2>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-ink-soft">
            We focus on the part other apps leave out: getting actual cash to an actual doorstep.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="app-card-flat p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-violet">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={feature.path} />
                </svg>
              </span>
              <h3 className="mt-4 text-[13.5px] font-bold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="eyebrow">Three ways in</p>
          <h2 className="display mt-3 max-w-xl text-[38px] leading-none text-ink sm:text-[48px]">
            Find your place in the network.
          </h2>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => (
              <article key={audience.title} className="app-card flex flex-col p-6">
                <p className="eyebrow !text-[8px]">{audience.eyebrow}</p>
                <h3 className="mt-3 text-[17px] font-bold text-ink">{audience.title}</h3>
                <p className="mt-2 flex-1 text-[12px] leading-relaxed text-ink-soft">{audience.detail}</p>
                <Link href={audience.href} className="btn btn-outline btn-sm mt-6 self-start">
                  {audience.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="app-card-ink relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-violet/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-lime/20 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="eyebrow !text-white/45">Ready when you are</p>
            <h2 className="display mx-auto mt-4 max-w-2xl text-[42px] leading-[0.95] text-white sm:text-[58px]">
              Cash in their hands, in under an hour.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-white/55">
              Create your Dash account today. Your first delivery is a few taps away.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Create your account
              </Link>
              <Link href="/signin" className="btn btn-outline btn-lg !border-white/20 !text-white hover:!bg-white/10">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Wordmark />
              <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-ink-soft">
                Send money. They receive cash. Built in Lagos for the way people actually move money.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[11px] font-medium text-ink-soft sm:grid-cols-3">
              <a href="#how-it-works" className="hover:text-ink">How it works</a>
              <Link href="/track" className="hover:text-ink">Track a delivery</Link>
              <Link href="/signin" className="hover:text-ink">Sign in</Link>
              <Link href="/signup/rider" className="hover:text-ink">Rider app</Link>
              <Link href="/signup/merchant" className="hover:text-ink">Merchants</Link>
              <Link href="/ops" className="hover:text-ink">Operations</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-line pt-5">
            <LegalDisclaimer className="max-w-4xl" />
            <div className="mt-4 flex flex-col gap-2 text-[10px] text-ink-soft/70 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Dash by Equinox. All rights reserved.</p>
              <p>Cash, delivered.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
