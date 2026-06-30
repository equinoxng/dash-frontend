import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import DeliveryPrototype from "@/components/DeliveryPrototype";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
              <Image src="/logo.png" alt="Dash by Equinox" width={120} height={44} />
            </div>
            <h1 className="text-6xl lg:text-7xl font-extrabold text-[#0f0f0f] leading-[1.05] mb-2">
              Cash,<br />delivered<span style={{ color: "#5b3fc4" }}>.</span>
            </h1>
            <p className="text-xl font-bold text-[#0f0f0f] mt-4 mb-1">
              Request cash. <span style={{ color: "#5b3fc4" }}>Get it delivered.</span>
            </p>
            <div className="w-10 h-0.5 mt-3 mb-5" style={{ background: "#5b3fc4" }} />
            <p className="text-base text-slate-600 mb-8 max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Dash lets you request physical cash in your preferred denomination and receive it from a nearby verified vendor in{" "}
              <span className="font-semibold" style={{ color: "#5b3fc4" }}>minutes.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/signup"
                className="font-bold px-7 py-3.5 rounded-xl text-white text-center hover:opacity-90 transition-opacity active:scale-95"
                style={{ background: "#1e1240" }}>
                Get started
              </Link>
              <Link href="/signup/rider"
                className="border-2 font-bold px-7 py-3.5 rounded-xl text-center hover:bg-white/50 transition-colors"
                style={{ borderColor: "#1e1240", color: "#1e1240" }}>
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
      <section className="py-14 px-4" style={{ background: "#eee9e3" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
              title: "Fast",
              desc: "Cash in minutes",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              ),
              title: "Safe",
              desc: "Verified vendors you can trust",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
              ),
              title: "Secure",
              desc: "Cash delivered safely to you",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-start gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#ede8fb" }}>
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-[#0f0f0f] text-sm">{f.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4" style={{ background: "#f5f0eb" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#0f0f0f] mb-3">How Dash works</h2>
            <p className="text-slate-500 max-w-md mx-auto">Three simple steps to get cash delivered to you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Request cash", desc: "Enter the amount you need and your delivery address." },
              { step: "02", title: "Rider picks up", desc: "A verified Dash rider picks up your cash from the nearest agent outlet." },
              { step: "03", title: "Cash delivered", desc: "Your cash arrives at your door in minutes. PIN-confirmed handoff." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl p-7" style={{ background: "#eee9e3" }}>
                <span className="text-5xl font-extrabold" style={{ color: "#e0d9d0" }}>{item.step}</span>
                <h3 className="text-base font-bold text-[#0f0f0f] mt-2 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rider CTA */}
      <section className="py-20 px-4" style={{ background: "#eee9e3" }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide" style={{ background: "#ede8fb", color: "#5b3fc4" }}>
              For riders
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f0f0f] mb-4">Earn on your own schedule</h2>
            <p className="text-slate-600 mb-6 max-w-md">
              Join our fleet of riders and earn competitive pay delivering cash across the city. Flexible hours, weekly payouts, and full support.
            </p>
            <ul className="space-y-2 mb-8">
              {["Flexible working hours", "Weekly direct payouts", "Dedicated rider support", "Free rider insurance"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-slate-700 text-sm">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1e1240" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/signup/rider"
              className="inline-block font-bold px-7 py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Apply as a rider
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="rounded-2xl p-8 w-64 text-center" style={{ background: "#1e1240" }}>
              <p className="text-slate-400 text-sm mb-1">Average monthly earning</p>
              <p className="text-4xl font-extrabold mb-4" style={{ color: "#a78bfa" }}>₦120K</p>
              <div className="space-y-3">
                {[["Base pay", "₦80,000"], ["Bonuses", "₦25,000"], ["Tips", "₦15,000"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-white font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merchant CTA */}
      <section id="merchants" className="py-20 px-4" style={{ background: "#f5f0eb" }}>
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide" style={{ background: "#eee9e3", color: "#64748b" }}>
            For merchants
          </span>
          <h2 className="text-3xl font-extrabold text-[#0f0f0f] mb-4">Partner with Dash</h2>
          <p className="text-slate-500 max-w-lg mx-auto mb-8">
            Are you a POS agent, microfinance outlet, or cash agent? Partner with us to become a pickup point and grow your revenue.
          </p>
          <Link href="/signup/merchant"
            className="inline-block font-bold px-7 py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
            style={{ background: "#1e1240" }}>
            Register your business
          </Link>
        </div>
      </section>

      {/* Footer / Coming soon bar */}
      <footer style={{ background: "#1e1240" }} className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Dash" width={32} height={32} className="brightness-0 invert" />
            <div>
              <p className="text-white font-bold text-sm">Dash by Equinox</p>
              <p className="text-slate-400 text-xs">The future of cash access.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm border border-slate-600 rounded-xl px-4 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Coming Soon.
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t text-center text-xs text-slate-500" style={{ borderColor: "#2d1f5e" }}>
          © 2026 EQUINOXNG DIGITAL SERVICES LTD
        </div>
      </footer>
    </div>
  );
}
