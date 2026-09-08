import { request } from "./client";
import type { FileRecord, ListFilesResponse } from "../types";

export const PAGE_SIZE = 20;

export function listFiles(offset: number, limit = PAGE_SIZE) {
  return request<ListFilesResponse>(`/api/files?offset=${offset}&limit=${limit}`);
}

export function deleteFile(id: string) {
  return request<void>(`/api/files/${id}`, { method: "DELETE" });
}

export function downloadUrl(id: string): string {
  return `/api/files/${id}/download`;
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

/**
 * Upload via XHR so we can surface real progress. Resolves with the created
 * file record. Rejects with an ApiError on failure.
 */
export function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileRecord> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files");

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({ loaded: event.loaded, total: event.total });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as FileRecord);
        } catch {
          reject(new Error("Unexpected response from server"));
        }
        return;
      }
      let message = "Upload failed";
      try {
        const body = JSON.parse(xhr.responseText) as {
          error?: { code?: string; message?: string };
        };
        message = body.error?.message ?? message;
      } catch {
        /* keep default */
      }
      reject(new Error(message));
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error — could not reach the server"))
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.send(form);
  });
}