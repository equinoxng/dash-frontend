"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MENU = [
  {
    section: "Account",
    items: [
      { label: "Edit profile", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, href: "#" },
      { label: "Bank accounts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>, href: "/settings/bank" },
      { label: "Change PIN", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, href: "#" },
      { label: "Change password", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, href: "#" },
    ],
  },
  {
    section: "Preferences",
    items: [
      { label: "Notifications", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>, href: "#" },
      { label: "Delivery address", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, href: "#" },
    ],
  },
  {
    section: "Support",
    items: [
      { label: "Help & FAQ", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, href: "#" },
      { label: "Contact support", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/></svg>, href: "#" },
      { label: "Terms & Privacy", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>, href: "#" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/signin");
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b px-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "white", border: "1px solid #e0d9d0" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Image src="/logo.png" alt="Dash" width={72} height={28} />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold mb-3" style={{ background: "#1e1240" }}>
            AO
          </div>
          <h1 className="text-xl font-extrabold text-[#0f0f0f]">Ada Okafor</h1>
          <p className="text-slate-400 text-sm mt-0.5">+234 801 234 5678</p>
          <p className="text-slate-400 text-sm">ada@email.com</p>
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#ede8fb", color: "#5b3fc4" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            Verified account
          </span>
        </div>

        {/* Menu sections */}
        {MENU.map((section) => (
          <div key={section.section}>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 px-1">{section.section}</p>
            <div className="rounded-2xl overflow-hidden border" style={{ background: "white", borderColor: "#e0d9d0" }}>
              {section.items.map((item, i) => (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#f5f0eb] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid #e0d9d0" : "none" }}>
                  <span className="text-slate-400">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium text-[#0f0f0f]">{item.label}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 10l4-3-4-3" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full font-semibold py-3.5 rounded-2xl text-sm transition-colors hover:opacity-80"
          style={{ background: "white", color: "#ef4444", border: "1px solid #fecaca" }}>
          Log out
        </button>

        <p className="text-center text-xs text-slate-400 pb-4">Dash by Equinox · v1.0.0</p>
      </div>
    </div>
  );
}
