import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public access to the admin login page to prevent redirect loops
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // 2. Check for the session cookie
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
