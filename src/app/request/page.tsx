"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatNaira, createCashRequest, confirmDelivery } from "@/lib/requests";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";
import PinModal from "@/components/PinModal";
import VerifyPhoneBanner from "@/components/VerifyPhoneBanner";

type Stage = "amount" | "confirm" | "searching" | "onway" | "arrived" | "delivered";

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000];
const DELIVERY_FEE = 500;
const SERVICE_FEE = 100;
const TOTAL_TICKS = 18;

function genPin() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
}

// Rider path: SVG coords from start to destination
const RIDER_START = { x: 310, y: 40 };
const DEST = { x: 195, y: 155 };

export default function RequestCash() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("amount");
  const [selectedAmt, setSelectedAmt] = useState(20000);
  const [customAmt, setCustomAmt] = useState("");
  const [error, setError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [tick, setTick] = useState(0); // 0 → TOTAL_TICKS
  const [pin] = useState(genPin());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finalAmt = customAmt ? parseInt(customAmt.replace(/\D/g, "")) || selectedAmt : selectedAmt;
  const total = finalAmt + DELIVERY_FEE + SERVICE_FEE;
  const progress = Math.min((tick / TOTAL_TICKS) * 100, 100);
  const eta = Math.max(TOTAL_TICKS - tick, 0);

  // Rider position interpolated along path
  const riderX = RIDER_START.x + (DEST.x - RIDER_START.x) * (progress / 100);
  const riderY = RIDER_START.y + (DEST.y - RIDER_START.y) * (progress / 100);

  const STEPS = [
    { label: "Vendor assigned", sub: "Chidi is preparing your cash", done: tick >= 0 },
    { label: "Cash secured", sub: "Notes counted and sealed in pouch", done: tick >= 5 },
    { label: "En route to you", sub: "Heading to your location", done: tick >= 10 },
    { label: "Arrived", sub: "Enter your PIN to confirm handoff", done: tick >= TOTAL_TICKS },
  ];

  useEffect(() => {
    if (stage === "onway") {
      setTick(0);
      timerRef.current = setInterval(() => {
        setTick((t) => {
          if (t >= TOTAL_TICKS - 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setStage("arrived");
            return TOTAL_TICKS;
          }
          return t + 1;
        });
      }, 800);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage]);

  const handleContinue = () => {
    if (finalAmt <= 0) { setError("Enter a valid amount."); return; }
    setError("");
    setStage("confirm");
  };

  const handlePinConfirm = async (pin: string) => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }

    setPinError("");
    setPinLoading(true);
    try {
      const request = await createCashRequest(session.token, {
        type: "RECEIVE_CASH",
        pin,
        amount: finalAmt,
      });
      setPinLoading(false);
      setShowPin(false);
      setRequestId(request.requestId);
      setStage("searching");
      setTimeout(() => setStage("onway"), 2200);
    } catch (err) {
      setPinLoading(false);
      setPinError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleConfirm = () => { setPinError(""); setShowPin(true); };

  const handleConfirmDelivery = async () => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }

    setConfirmLoading(true);
    try {
      await confirmDelivery(session.token, requestId);
      setStage("delivered");
    } catch {
      setError("Could not confirm delivery. Please try again.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDone = () => router.push("/dashboard");

  // Contained immersive layout for onway / arrived
  if (stage === "onway" || stage === "arrived") {
    const isArrived = stage === "arrived";
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
        <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl" style={{ background: "#111" }}>
        {/* ── MAP ── */}
        <div className="relative" style={{ height: 260 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice">
            {/* Map background */}
            <rect width="400" height="280" fill="#ede9e2"/>

            {/* Green parks */}
            <rect x="88" y="78" width="44" height="58" rx="6" fill="#c5d4b2"/>
            <rect x="215" y="78" width="90" height="58" rx="6" fill="#c5d4b2"/>
            <rect x="10" y="160" width="55" height="40" rx="5" fill="#c5d4b2"/>
            <rect x="330" y="170" width="65" height="50" rx="5" fill="#c5d4b2"/>

            {/* Building blocks */}
            <rect x="215" y="160" width="50" height="28" rx="4" fill="#d9d4cc"/>
            <rect x="275" y="160" width="45" height="28" rx="4" fill="#d9d4cc"/>
            <rect x="340" y="78" width="55" height="78" rx="5" fill="#d9d4cc"/>
            <rect x="10" y="10" width="65" height="55" rx="5" fill="#d9d4cc"/>
            <rect x="145" y="10" width="40" height="35" rx="4" fill="#d9d4cc"/>

            {/* Major roads (white, wider) */}
            <line x1="0" y1="70" x2="400" y2="70" stroke="white" strokeWidth="10"/>
            <line x1="0" y1="150" x2="400" y2="150" stroke="white" strokeWidth="7"/>
            <line x1="0" y1="210" x2="400" y2="210" stroke="white" strokeWidth="10"/>
            <line x1="80" y1="0" x2="80" y2="280" stroke="white" strokeWidth="10"/>
            <line x1="200" y1="0" x2="200" y2="280" stroke="white" strokeWidth="7"/>
            <line x1="320" y1="0" x2="320" y2="280" stroke="white" strokeWidth="10"/>

            {/* Minor roads */}
            <line x1="0" y1="110" x2="400" y2="110" stroke="white" strokeWidth="4"/>
            <line x1="0" y1="180" x2="400" y2="180" stroke="white" strokeWidth="4"/>
            <line x1="140" y1="0" x2="140" y2="280" stroke="white" strokeWidth="4"/>
            <line x1="260" y1="0" x2="260" y2="280" stroke="white" strokeWidth="4"/>

            {/* Diagonal road */}
            <line x1="80" y1="150" x2="200" y2="210" stroke="white" strokeWidth="6"/>
            <line x1="200" y1="70" x2="320" y2="150" stroke="white" strokeWidth="5"/>

            {/* Road dashes (center lines) */}
            {[110, 150, 180].map((y, i) => (
              [0,1,2,3,4,5,6,7,8,9].map(j => (
                <line key={`h${i}-${j}`} x1={j*45} y1={y} x2={j*45+22} y2={y}
                  stroke="#e5e1da" strokeWidth="1.5" strokeDasharray="none"/>
              ))
            ))}

            {/* Destination pin (user location) */}
            <circle cx={DEST.x} cy={DEST.y} r="18" fill="white" opacity="0.9"/>
            <circle cx={DEST.x} cy={DEST.y} r="13" fill="white"/>
            <path d={`M${DEST.x} ${DEST.y - 7} L${DEST.x + 4} ${DEST.y + 2} L${DEST.x - 4} ${DEST.y + 2} Z`}
              fill="#1e1240" stroke="#1e1240" strokeWidth="0.5"/>
            <circle cx={DEST.x} cy={DEST.y - 9} r="4" fill="#1e1240"/>

            {/* Pulse ring around destination */}
            <circle cx={DEST.x} cy={DEST.y} r="26" fill="none" stroke="#5b3fc4" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="18;30;18" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
            </circle>

            {/* Rider dot moving along path */}
            <g transform={`translate(${riderX}, ${riderY})`} style={{ transition: "transform 0.7s linear" }}>
              <circle cx="0" cy="0" r="18" fill="#111" opacity="0.9"/>
              <circle cx="0" cy="0" r="14" fill="#1e1240"/>
              {/* bike icon */}
              <circle cx="-5" cy="3" r="4.5" fill="none" stroke="white" strokeWidth="1.4"/>
              <circle cx="5" cy="3" r="4.5" fill="none" stroke="white" strokeWidth="1.4"/>
              <path d="M-5 3 L0 -3 L5 3" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              <circle cx="0" cy="-5" r="1.5" fill="white"/>
            </g>
          </svg>

          {/* Close button */}
          <button onClick={() => router.push("/dashboard")}
            className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.65)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Subtle fade — just 8px */}
          <div className="absolute bottom-0 left-0 right-0 h-8"
            style={{ background: "linear-gradient(to bottom, transparent, #111)" }}/>
        </div>

        {/* ── BOTTOM SHEET — rounded top corners ── */}
        <div className="px-5 pt-5 pb-8 rounded-t-3xl -mt-4 relative" style={{ background: "#111", color: "white" }}>
          {/* drag handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#333" }}/>

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-slate-400 text-sm mb-0.5">
                {isArrived ? "Vendor has arrived" : `Rider on the way · ${eta}m ETA`}
              </p>
              <h1 className="text-3xl font-extrabold">
                {isArrived ? "At your door" : "En route to you"}
              </h1>
            </div>
            <div className="rounded-xl px-3 py-2 text-right shrink-0 ml-3" style={{ background: "#1e1e1e" }}>
              <p className="text-slate-400 text-xs">Delivering</p>
              <p className="font-extrabold text-sm">{formatNaira(finalAmt)}</p>
            </div>
          </div>

          {/* Rider card */}
          <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "#1e1e1e" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: "#2d2d2d", color: "white" }}>CO</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold">Chidi Okafor</p>
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#facc15"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                4.9 · Bike rider · Sealed cash pouch
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#2d2d2d" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#2d2d2d" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72A12.84 12.84 0 007.7 5.53a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16z"/></svg>
              </button>
            </div>
          </div>

          {/* Progress steps */}
          <div className="space-y-0 mb-6">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                {/* Icon + line */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500"
                    style={{
                      borderColor: step.done ? "white" : "#3d3d3d",
                      background: step.done ? "white" : "transparent",
                    }}>
                    {step.done && (
                      i === STEPS.length - 1 && !isArrived
                        ? <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#111" }}/>
                        : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                    {!step.done && i === STEPS.findIndex(s => !s.done) && (
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#5b3fc4" }}/>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 my-1 transition-all duration-500"
                      style={{ background: step.done ? "white" : "#3d3d3d", minHeight: 24 }}/>
                  )}
                </div>
                {/* Text */}
                <div className="pb-5">
                  <p className="font-semibold text-sm transition-colors" style={{ color: step.done ? "white" : "#555" }}>
                    {step.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: step.done ? "#888" : "#444" }}>
                    {step.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery PIN (shown when arrived) */}
          {isArrived && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "#1e1e1e" }}>
              <p className="text-slate-400 text-xs mb-2">Delivery PIN — share with rider</p>
              <div className="flex gap-2">
                {pin.split("").map((d, i) => (
                  <div key={i} className="flex-1 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl"
                    style={{ background: "#2d2d2d", color: "white" }}>{d}</div>
                ))}
              </div>
            </div>
          )}

          {/* CTA button */}
          {isArrived ? (
            <button onClick={handleConfirmDelivery} disabled={confirmLoading}
              className="w-full font-bold py-4 rounded-2xl text-[#111] hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: "#f0ede8" }}>
              {confirmLoading ? "Confirming…" : "Confirm delivery"}
            </button>
          ) : (
            <div className="rounded-2xl py-3 px-4 text-center text-xs" style={{ color: "#555" }}>
              {/* ETA progress bar */}
              <div className="w-full rounded-full h-1 mb-2" style={{ background: "#2d2d2d" }}>
                <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "#5b3fc4" }}/>
              </div>
              Rider is {eta} min away
            </div>
          )}

          {/* Address */}
          <p className="text-center text-xs mt-4" style={{ color: "#444" }}>
            {["14 Adeola Odeku St, Victoria Island", "1 Idejo St, Lagos Island", "Balogun Market, Stall 22, Lagos"][selectedAddress]}
          </p>
        </div>
        </div>{/* /max-w-md card */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f5f0eb" }}>
      <Link href="/dashboard" className="mb-8">
        <Image src="/logo.png" alt="Dash by Equinox" width={100} height={38} priority />
      </Link>

      <div className="w-full max-w-md">
        <VerifyPhoneBanner />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#e0d9d0" }}>

        {/* ── AMOUNT ── */}
        {stage === "amount" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <h1 className="text-xl font-extrabold text-[#0f0f0f]">Request cash</h1>
            </div>

            <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Select amount</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map((a) => (
                <button key={a} onClick={() => { setSelectedAmt(a); setCustomAmt(""); setError(""); }}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: selectedAmt === a && !customAmt ? "#1e1240" : "#f5f0eb",
                    color: selectedAmt === a && !customAmt ? "white" : "#334155",
                  }}>
                  {formatNaira(a)}
                </button>
              ))}
            </div>

            <label className="text-slate-400 text-xs mb-1.5 block uppercase tracking-widest">Or enter amount</label>
            <div className="border rounded-xl px-4 py-3 flex items-center gap-2 mb-5" style={{ borderColor: "#e0d9d0" }}>
              <span className="text-slate-400 font-bold">₦</span>
              <input type="number" placeholder="0" value={customAmt}
                onChange={(e) => { setCustomAmt(e.target.value); setError(""); }}
                className="bg-transparent text-[#0f0f0f] text-lg font-bold flex-1 outline-none placeholder-slate-300" />
            </div>

            <div className="rounded-xl p-4 mb-5 space-y-2 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)], ["Service fee", formatNaira(SERVICE_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="text-slate-500">Total deducted</span>
                <span className="text-[#0f0f0f] font-bold">{formatNaira(total)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <button onClick={handleContinue}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: "#1e1240" }}>
              Continue →
            </button>
          </>
        )}

        {/* ── CONFIRM ── */}
        {stage === "confirm" && (() => {
          const ADDRESSES = [
            { label: "Home", sub: "14 Adeola Odeku St, Victoria Island" },
            { label: "Work", sub: "1 Idejo St, Lagos Island" },
            { label: "Market", sub: "Balogun Market, Stall 22, Lagos" },
          ];
          return (
          <>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => setStage("amount")} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f5f0eb" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div>
                <h1 className="text-lg font-extrabold text-[#0f0f0f] leading-tight">Request cash</h1>
                <p className="text-slate-400 text-xs">Step 2 of 2</p>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1.5 mb-6">
              <div className="h-1 flex-1 rounded-full" style={{ background: "#1e1240" }} />
              <div className="h-1 flex-1 rounded-full" style={{ background: "#1e1240" }} />
            </div>

            {/* Deliver to */}
            <p className="text-sm font-bold text-[#0f0f0f] mb-3">Deliver to</p>
            <div className="space-y-2 mb-4">
              {ADDRESSES.map((addr, i) => (
                <button key={addr.label} onClick={() => setSelectedAddress(i)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
                  style={{
                    background: selectedAddress === i ? "#1e1240" : "#f5f0eb",
                    borderColor: selectedAddress === i ? "#1e1240" : "#e0d9d0",
                  }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: selectedAddress === i ? "rgba(255,255,255,0.12)" : "#e0d9d0" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke={selectedAddress === i ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: selectedAddress === i ? "white" : "#0f0f0f" }}>{addr.label}</p>
                    <p className="text-xs truncate" style={{ color: selectedAddress === i ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{addr.sub}</p>
                  </div>
                  {selectedAddress === i && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* ETA */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4" style={{ background: "#f5f0eb" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              <span className="text-sm text-slate-500">Estimated arrival <span className="font-semibold text-[#0f0f0f]">12–18 min</span></span>
            </div>

            {/* Fee breakdown */}
            <div className="rounded-2xl px-4 py-4 mb-4 space-y-2.5 text-sm" style={{ background: "#f5f0eb" }}>
              {[["Cash amount", formatNaira(finalAmt)], ["Delivery fee", formatNaira(DELIVERY_FEE)]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-semibold">{v}</span>
                </div>
              ))}
              <div className="border-t pt-2.5 flex justify-between" style={{ borderColor: "#e0d9d0" }}>
                <span className="text-[#0f0f0f] font-bold">Total debited</span>
                <span className="text-[#0f0f0f] font-bold">{formatNaira(finalAmt + DELIVERY_FEE)}</span>
              </div>
            </div>

            {/* Escrow note */}
            <div className="flex items-start gap-2.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              <p className="text-xs text-slate-400">Funds are held in escrow until your PIN confirms the handoff.</p>
            </div>

            <button onClick={handleConfirm}
              className="w-full font-bold py-4 rounded-2xl text-[#0f0f0f] hover:opacity-90 transition-opacity"
              style={{ background: "#eee9e3" }}>
              Confirm & dispatch vendor
            </button>
          </>
          );
        })()}

        {/* ── SEARCHING ── */}
        {stage === "searching" && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 animate-ping" style={{ borderColor: "#ede8fb" }} />
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#1e1240", borderTopColor: "transparent" }} />
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow">
                <Image src="/logo.png" alt="Dash" width={32} height={20} />
              </div>
            </div>
            <div>
              <p className="text-[#0f0f0f] font-bold text-lg mb-1">Finding your rider…</p>
              <p className="text-slate-400 text-sm">Usually takes under 30 seconds</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#1e1240", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── DELIVERED ── */}
        {stage === "delivered" && (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: "#1e1240" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-[#0f0f0f] font-extrabold text-2xl">Cash delivered!</p>
            <p className="text-slate-500 text-sm mb-2">Your {formatNaira(finalAmt)} has been delivered</p>
            <div className="rounded-2xl p-4 w-full space-y-2 text-sm mt-2" style={{ background: "#f5f0eb" }}>
              {[["Amount", formatNaira(finalAmt)], ["Delivered at", "Just now"], ["Rider", "Chidi Okafor"], ["Status", "✓ Completed"]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-[#0f0f0f] font-medium">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleDone}
              className="w-full font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity mt-4"
              style={{ background: "#1e1240" }}>
              Back to dashboard
            </button>
          </div>
        )}
      </div>

      {showPin && (
        <PinModal
          title="Confirm request"
          subtitle="Enter your 4-digit PIN to dispatch your rider"
          loading={pinLoading}
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => setShowPin(false)}
        />
      )}
    </div>
  );
}
