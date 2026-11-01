import { useMemo, useState } from "react";
import { Copy, Check, Link2, Lock, ExternalLink } from "lucide-react";
import { Modal } from "./Modal";
import { FileIcon } from "./FileIcon";
import { useToast } from "./Toast";
import { useClipboard } from "../hooks/useClipboard";
import { createShare } from "../api/share";
import { buildShareAppUrl } from "../api/client";
import { formatBytes, mimeKind } from "../lib/format";
import type { FileRecord } from "../types";

type ExpiryOption = "never" | "hour" | "day" | "week" | "custom";

interface ShareModalProps {
  file: FileRecord | null;
  onClose: () => void;
}

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string; hint: string }[] = [
  { value: "never", label: "Never", hint: "Link stays valid forever" },
  { value: "hour", label: "1 hour", hint: "Best for a quick hand-off" },
  { value: "day", label: "1 day", hint: "Good for a day-long access" },
  { value: "week", label: "7 days", hint: "A week of access" },
  { value: "custom", label: "Custom", hint: "Pick an exact expiration" },
];

function toExpiry(option: ExpiryOption, custom: string): string | null {
  if (option === "never") return null;
  if (option === "custom") {
    if (!custom) return null;
    const date = new Date(custom);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const now = Date.now();
  const ms =
    option === "hour" ? 3600e3 : option === "day" ? 24 * 3600e3 : 7 * 24 * 3600e3;
  return new Date(now + ms).toISOString();
}

export function ShareModal({ file, onClose }: ShareModalProps) {
  const toast = useToast();
  const { copied, copy } = useClipboard();
  const [option, setOption] = useState<ExpiryOption>("never");
  const [custom, setCustom] = useState("");
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState<{ url: string; expiresAt: string | null } | null>(null);

  const kind = useMemo(
    () => (file ? mimeKind(file.MIMEType, file.Name) : "default"),
    [file]
  );

  if (!file) return null;

  const handleCreate = async () => {
    if (option === "custom" && !custom) {
      toast.push("error", "Pick an expiration date");
      return;
    }
    const expiry = toExpiry(option, custom);
    if (option === "custom" && expiry && new Date(expiry).getTime() <= Date.now()) {
      toast.push("error", "Expiration must be in the future");
      return;
    }
    setCreating(true);
    try {
      const res = await createShare(file.ID, expiry);
      setLink({ url: res.url, expiresAt: res.expires_at });
      toast.push("success", "Share link created", "Anyone with it can download the file until it expires.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create share link";
      toast.push("error", "Share failed", message);
    } finally {
      setCreating(false);
    }
  };

  const appUrl = link ? buildShareAppUrl(link.url) : "";

  return (
    <Modal
      open={!!file}
      onClose={onClose}
      title={link ? "Share link ready" : "Create a share link"}
      maxWidth="max-w-xl"
    >
      <div className="p-6">
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-900/60 p-4">
          <FileIcon kind={kind} name={file.Name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{file.Name}</p>
            <p className="mt-0.5 text-xs text-slate-400">{formatBytes(file.Size)}</p>
          </div>
        </div>

        {link ? (
          <>
            <div className="mt-5 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Shareable link
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 p-2 pl-4">
                <Link2 className="h-4 w-4 shrink-0 text-brand-400" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-brand-200">
                  {appUrl}
                </span>
                <button
                  onClick={() => copy(appUrl)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-brand-300"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Test the public link
              </a>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setLink(null);
                  setOption("never");
                }}
                className="btn-ghost"
              >
                New link
              </button>
              <div className="flex items-center gap-2">
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                >
                  <ExternalLink className="h-4 w-4" /> Open page
                </a>
                <button onClick={onClose} className="btn-primary">
                  Done
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Link expiration
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {EXPIRY_OPTIONS.map((opt) => {
                  const active = option === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setOption(opt.value)}
                      className={`flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition ${
                        active
                          ? "border-brand-500/60 bg-brand-500/10"
                          : "border-white/10 bg-ink-900/50 hover:border-white/25"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          active ? "text-brand-300" : "text-slate-200"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-xs text-slate-500">
                {EXPIRY_OPTIONS.find((o) => o.value === option)?.hint}
              </p>
              {option === "custom" && (
                <label className="mt-3 block">
                  <span className="sr-only">Custom expiration</span>
                  <input
                    type="datetime-local"
                    value={custom}
                    min={new Date(Date.now() + 60e3).toISOString().slice(0, 16)}
                    onChange={(event) => setCustom(event.target.value)}
                    className="input"
                  />
                </label>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Only people with the link can see it.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn-primary"
              >
                {creating ? (
                  <>
                    <SpinnerInline /> Creating…
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" /> Create link
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function SpinnerInline() {
  return (
    <svg className="h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z" />
    </svg>
  );
}