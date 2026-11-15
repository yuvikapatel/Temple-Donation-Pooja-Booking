import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";

// Protects every /admin page. API routes re-check the session themselves.
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const authed = await verifyToken(req.cookies.get(COOKIE)?.value);
  const isLogin = pathname === "/admin/login";

  if (!authed && !isLogin) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (authed && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
