import { Modal } from "./Modal";
import { FileIcon } from "./FileIcon";
import { formatBytes, mimeKind, type Kind } from "../lib/format";

interface ConfirmDeleteProps {
  open: boolean;
  name?: string;
  size?: number;
  mimeType?: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDelete({
  open,
  name,
  size,
  mimeType,
  loading,
  onCancel,
  onConfirm,
}: ConfirmDeleteProps) {
  const kind: Kind = mimeKind(mimeType ?? "", name ?? "");
  return (
    <Modal open={open} onClose={onCancel} title="Delete file" maxWidth="max-w-md">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <FileIcon kind={kind} name={name ?? ""} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {size !== undefined ? formatBytes(size) : ""}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              This permanently deletes the file and{" "}
              <span className="font-medium text-slate-200">
                revokes every share link
              </span>{" "}
              pointing to it. This can’t be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            Delete file
          </button>
        </div>
      </div>
    </Modal>
  );
}