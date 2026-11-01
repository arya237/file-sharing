import { useCallback, useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileUp, X } from "lucide-react";
import { uploadFile } from "../api/files";
import { useToast } from "./Toast";
import { formatBytes } from "../lib/format";
import type { FileRecord } from "../types";

const MAX_SIZE = 100 * 1024 * 1024;

interface UploadState {
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface UploadDropzoneProps {
  onUploaded: (file: FileRecord) => void;
}

export function UploadDropzone({ onUploaded }: UploadDropzoneProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const enqueue = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE) {
        toast.push(
          "error",
          `“${file.name}” is too large`,
          "The limit is 100 MB per file."
        );
        return;
      }
      const id = crypto.randomUUID();
      setUploads((prev) => [
        ...prev,
        { id, file: file, progress: 0, status: "uploading" },
      ]);
      try {
        const record = await uploadFile(file, ({ loaded, total }) => {
          const pct = total ? Math.round((loaded / total) * 100) : 0;
          setUploads((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, progress: pct } : u
            )
          );
        });
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, progress: 100, status: "done" } : u
          )
        );
        onUploaded(record);
        toast.push("success", "Upload complete", file.name);
        window.setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.file !== file));
        }, 2200);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: "error", error: message } : u
          )
        );
        toast.push("error", "Upload failed", message);
      }
    },
    [onUploaded, toast]
  );

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) Array.from(files).forEach(enqueue);
    event.target.value = "";
  };

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) {
      Array.from(event.dataTransfer.files).forEach(enqueue);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 ${
          dragging
            ? "border-brand-400 bg-brand-500/10 ring-glow"
            : "border-white/15 bg-white/[0.02] hover:border-brand-400/60 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onChange}
          aria-label="Upload files"
        />
        <span
          className={`grid h-16 w-16 place-items-center rounded-2xl transition-all duration-300 ${
            dragging
              ? "scale-110 bg-gradient-to-br from-brand-500 to-violet-500"
              : "bg-white/[0.06] group-hover:scale-105 group-hover:bg-brand-500/20"
          }`}
        >
          <UploadCloud
            className={`h-8 w-8 transition-colors ${
              dragging ? "text-white" : "text-brand-400"
            }`}
          />
        </span>
        <div>
          <p className="text-base font-semibold text-white">
            Drag & drop files here
          </p>
          <p className="mt-1 text-sm text-slate-400">
            or{" "}
            <span className="font-semibold text-brand-300 underline-offset-4 group-hover:underline">
              browse
            </span>{" "}
            your device — up to 100 MB each
          </p>
        </div>
        <p className="text-xs text-slate-600">
          Images, PDFs, archives &amp; more
        </p>
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u, idx) => (
            <li
              key={u.file === (uploads[idx - 1]?.file ?? null) ? idx + Math.random() : `${u.file.name}-${u.file.size}-${idx}`}
              className="glass flex items-center gap-3 rounded-xl p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.06]">
                <FileUp className="h-4 w-4 text-brand-300" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    {u.file.name}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">
                    {u.status === "uploading"
                      ? `${u.progress}%`
                      : u.status === "done"
                        ? "Done"
                        : "Error"}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      u.status === "error"
                        ? "bg-rose-500"
                        : "bg-gradient-to-r from-brand-500 to-cyan-400"
                    }`}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
                {u.status === "error" ? (
                  <p className="mt-1 truncate text-xs text-rose-400">
                    {u.error ?? "Upload failed"}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(u.file.size)}
                  </p>
                )}
              </div>
              {u.status === "uploading" && (
                <button
                  onClick={() => {
                    /* XHR abort isn't exposed yet; just clear UI row */
                  }}
                  className="rounded-lg p-1 text-slate-500 hover:text-white"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}