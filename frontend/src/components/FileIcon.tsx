import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileType,
  FileArchive,
  File,
} from "lucide-react";
import type { Kind } from "../lib/format";

const KIND_STYLES: Record<Kind, { icon: LucideIcon; className: string }> = {
  image: { icon: FileImage, className: "text-fuchsia-400 bg-fuchsia-400/10" },
  video: { icon: FileVideo, className: "text-violet-400 bg-violet-400/10" },
  audio: { icon: FileAudio, className: "text-amber-400 bg-amber-400/10" },
  pdf: { icon: FileText, className: "text-rose-400 bg-rose-400/10" },
  doc: { icon: FileText, className: "text-sky-400 bg-sky-400/10" },
  sheet: {
    icon: FileSpreadsheet,
    className: "text-emerald-400 bg-emerald-400/10",
  },
  slides: { icon: FileType, className: "text-orange-400 bg-orange-400/10" },
  code: { icon: FileCode, className: "text-cyan-400 bg-cyan-400/10" },
  text: { icon: FileText, className: "text-slate-300 bg-slate-300/10" },
  archive: {
    icon: FileArchive,
    className: "text-yellow-400 bg-yellow-400/10",
  },
  default: { icon: File, className: "text-brand-400 bg-brand-400/10" },
};

export function FileIcon({
  kind,
  name,
  size = "h-10 w-10",
}: {
  kind: Kind;
  name: string;
  size?: string;
}) {
  const { icon: Icon, className } = KIND_STYLES[kind];
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-xl ${className}`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {kind === "default" && (
        <span className="sr-only">{name}</span>
      )}
    </span>
  );
}