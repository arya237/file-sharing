import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DownloadCloud,
  AlertCircle,
  FileText,
  Shield,
  Loader2,
} from "lucide-react";
import { AmbientBackground } from "../components/AmbientBackground";
import { Logo } from "../components/Logo";
import { formatBytes } from "../lib/format";

interface ShareState {
  status: "loading" | "found" | "error" | "network";
  filename?: string;
  size?: number | null;
  errorMessage?: string;
}

export default function ShareDownload() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<ShareState>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ status: "error", errorMessage: "Invalid share link" });
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/share/${token}`, {
          method: "HEAD",
          signal: controller.signal,
        });

        if (!res.ok) {
          setState({
            status: "error",
            errorMessage:
              res.status === 404
                ? "This share link has expired, been revoked, or does not exist."
                : "Something went wrong while accessing this link.",
          });
          return;
        }

        const disposition = res.headers.get("content-disposition") ?? "";
        const match = /filename="?([^";\n]+)"?/i.exec(disposition);
        const filename = match?.[1] ?? "Unknown file";
        const sizeHeader = res.headers.get("content-length");
        const size = sizeHeader ? parseInt(sizeHeader, 10) : null;

        setState({ status: "found", filename, size });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          status: "network",
          errorMessage:
            "Could not reach the server. Please check your connection and try again.",
        });
      }
    })();

    return () => controller.abort();
  }, [token]);

  const downloadUrl = token ? `/api/share/${token}` : "#";

  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />

      <header className="relative z-10 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Logo />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex flex-1 w-full max-w-lg items-center justify-center px-4 py-20">
        <div className="animate-fade-up w-full text-center">
          {state.status === "loading" && (
            <div className="flex flex-col items-center gap-5">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/[0.06]">
                <Loader2 className="h-8 w-8 animate-spin-slow text-brand-400" />
              </div>
              <p className="text-sm text-slate-400">
                Locating your file…
              </p>
            </div>
          )}

          {state.status === "error" && (
            <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-10 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-rose-500/10">
                <AlertCircle className="h-9 w-9 text-rose-400" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Share not found
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                  {state.errorMessage}
                </p>
              </div>
              <Link to="/" className="btn-ghost">
                Go to Nimbus
              </Link>
            </div>
          )}

          {state.status === "network" && (
            <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-10 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/10">
                <AlertCircle className="h-9 w-9 text-amber-400" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Connection error
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                  {state.errorMessage}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try again
              </button>
            </div>
          )}

          {state.status === "found" && (
            <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-10">
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-500/20 to-cyan-500/10">
                <FileText className="h-9 w-9 text-brand-300" />
              </span>

              <div>
                <h1 className="text-xl font-bold text-white">
                  Ready to download
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Someone shared a file with you via Nimbus
                </p>
              </div>

              <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left">
                <p
                  className="truncate text-sm font-semibold text-white"
                  title={state.filename}
                >
                  {state.filename}
                </p>
                {state.size !== null && state.size !== undefined && (
                  <p className="mt-1 text-xs text-slate-400">
                    {formatBytes(state.size)}
                  </p>
                )}
              </div>

              <a
                href={downloadUrl}
                className="btn-primary w-full !py-4 text-base"
              >
                <DownloadCloud className="h-5 w-5" /> Download file
              </a>

              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5" /> Only accessible via this link
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-ink-950">
        <div className="mx-auto flex items-center justify-between px-4 py-6 sm:px-6">
          <p className="text-xs text-slate-600">
            Powered by Nimbus
          </p>
          <Link
            to="/"
            className="text-xs font-medium text-slate-500 transition hover:text-white"
          >
            Nimbus
          </Link>
        </div>
      </footer>
    </div>
  );
}