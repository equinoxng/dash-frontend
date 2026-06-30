"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Screen = "home" | "request" | "confirm" | "searching" | "onway" | "delivered" | "activity";

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000];

const ACTIVITY = [
  { amount: "₦20,000", date: "Today, 2:14 PM", status: "Delivered" },
  { amount: "₦8,000", date: "Yesterday, 6:40 PM", status: "Delivered" },
  { amount: "₦50,000", date: "Jun 19, 11:02 AM", status: "Delivered" },
  { amount: "₦15,000", date: "Jun 17, 9:22 AM", status: "Delivered" },
  { amount: "₦30,000", date: "Jun 14, 3:05 PM", status: "Delivered" },
];

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

export default function DeliveryPrototype() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedAmt, setSelectedAmt] = useState(50000);
  const [customAmt, setCustomAmt] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [eta, setEta] = useState(18);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  useEffect(() => {
    if (screen === "onway") {
      setEta(18); setProgress(0);
      timerRef.current = setInterval(() => {
        setEta(e => {
          if (e <= 1) { clearTimer(); setScreen("delivered"); return 0; }
          return e - 1;
        });
        setProgress(p => Math.min(p + 100 / 18, 100));
      }, 800);
    }
    return clearTimer;
  }, [screen]);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;

  return (
    <div className="relative select-none" style={{ width: 320 }}>
      {/* Shadow card */}
      <div className="absolute inset-0 rounded-[44px] rotate-3 translate-y-2" style={{ background: "#ede8fb" }} />

      {/* Phone shell */}
      <div className="relative bg-[#1a1a1a] rounded-[44px] p-3 shadow-2xl border-4 border-[#111]">
        {/* Screen */}
        <div className="bg-white rounded-[36px] overflow-hidden relative" style={{ height: 620 }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-1">
            <span className="text-slate-900 text-xs font-semibold">9:41</span>
            <div className="w-24 h-6 bg-[#111] rounded-full shadow-inner" />
            <div className="flex items-center gap-1">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="#0f172a" opacity="0.7"><rect x="0" y="3" width="2" height="7" rx="1"/><rect x="3" y="2" width="2" height="8" rx="1"/><rect x="6" y="1" width="2" height="9" rx="1"/><rect x="9" y="0" width="2" height="10" rx="1"/></svg>
              <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                <path d="M1 5C5.5 1 18.5 1 23 5"/>
                <path d="M4.5 9C7.5 6.5 16.5 6.5 19.5 9"/>
                <path d="M8.5 13C10 11.5 14 11.5 15.5 13"/>
                <circle cx="12" cy="17" r="1.2" fill="#0f172a" stroke="none"/>
              </svg>
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0" y="1" width="18" height="9" rx="2" stroke="#0f172a" strokeOpacity="0.4" strokeWidth="1.2"/><rect x="1" y="2" width="14" height="7" rx="1" fill="#0f172a"/><path d="M19 3.5v4a1.5 1.5 0 000-4z" fill="#0f172a" fillOpacity="0.4"/></svg>
            </div>
          </div>

          {/* ── HOME ── */}
          {screen === "home" && (
            <div className="flex flex-col h-full px-4 pb-20">
              <div className="flex items-center justify-between py-3">
                <Image src="/logo.png" alt="Dash" width={72} height={28} />
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  <span className="text-slate-700 text-xs font-bold">AO</span>
                </div>
              </div>

              {/* Balance card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-xs">Wallet balance</span>
                  <button onClick={() => setBalanceVisible(v => !v)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
                      {balanceVisible
                        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      }
                    </svg>
                  </button>
                </div>
                <p className="text-slate-900 font-extrabold text-3xl mb-4">
                  {balanceVisible ? "₦845,200" : "₦ ••••••"}
                </p>
                <button
                  onClick={() => setScreen("request")}
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors active:scale-95"
                >
                  Request cash
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12L12 2M12 2H5M12 2v7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Trust badge */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mt-3 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p className="text-slate-500 text-xs">PIN-confirmed handoff. Every vendor is verified and ID-checked.</p>
              </div>

              {/* Recent activity */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-900 font-bold text-sm">Recent activity</span>
                  <button onClick={() => setScreen("activity")} className="text-slate-400 text-xs flex items-center gap-1 hover:text-slate-700">
                    See all <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {ACTIVITY.slice(0, 3).map((a, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm font-semibold">Cash delivery</p>
                        <p className="text-slate-400 text-xs">{a.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-slate-900 font-bold text-sm">{a.amount}</p>
                        <p className="text-green-500 text-xs">{a.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REQUEST ── */}
          {screen === "request" && (
            <div className="flex flex-col h-full px-4 pb-20">
              <div className="flex items-center gap-3 py-4">
                <button onClick={() => setScreen("home")} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="text-slate-900 font-bold">Request cash</span>
              </div>

              <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Select amount</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {AMOUNTS.map((a) => (
                  <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); }}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedAmt === a && !customAmt ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100"}`}>
                    {fmt(a)}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="text-slate-400 text-xs mb-1.5 block uppercase tracking-widest">Or enter amount</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-slate-400 font-bold">₦</span>
                  <input type="number" placeholder="0" value={customAmt}
                    onChange={e => setCustomAmt(e.target.value)}
                    className="bg-transparent text-slate-900 text-lg font-bold flex-1 outline-none placeholder-slate-300" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 space-y-2 text-sm">
                {[["Amount", fmt(finalAmt)], ["Delivery fee", "₦500"], ["Service fee", "₦100"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-slate-900 font-semibold">{v}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-500">Total deducted</span>
                  <span className="text-slate-900 font-bold">{fmt(finalAmt + 600)}</span>
                </div>
              </div>

              <button onClick={() => setScreen("confirm")}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-700 transition-colors active:scale-95">
                Continue →
              </button>
            </div>
          )}

          {/* ── CONFIRM ── */}
          {screen === "confirm" && (
            <div className="flex flex-col h-full px-4 pb-20">
              <div className="flex items-center gap-3 py-4">
                <button onClick={() => setScreen("request")} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="text-slate-900 font-bold">Confirm order</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-4 text-center">
                <p className="text-slate-400 text-xs mb-1">You're requesting</p>
                <p className="text-slate-900 font-extrabold text-4xl mb-1">{fmt(finalAmt)}</p>
                <p className="text-slate-400 text-xs">Cash · Lagos Island</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 space-y-2.5 text-sm">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Delivery details</p>
                {[["Delivery to", "Current location"], ["Estimated time", "~18 minutes"], ["Rider assigned", "After confirmation"], ["Handoff", "PIN-confirmed"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-slate-700 text-xs font-medium">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p className="text-amber-700 text-xs">Your PIN will be required to complete the handoff</p>
              </div>

              <div className="flex gap-2 mt-auto">
                <button onClick={() => setScreen("home")} className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl text-sm hover:bg-slate-200">Cancel</button>
                <button onClick={() => { setScreen("searching"); setTimeout(() => setScreen("onway"), 2200); }}
                  className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 active:scale-95">
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* ── SEARCHING ── */}
          {screen === "searching" && (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <div className="relative w-20 h-20 mb-2">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-t-slate-900 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow">
                  <Image src="/logo.png" alt="Dash" width={32} height={20} />
                </div>
              </div>
              <div>
                <p className="text-slate-900 font-bold text-lg mb-1">Finding your rider…</p>
                <p className="text-slate-400 text-sm">Usually takes under 30 seconds</p>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── ON THE WAY ── */}
          {screen === "onway" && (
            <div className="flex flex-col h-full px-4 pb-20">
              <div className="py-4">
                <span className="text-slate-900 font-bold">Live tracking</span>
              </div>

              {/* Map placeholder */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl h-36 mb-4 overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg,#e2e8f0 0,#e2e8f0 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#e2e8f0 0,#e2e8f0 1px,transparent 1px,transparent 40px)" }} />
                <div className="relative flex flex-col items-center gap-1">
                  <div className="w-3 h-3 bg-slate-900 rounded-full animate-pulse" />
                  <div className="w-px h-8 bg-slate-300" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0f172a"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8"><circle cx="12" cy="7" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">Rider on the way</p>
                      <p className="text-slate-400 text-xs">Chukwuemeka O.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 font-extrabold text-2xl">{eta}m</p>
                    <p className="text-slate-400 text-xs">ETA</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-slate-900 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-slate-400 text-xs mb-2">Delivery PIN</p>
                <div className="flex gap-2">
                  {["•","•","•","•"].map((d, i) => (
                    <div key={i} className="flex-1 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg">{d}</div>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mt-2">Share this PIN with your rider on arrival</p>
              </div>
            </div>
          )}

          {/* ── DELIVERED ── */}
          {screen === "delivered" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center pb-20">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-2">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M8 18l6 6 14-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-slate-900 font-extrabold text-2xl mb-1">Cash delivered!</p>
                <p className="text-slate-400 text-sm">Your {fmt(finalAmt)} has been delivered</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full space-y-2 text-sm mt-2">
                {[["Amount", fmt(finalAmt)], ["Delivered at", "Just now"], ["Rider", "Chukwuemeka O."], ["Status", "✓ Completed"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}</span>
                    <span className="text-slate-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setScreen("home"); setCustomAmt(""); setSelectedAmt(50000); }}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-700 active:scale-95 mt-2">
                Back to home
              </button>
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {screen === "activity" && (
            <div className="flex flex-col h-full px-4 pb-20">
              <div className="flex items-center gap-3 py-4">
                <button onClick={() => setScreen("home")} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="text-slate-900 font-bold">All activity</span>
              </div>
              <div className="space-y-2 overflow-y-auto">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 text-sm font-semibold">Cash delivery</p>
                      <p className="text-slate-400 text-xs">{a.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-slate-900 font-bold text-sm">{a.amount}</p>
                      <p className="text-green-500 text-xs">{a.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Bottom nav ── */}
          {(screen === "home" || screen === "activity") && (
            <div className="absolute bottom-0 inset-x-3 bg-white border-t border-slate-100 flex items-center justify-around px-6 py-3 rounded-b-[36px]">
              <button onClick={() => setScreen("home")} className={`flex flex-col items-center gap-1 ${screen === "home" ? "text-slate-900" : "text-slate-300"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
                <span className="text-xs">Home</span>
              </button>

              <button onClick={() => setScreen("request")}
                className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 active:scale-95 -mt-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>

              <button onClick={() => setScreen("activity")} className={`flex flex-col items-center gap-1 ${screen === "activity" ? "text-slate-900" : "text-slate-300"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
                <span className="text-xs">Activity</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
