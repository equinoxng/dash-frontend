"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/lib/session";

export default function VerifyPhoneBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const session = getSession();

  if (!session || session.phoneVerified || dismissed) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3 mb-4 text-sm" style={{ background: "#fff7ed", borderColor: "#fed7aa" }}>
      <span className="flex-1 text-amber-800">Verify your phone number to protect your account.</span>
      <button
        onClick={() => router.push(`/verify?from=${encodeURIComponent(pathname)}`)}
        className="font-semibold text-amber-900 hover:underline whitespace-nowrap"
      >
        Verify now
      </button>
      <button onClick={() => setDismissed(true)} className="text-amber-700 hover:text-amber-900 whitespace-nowrap">
        Skip for now
      </button>
    </div>
  );
}
