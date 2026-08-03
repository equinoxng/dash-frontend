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
      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? "bg-ink" : "bg-line"}`}>
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
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-40 border-b-2 border-ink px-4 bg-cream">
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1e1240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-2xl font-extrabold text-ink">Notifications</h1>

        {prefs && (
          <div className="rounded-2xl overflow-hidden border border-line bg-white">
            {TOGGLES.map((t, i) => (
              <div key={t.key} className={`flex items-center gap-3 px-4 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{t.label}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{t.description}</p>
                </div>
                <Toggle on={prefs[t.key]} onClick={() => toggle(t.key)} />
              </div>
            ))}
          </div>
        )}

        {saving && <p className="text-ink-soft text-xs px-1">Saving…</p>}
      </div>
    </div>
  );
}
