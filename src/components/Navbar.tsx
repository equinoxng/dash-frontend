"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="Dash by Equinox" width={80} height={30} priority />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</Link>
          <Link href="/signup/rider" className="hover:text-slate-900 transition-colors">Become a Rider</Link>
          <Link href="#merchants" className="hover:text-slate-900 transition-colors">For Merchants</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/signin" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors">
            Sign in
          </Link>
          <Link href="/signup"
            className="text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ background: "#1e1240" }}>
            Get started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-white/50">
          {open
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
          }
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
          <Link href="#how-it-works" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">How it works</Link>
          <Link href="/signup/rider" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">Become a Rider</Link>
          <Link href="#merchants" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">For Merchants</Link>
          <hr style={{ borderColor: "#e0d9d0" }} />
          <Link href="/signin" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">Sign in</Link>
          <Link href="/signup" onClick={() => setOpen(false)}
            className="w-full text-center text-sm font-bold px-4 py-2.5 rounded-lg text-white"
            style={{ background: "#1e1240" }}>
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
