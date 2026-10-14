// Sends signed-out visitors on /admin to the login page. This is only a quick
// check for the cookie; the backend verifies the token on every admin request.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login" || request.cookies.has("wcn_admin")) return NextResponse.next();
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
