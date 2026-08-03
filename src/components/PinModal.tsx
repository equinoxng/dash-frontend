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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-t-3xl border-t-2 border-x-2 border-ink p-6 pb-10">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5 bg-line" />

        {/* Lock icon */}
        <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-ink text-center mb-1">{title}</h2>
        <p className="text-ink-soft text-sm text-center mb-6">{subtitle}</p>

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
              className={`dash-otp-box w-14 h-16 text-center text-2xl font-bold text-ink focus:outline-none transition-all ${digit ? "filled" : ""} ${error ? "error" : ""}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-600 text-xs text-center bg-danger-light border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>
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
          className="w-full text-sm font-medium py-3 rounded-xl transition-colors text-ink-soft hover:text-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}
