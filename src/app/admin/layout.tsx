import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · WCN Admin" },
  robots: { index: false, follow: false },
};

// Admin pages read the session cookie, so they render per request inside this boundary.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={<div className="grid min-h-screen place-items-center bg-cream text-muted">Loading…</div>}
    >
      {children}
    </Suspense>
  );
}
