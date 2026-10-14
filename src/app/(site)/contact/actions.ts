"use server";

import { headers } from "next/headers";

export type ContactState = { error?: string; sent?: boolean };

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

export async function sendMessage(_prev: ContactState, fd: FormData): Promise<ContactState> {
  const field = (k: string) => String(fd.get(k) ?? "").trim();
  // Bots fill in every field, including this hidden one; quietly accept and drop it.
  if (field("company")) return { sent: true };
  // Pass the visitor's IP along so the API's rate limit applies per visitor, not to this server.
  const ip = (await headers()).get("x-forwarded-for");
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(ip && { "X-Forwarded-For": ip }) },
    body: JSON.stringify({
      name: field("name"),
      email: field("email"),
      phone: field("phone") || null,
      subject: field("subject") || null,
      body: field("body"),
    }),
    cache: "no-store",
  }).catch(() => null);
  if (!res) return { error: "We couldn't send that right now. Please email us instead." };
  if (res.status === 429) return { error: "Too many messages from your connection. Please try again later." };
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const details = json?.error?.details as { path: string }[] | undefined;
    if (details?.some((d) => d.path === "email")) return { error: "Please check your email address." };
    return { error: "Please fill in your name, email and a message." };
  }
  return { sent: true };
}
