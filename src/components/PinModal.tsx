"use client";
import { useState, useRef, useEffect } from "react";

interface PinModalProps {
  title?: string;
  subtitle?: string;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export default function PinModal({ title = "Enter your PIN", subtitle = "Confirm this transaction with your 4-digit PIN", onConfirm, onCancel, loading = false, error: externalError }: PinModalProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setPin(["", "", "", ""]);
      inputs.current[0]?.focus();
    }
  }, [externalError]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...pin];
    next[i] = digit;
    setPin(next);
    setError("");
    if (digit && i < 3) inputs.current[i + 1]?.focus();
    if (digit && i === 3) {
      const full = [...next].join("");
      if (full.length === 4) onConfirm(full);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4).split("");
    const next = ["", "", "", ""];
    digits.forEach((d, i) => { next[i] = d; });
    setPin(next);
    if (digits.length === 4) onConfirm(next.join(""));
    else inputs.current[Math.min(digits.length, 3)]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-t-3xl p-6 pb-10" style={{ background: "white" }}>
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#e0d9d0" }} />

        {/* Lock icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#ede8fb" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-[#0f0f0f] text-center mb-1">{title}</h2>
        <p className="text-slate-400 text-sm text-center mb-6">{subtitle}</p>

        {/* PIN inputs */}
        <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
          {pin.map((digit, i) => (
            <input key={i}
              ref={el => { inputs.current[i] = el; }}
              type="password" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
              className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-2xl focus:outline-none transition-all"
              style={{
                borderColor: digit ? "#1e1240" : error ? "#ef4444" : "#e0d9d0",
                background: digit ? "#f5f0ff" : "white",
                color: "#0f0f0f",
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#e0d9d0" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="#1e1240" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        <button onClick={onCancel} disabled={loading}
          className="w-full text-sm font-medium py-3 rounded-xl transition-colors hover:opacity-70"
          style={{ color: "#94a3b8" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
