"use client";

import { normalizePhoneInput } from "@/lib/phone";

export default function PhoneField({
  id,
  value,
  onChange,
  label = "Phone number",
  autoComplete = "tel",
  placeholder = "801 234 5678",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="flex gap-2">
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-[14px] border border-line-strong bg-paper px-3 text-[12px] font-semibold text-ink-soft">
          <span aria-hidden>🇳🇬</span> +234
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(normalizePhoneInput(event.target.value))}
          className="field min-w-0 flex-1"
        />
      </div>
    </div>
  );
}
