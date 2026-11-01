export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function parseError(status: number, body: unknown): ApiError {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object"
  ) {
    const e = (body as { error: { code?: string; message?: string } }).error;
    return new ApiError(status, e.code ?? "UNKNOWN", e.message ?? "Request failed");
  }
  return new ApiError(status, "UNKNOWN", "Request failed");
}

export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw parseError(response.status, payload);
  }

  return payload as T;
}

/** The path of a create-share response, e.g. `/api/share/<token>`. */
export function extractShareToken(url: string): string {
  return url.replace(/^\/api\/share\//, "");
}

/** Absolute URL for a public share link, pointing at this app's share page. */
export function buildShareAppUrl(url: string): string {
  const token = extractShareToken(url);
  const origin = window.location.origin;
  return `${origin}/api/share/${token}`;
}

/** Absolute API endpoint the browser can hit directly (downloads as attachment). */
export function buildShareDownloadUrl(url: string): string {
  return url.startsWith("http") ? url : `${window.location.origin}${url}`;
}