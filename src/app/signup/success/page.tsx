"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

const WHATSAPP_LINKS = {
  rider: "https://chat.whatsapp.com/FKdxRwQU66iKwvwl8kVEya?mode=gi_t",
  merchant: "https://chat.whatsapp.com/CcB4pU8SdewKfyzXM7vPVP?mode=gi_t",
};

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const type = params.get("type") === "merchant" ? "merchant" : "rider";
  const isRider = type === "rider";
  const whatsappLink = WHATSAPP_LINKS[type];
  const roleLabel = isRider ? "rider" : "merchant";

  return (
    <AuthShell
      eyebrow="Application received"
      title="You’re on the list."
      subtitle={`Your ${roleLabel} application has been created. Our team will review your details and reach out shortly.`}
      footer={
        <Link href="/" className="font-semibold text-ink-soft hover:text-ink">
          Back to home
        </Link>
      }
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
          <path d="m6 14 5 5L22 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="mt-7 rounded-2xl border border-line bg-paper p-5 text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <WhatsAppIcon />
          </span>
          <div>
            <p className="text-[12.5px] font-bold text-ink">Join the {roleLabel} community</p>
            <p className="mt-0.5 text-[10.5px] text-ink-soft">
              WhatsApp · Dash {isRider ? "Riders" : "Merchants"} NG
            </p>
          </div>
        </div>
        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-soft">
          You’ve been added to our {roleLabel} WhatsApp community for dispatch alerts, earnings updates, support and
          announcements.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-block mt-4 !bg-[#25D366] !text-white hover:!bg-[#1eb357]"
        >
          <WhatsAppIcon size={16} />
          Open WhatsApp community
        </a>
      </div>

      <div className="mt-4 rounded-2xl border border-violet/15 bg-violet-soft px-4 py-3 text-[11px] leading-relaxed text-violet-deep">
        The full {isRider ? "Rider" : "Merchant"} Dashboard is coming in a future version of the app.
      </div>
    </AuthShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
