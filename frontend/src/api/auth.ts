import { request, ApiError } from "./client";
import type { LoginResponse, RegisterResponse } from "../types";

export function register(username: string, password: string) {
  return request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function login(username: string, password: string) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request<void>("/api/auth/logout", { method: "POST" });
}

/** Verifies the HttpOnly session cookie by hitting a protected route. */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await request<unknown>("/api/files?limit=1");
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return false;
    throw err;
  }
}