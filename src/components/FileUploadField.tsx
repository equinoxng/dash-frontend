"use client";
import { useRef, useState } from "react";
import { uploadIdentityDocument, deleteIdentityDocument, type UploadedFile } from "@/lib/auth";
import { ApiError } from "@/lib/api";

type Status = "idle" | "uploading" | "done" | "error";

interface FileUploadFieldProps {
  label: string;
  phoneNumber: string;
  accept?: string;
  onUploaded?: (file: UploadedFile | null) => void;
}

export default function FileUploadField({ label, phoneNumber, accept = "image/*,.pdf", onUploaded }: FileUploadFieldProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStatus("idle");
    setFileName("");
    setPreviewUrl(null);
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSelect = (file: File) => {
    setFileName(file.name);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    setStatus("uploading");
    setProgress(0);
    setError("");

    const { promise, abort } = uploadIdentityDocument(phoneNumber, file, setProgress);
    abortRef.current = abort;

    promise
      .then((uploaded) => {
        setStatus("done");
        onUploaded?.(uploaded);
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
      });
  };

  const handleRemove = () => {
    if (status === "uploading") {
      abortRef.current?.();
    } else if (status === "done") {
      deleteIdentityDocument(phoneNumber).catch(() => {});
    }
    onUploaded?.(null);
    reset();
  };

  if (status === "idle") {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-colors bg-slate-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 text-slate-400"><path d="M12 16V8m0 0l-3 3m3-3l3 3M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-xs text-slate-500">Upload NIN slip or passport</span>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSelect(file);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative w-full border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center gap-3">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-14 h-14 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
          {status === "uploading" && (
            <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {status === "uploading" && <p className="text-xs text-slate-400 mt-1">Uploading… {progress}%</p>}
          {status === "done" && <p className="text-xs text-emerald-600 mt-1">Uploaded</p>}
          {status === "error" && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove file"
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>
      </div>
    </div>
  );
}
