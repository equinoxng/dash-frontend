import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import DeliveryPrototype from "@/components/DeliveryPrototype";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="dash-stripe" />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <Image src="/logo.png" alt="Dash by Equinox" width={120} height={44} />
            </div>
            <h1 className="dash-headline text-6xl lg:text-7xl text-ink leading-[1.03] mb-2">
              Cash,<br />delivered<span className="text-accent">.</span>
            </h1>
            <p className="text-xl font-bold text-ink mt-4 mb-1">
              Request cash. <span className="text-accent">Get it delivered.</span>
            </p>
            <div className="w-10 h-1 mt-3 mb-5 mx-auto lg:mx-0 bg-accent" />
            <p className="text-base text-ink-soft mb-8 max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Dash lets you request physical cash in your preferred denomination and receive it from a nearby verified vendor in{" "}
              <span className="font-semibold text-accent">minutes.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/signup" className="dash-btn dash-btn-primary">
                Get started
              </Link>
              <Link href="/signup/rider" className="dash-btn dash-btn-outline">
                Become a rider
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <DeliveryPrototype />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 px-4 bg-accent-light">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1240" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
              title: "Fast",
              desc: "Cash in minutes",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1240" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              ),
              title: "Safe",
              desc: "Verified vendors you can trust",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1240" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                  <path d="M6 15h4"/>
                </svg>
              ),
              title: "Your Way",
              desc: "Get the amount and denomination you need",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1240" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
              ),
              title: "Secure",
              desc: "Cash delivered safely to you",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-start gap-3">
              <div className="w-11 h-11 bg-cream border-2 border-ink flex items-center justify-center" style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)" }}>
                {f.icon}
              </div>
              <div>
                <p className="font-extrabold text-ink text-sm">{f.title}</p>
                <p className="text-ink-soft text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="dash-headline text-3xl text-ink mb-3 inline-block">How Dash works</h2>
            <p className="text-ink-soft max-w-md mx-auto">Three simple steps to get cash delivered to you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Request cash", desc: "Enter the amount you need and your delivery address." },
              { step: "02", title: "Rider picks up", desc: "A verified Dash rider picks up your cash from the nearest agent outlet." },
              { step: "03", title: "Cash delivered", desc: "Your cash arrives at your door in minutes. PIN-confirmed handoff." },
            ].map((item) => (
              <div key={item.step} className="dash-card p-7">
                <span className="text-5xl font-extrabold text-accent-light">{item.step}</span>
                <h3 className="text-base font-extrabold text-ink mt-2 mb-2">{item.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rider CTA */}
      <section className="py-20 px-4 bg-accent-light">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="dash-tag mb-4">For riders</span>
            <h2 className="dash-headline text-3xl text-ink mb-4">Earn on your own schedule</h2>
            <p className="text-ink-soft mb-6 max-w-md">
              Join our fleet of riders and earn competitive pay delivering cash across the city. Flexible hours, weekly payouts, and full support.
            </p>
            <ul className="space-y-2 mb-8">
              {["Flexible working hours", "Weekly direct payouts", "Dedicated rider support", "Free rider insurance"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-ink text-sm">
                  <div className="w-4 h-4 bg-ink flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/signup/rider" className="dash-btn dash-btn-ink">
              Apply as a rider
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="dash-card !bg-ink p-8 w-64 text-center">
              <p className="text-white/60 text-sm mb-1">Average monthly earning</p>
              <p className="text-4xl font-extrabold mb-4 text-white">₦120K</p>
              <div className="space-y-3">
                {[["Base pay", "₦80,000"], ["Bonuses", "₦25,000"], ["Tips", "₦15,000"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-white/60">{l}</span>
                    <span className="text-white font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merchant CTA */}
      <section id="merchants" className="py-20 px-4 bg-cream">
        <div className="max-w-6xl mx-auto text-center">
          <span className="dash-tag mb-4">For merchants</span>
          <h2 className="dash-headline text-3xl text-ink mb-4 inline-block">Partner with Dash</h2>
          <p className="text-ink-soft max-w-lg mx-auto mb-8">
            Are you a POS agent, microfinance outlet, or cash agent? Partner with us to become a pickup point and grow your revenue.
          </p>
          <Link href="/signup/merchant" className="dash-btn dash-btn-ink">
            Register your business
          </Link>
        </div>
      </section>

      {/* Footer / Coming soon bar */}
      <footer className="px-4 py-6 bg-ink">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Dash" width={32} height={32} className="brightness-0 invert" />
            <div>
              <p className="text-white font-bold text-sm">Dash by Equinox</p>
              <p className="text-white/50 text-xs">The future of cash access.</p>
            </div>
          </div>
          <div className="text-xs font-bold uppercase tracking-wide text-white border border-white/30 px-3 py-1.5 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Coming Soon
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-white/15 text-center text-xs text-white/40">
          © 2026 EQUINOXNG DIGITAL SERVICES LTD
        </div>
      </footer>
    </div>
  );
}
