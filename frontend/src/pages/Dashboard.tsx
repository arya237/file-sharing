import { useCallback, useEffect, useRef, useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Search, FolderOpen, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { AmbientBackground } from "../components/AmbientBackground";
import { UploadDropzone } from "../components/UploadDropzone";
import { FileCard } from "../components/FileCard";
import { ShareModal } from "../components/ShareModal";
import { ConfirmDelete } from "../components/ConfirmDelete";
import { useToast } from "../components/Toast";
import { useDebouncedValue } from "../hooks/useClipboard";
import { listFiles, deleteFile, downloadUrl, PAGE_SIZE } from "../api/files";
import { formatBytes } from "../lib/format";
import type { FileRecord } from "../types";

export default function Dashboard() {
  const { userID, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const [shareFile, setShareFile] = useState<FileRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(async (reset: boolean) => {
    if (reset) {
      setLoading(true);
      offsetRef.current = 0;
    } else {
      setLoadingMore(true);
    }
    try {
      const page = await listFiles(offsetRef.current, PAGE_SIZE);
      setFiles((prev) => (reset ? page.Files : [...prev, ...page.Files]));
      setHasMore(page.Files.length >= PAGE_SIZE);
      offsetRef.current += page.Files.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load files";
      toast.push("error", "Could not load files", msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && userID) fetchPage(true);
  }, [authLoading, userID, fetchPage]);

  if (!authLoading && !userID)
    return <Navigate to="/login" replace />;

  const filtered = files.filter((f) =>
    f.Name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const totalSize = files.reduce((sum, f) => sum + f.Size, 0);

  const handleDownload = (file: FileRecord) => {
    const a = document.createElement("a");
    a.href = downloadUrl(file.ID);
    a.setAttribute("download", file.Name);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => a.remove(), 100);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFile(deleteTarget.ID);
      setFiles((prev) => prev.filter((f) => f.ID !== deleteTarget.ID));
      setDeleteTarget(null);
      toast.push("success", "File deleted", deleteTarget.Name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.push("error", "Delete failed", msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 sm:px-6">
        {/* ── Stats bar ────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-end gap-6 border-b border-white/[0.06] pb-6">
          <div>
            <p className="text-3xl font-black tracking-tight text-white">
              {files.length}
            </p>
            <p className="text-sm text-slate-400">files uploaded</p>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="text-xl font-bold text-white">{formatBytes(totalSize)}</p>
            <p className="text-sm text-slate-400">total size (loaded)</p>
          </div>
        </div>

        {/* ── Upload ───────────────────────────────────────── */}
        <section className="mb-10">
          <UploadDropzone
            onUploaded={(record) => {
              setFiles((prev) => [record, ...prev]);
              offsetRef.current += 1;
            }}
          />
        </section>

        {/* ── Search ───────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="input !pl-10"
            />
          </div>
        </div>

        {/* ── Loading skeleton ─────────────────────────────── */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass h-44 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────── */}
        {!loading && files.length === 0 && (
          <div className="glass flex flex-col items-center justify-center rounded-3xl py-24 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/[0.04]">
              <FolderOpen className="h-10 w-10 text-slate-600" />
            </span>
            <h3 className="mt-6 text-lg font-bold text-white">
              No files yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Drag a file onto the dropzone above, or{" "}
              <button
                onClick={() => document.querySelector<HTMLInputElement>("[aria-label='Upload files']")?.click()}
                className="font-semibold text-brand-300 underline-offset-4 hover:underline"
              >
                browse your device
              </button>
              .
            </p>
          </div>
        )}

        {/* ── No search results ────────────────────────────── */}
        {!loading && files.length > 0 && filtered.length === 0 && (
          <div className="glass flex flex-col items-center justify-center rounded-3xl py-20 text-center">
            <Search className="h-10 w-10 text-slate-600" />
            <h3 className="mt-5 text-base font-bold text-white">
              No results for "{search}"
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Try a different search term
            </p>
          </div>
        )}

        {/* ── Files grid ───────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((file) => (
              <FileCard
                key={file.ID}
                file={file}
                onDownload={handleDownload}
                onShare={(f) => setShareFile(f)}
                onDelete={(f) => setDeleteTarget(f)}
              />
            ))}
          </div>
        )}

        {/* ── Load more ────────────────────────────────────── */}
        {hasMore && !loading && filtered.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => fetchPage(false)}
              disabled={loadingMore}
              className="btn-ghost !px-8"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin-slow" /> Loading…
                </>
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </main>

      <ShareModal file={shareFile} onClose={() => setShareFile(null)} />
      <ConfirmDelete
        open={!!deleteTarget}
        name={deleteTarget?.Name}
        size={deleteTarget?.Size}
        mimeType={deleteTarget?.MIMEType}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}