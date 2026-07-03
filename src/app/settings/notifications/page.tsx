"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNotificationPreferences, updateNotificationPreferences, type NotificationPreferences } from "@/lib/auth";
import { getSession } from "@/lib/session";

const TOGGLES: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: "deliveryUpdates", label: "Delivery updates", description: "Status changes for your Send and Request cash deliveries" },
  { key: "promotions", label: "Promotions", description: "Offers, discounts and new features from Dash" },
  { key: "securityAlerts", label: "Security alerts", description: "Sign-ins, PIN and password changes" },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-11 h-6 rounded-full relative transition-colors shrink-0"
      style={{ background: on ? "#1e1240" : "#e0d9d0" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }} />
    </button>
  );
}

export default function NotificationSettings() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }
    getNotificationPreferences(session.token).then(setPrefs).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (key: keyof NotificationPreferences) => {
    const session = getSession();
    if (!session || !prefs) return;

    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      await updateNotificationPreferences(session.token, next);
    } catch {
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      <nav className="sticky top-0 z-40 border-b px-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "white", border: "1px solid #e0d9d0" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Notifications</h1>

        {prefs && (
          <div className="rounded-2xl overflow-hidden border" style={{ background: "white", borderColor: "#e0d9d0" }}>
            {TOGGLES.map((t, i) => (
              <div key={t.key} className="flex items-center gap-3 px-4 py-4"
                style={{ borderTop: i > 0 ? "1px solid #e0d9d0" : "none" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0f0f0f]">{t.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                </div>
                <Toggle on={prefs[t.key]} onClick={() => toggle(t.key)} />
              </div>
            ))}
          </div>
        )}

        {saving && <p className="text-slate-400 text-xs px-1">Saving…</p>}
      </div>
    </div>
  );
}
