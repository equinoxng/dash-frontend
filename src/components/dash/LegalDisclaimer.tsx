export default function LegalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] leading-relaxed text-ink-soft/70 ${className}`}>
      Dash by Equinoxng is a technology platform operated by Equinoxng Digital Services Ltd. Equinoxng is not a bank,
      payment service provider, or licensed financial institution. Payment, wallet, and money-movement services
      available through Dash are provided by licensed third-party partners and are subject to their terms and
      applicable regulations.
    </p>
  );
}
