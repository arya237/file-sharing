import { request } from "./client";
import type { CreateShareResponse } from "../types";

export function createShare(
  fileId: string,
  expiresAt: string | null
): Promise<CreateShareResponse> {
  return request<CreateShareResponse>(`/api/share/${fileId}`, {
    method: "POST",
    body: JSON.stringify({ expires_at: expiresAt }),
  });
}

export function apiShareUrl(token: string): string {
  return `/api/share/${token}`;
}