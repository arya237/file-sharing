import { Download, Share2, Trash2, Calendar } from "lucide-react";
import type { FileRecord } from "../types";
import { FileIcon } from "./FileIcon";
import { formatBytes, formatDate, mimeKind } from "../lib/format";

interface FileCardProps {
  file: FileRecord;
  onDownload: (file: FileRecord) => void;
  onShare: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
}

export function FileCard({ file, onDownload, onShare, onDelete }: FileCardProps) {
  const kind = mimeKind(file.MIMEType, file.Name);

  return (
    <div className="glass card-hover group relative rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <FileIcon kind={kind} name={file.Name} size="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-white"
            title={file.Name}
          >
            {file.Name}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span>{formatBytes(file.Size)}</span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(file.CreatedAt)}
            </span>
          </p>
        </div>
        <button
          onClick={() => onDelete(file)}
          className="rounded-lg p-1.5 text-slate-500 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
          aria-label="Delete file"
          title="Delete file"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
        <button
          onClick={() => onDownload(file)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/[0.12] hover:text-white"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={() => onShare(file)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-violet-500 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </div>
    </div>
  );
}