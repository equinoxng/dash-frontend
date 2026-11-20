/* eslint-disable @next/next/no-img-element -- local blob previews cannot use next/image */
"use client";

import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";

type Status = "idle" | "uploading" | "done" | "error";

interface FileUploadFieldProps<T> {
  label: string;
  accept?: string;
  upload: (file: File, onProgress: (percent: number) => void) => { promise: Promise<T>; abort: () => void };
  onRemove?: () => void | Promise<void>;
  onUploaded?: (result: T | null) => void;
}

export default function FileUploadField<T>({
  label,
  accept = "image/*,.pdf",
  upload,
  onRemove,
  onUploaded,
}: FileUploadFieldProps<T>) {
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
    onUploaded?.(null);

    const { promise, abort } = upload(file, setProgress);
    abortRef.current = abort;

    promise
      .then((result) => {
        setStatus("done");
        onUploaded?.(result);
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
      Promise.resolve(onRemove?.()).catch(() => {});
    }
    onUploaded?.(null);
    reset();
  };

  if (status === "idle") {
    return (
      <div>
        <span className="field-label">{label}</span>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-paper px-4 py-5 text-center transition-colors hover:border-violet hover:bg-violet-soft/40">
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet shadow-soft">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 16V8m0 0-3 3m3-3 3 3M4 20h16" />
            </svg>
          </span>
          <span className="text-[12px] font-semibold text-ink">Choose a file</span>
          <span className="mt-1 text-[10.5px] text-ink-soft">JPG, PNG, WEBP or PDF</span>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleSelect(file);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-line-strong bg-paper p-3">
        {previewUrl ? (
          <img src={previewUrl} alt="Selected document preview" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink-soft">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-ink">{fileName}</p>
          {status === "uploading" && (
            <>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-violet transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-[10.5px] text-ink-soft">Uploading… {progress}%</p>
            </>
          )}
          {status === "done" && <p className="mt-1 text-[10.5px] font-semibold text-success">Uploaded securely</p>}
          {status === "error" && <p className="mt-1 text-[10.5px] font-semibold text-danger">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove file"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="m1 1 12 12M13 1 1 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
