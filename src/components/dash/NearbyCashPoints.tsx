"use client";

import { useState } from "react";
import type { RecipientLocation } from "@/lib/dash/location";

const PIN_POSITIONS = [
  { left: "24%", top: "31%" },
  { left: "67%", top: "24%" },
  { left: "48%", top: "68%" },
];

export default function NearbyCashPoints({ location }: { location: RecipientLocation }) {
  const [selected, setSelected] = useState(0);
  const area = location.area.trim() || location.city.trim() || "your area";
  const street = location.street.trim() || `${area} main road`;
  const city = location.city.trim() || "Lagos";

  const points = [
    {
      name: `Dash Agent · ${area}`,
      detail: `${street}, ${city}`,
      distance: "0.4 km",
      hours: "Open now",
    },
    {
      name: "OPay POS · Central",
      detail: `${area} junction, ${city}`,
      distance: "0.9 km",
      hours: "Open now",
    },
    {
      name: `${city} Cash Point`,
      detail: "Bank agent · Card + transfer",
      distance: "1.6 km",
      hours: "Open until 8pm",
    },
  ];

  return (
    <div className="app-card overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <p className="eyebrow">Nearby cash points</p>
          <h3 className="mt-1 text-[17px] font-bold text-ink">Around {area}</h3>
          <p className="mt-0.5 text-[11px] text-ink-soft">
            Based on the recipient location you saved in Send.
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-violet-deep">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
      </div>

      <div className="relative mx-5 h-44 overflow-hidden rounded-[20px] border border-line bg-[#eef5f0]">
        <svg viewBox="0 0 400 180" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect width="400" height="180" fill="#eef5f0" />
          <path d="M0 44h400M0 108h400M0 158h400M74 0v180M188 0v180M302 0v180" stroke="#d9e5dc" strokeWidth="14" />
          <path d="M0 44h400M0 108h400M0 158h400M74 0v180M188 0v180M302 0v180" stroke="#ffffff" strokeWidth="8" />
          <path d="M188 108c40 0 38-56 114-56" stroke="#ffffff" strokeWidth="7" fill="none" />
          <rect x="88" y="56" width="72" height="34" rx="6" fill="#e2ece4" />
          <rect x="208" y="118" width="70" height="28" rx="6" fill="#e2ece4" />
          <rect x="316" y="56" width="58" height="34" rx="6" fill="#e2ece4" />
        </svg>

        {points.map((point, index) => (
          <button
            key={point.name}
            type="button"
            onClick={() => setSelected(index)}
            style={PIN_POSITIONS[index]}
            className={`absolute -translate-x-1/2 -translate-y-full transition-transform ${
              selected === index ? "scale-110" : "hover:scale-105"
            }`}
            aria-label={`Select ${point.name}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-[0_6px_14px_-4px_rgba(22,22,22,0.45)] ${
                selected === index ? "bg-ink text-lime" : "bg-violet text-white"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
          </button>
        ))}

        <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-semibold text-ink-soft shadow-sm">
          Demo map view
        </div>
      </div>

      <div className="divide-y divide-line px-5 py-2">
        {points.map((point, index) => (
          <button
            key={point.name}
            type="button"
            onClick={() => setSelected(index)}
            className={`flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors ${
              selected === index ? "bg-cream" : "hover:bg-cream/60"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                selected === index ? "bg-violet text-white" : "bg-cream text-ink-soft"
              }`}
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-ink">{point.name}</span>
              <span className="mt-0.5 block truncate text-[10px] text-ink-soft">{point.detail}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-[11px] font-bold text-ink">{point.distance}</span>
              <span className={`block text-[9px] ${point.hours === "Open now" ? "text-violet-deep" : "text-ink-soft"}`}>
                {point.hours}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
