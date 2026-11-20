import Link from "next/link";

export default function Wordmark({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="inline-flex flex-col leading-none" aria-label="Dash by Equinox — home">
      <span
        className={`text-[25px] font-black leading-[0.8] tracking-[-0.075em] ${dark ? "text-white" : "text-ink"}`}
      >
        dash<span className="text-violet">.</span>
      </span>
      <span
        className={`mt-1 text-[7px] font-bold uppercase tracking-[0.19em] ${
          dark ? "text-white/45" : "text-ink-soft"
        }`}
      >
        by Equinox
      </span>
    </Link>
  );
}
