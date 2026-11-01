export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(username: string): string {
  return username
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const KNOWN_EXTENSIONS: Record<string, string> = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  xls: "sheet",
  xlsx: "sheet",
  ppt: "slides",
  pptx: "slides",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  js: "code",
  ts: "code",
  tsx: "code",
  jsx: "code",
  css: "code",
  html: "code",
  go: "code",
  py: "code",
  rs: "code",
  json: "code",
  yml: "code",
  yaml: "code",
  sh: "code",
  md: "text",
  txt: "text",
  log: "text",
  csv: "sheet",
  mp3: "audio",
  wav: "audio",
  flac: "audio",
  mp4: "video",
  webm: "video",
  mov: "video",
  gif: "image",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  svg: "image",
  avif: "image",
};

export type Kind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "doc"
  | "sheet"
  | "slides"
  | "code"
  | "text"
  | "archive"
  | "default";

export function mimeKind(mime: string, name: string): Kind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const byMime = mime.split("/")[0] ?? "";
  if (byMime === "image") return "image";
  if (byMime === "video") return "video";
  if (byMime === "audio") return "audio";
  if (KNOWN_EXTENSIONS[ext]) {
    const k = KNOWN_EXTENSIONS[ext];
    return k as Kind;
  }
  if (byMime.startsWith("text/")) return "text";
  if (mime.includes("json") || mime.includes("javascript")) return "code";
  return "default";
}