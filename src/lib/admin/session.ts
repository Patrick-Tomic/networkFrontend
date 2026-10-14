// Admin session: the API token lives in an httpOnly cookie, and every admin
// request goes to the backend with it. The backend checks admin rights itself.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUser } from "./types";

export const COOKIE = "wcn_admin";
const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

type Init = { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown };

/** Calls the backend as the signed-in admin. Sends you to the login page if the session is gone. */
export async function adminFetch<T>(path: string, init: Init = {}): Promise<T> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) redirect("/admin/login");
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (res.status === 401) redirect("/admin/login?expired=1");
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.error?.message ?? `API error ${res.status}`, json?.error?.details);
  return json as T;
}

/** Uploads an image file as the signed-in admin. Returns its site path, e.g. /uploads/abc.webp. */
export async function adminUpload(file: File): Promise<{ url: string } | { error: string }> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) redirect("/admin/login");
  const body = new FormData();
  body.append("file", file, file.name || "image");
  const res = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
    cache: "no-store",
  });
  if (res.status === 401) redirect("/admin/login?expired=1");
  const json = await res.json().catch(() => null);
  if (!res.ok) return { error: json?.error?.message ?? "Upload failed" };
  return { url: json.data.url as string };
}

/** The signed-in admin, or a redirect to the login page. */
export async function getAdmin(): Promise<AdminUser> {
  const { user } = await adminFetch<{ user: AdminUser }>("/auth/me");
  if (user.role !== "admin") redirect("/admin/login?denied=1");
  return user;
}

/** Logs in against the backend. Returns the token, or an error message. */
export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return { error: (json?.error?.message as string) ?? "Could not sign in" };
  if (json.user.role !== "admin") return { error: "This account doesn't have admin access." };
  return { token: json.token as string };
}
