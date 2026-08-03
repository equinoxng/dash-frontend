"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitKyc, IDENTIFICATION_TYPES, type UserProfile } from "@/lib/auth";
import { getSession } from "@/lib/session";
import FileUploadField from "@/components/FileUploadField";

export default function VerifyIdentityPage() {
  const router = useRouter();
  const session = getSession();
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!session) router.push("/signin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploaded = (result: UserProfile | null) => {
    if (result) setSubmitted(true);
  };

  if (!session) return null;

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
        <h1 className="text-2xl font-extrabold text-ink">Verify your identity</h1>
        <p className="text-ink-soft text-sm -mt-3">Submit a government ID to unlock higher limits.</p>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-line p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            </div>
            <p className="font-semibold text-ink">Submitted for review</p>
            <p className="text-ink-soft text-sm">We&apos;ll notify you once your identity has been verified.</p>
            <Link href="/profile" className="inline-block mt-2 text-sm font-semibold text-accent hover:underline">Back to profile</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-line p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">ID type</label>
              <select value={idType} onChange={(e) => setIdType(e.target.value)} className="dash-input">
                <option value="">Select ID type</option>
                {Object.keys(IDENTIFICATION_TYPES).map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">ID number</label>
              <input type="text" placeholder="12345678901" value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)} className="dash-input" />
            </div>

            {idType && idNumber ? (
              <FileUploadField
                label="Upload ID document"
                upload={(file, onProgress) => submitKyc(session.token, IDENTIFICATION_TYPES[idType], idNumber, file, onProgress)}
                onUploaded={handleUploaded}
              />
            ) : (
              <p className="text-xs text-ink-soft">Select an ID type and enter the number to upload your document.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
