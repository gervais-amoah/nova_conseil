import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = !!session && session.trim() !== "";

  // Logged-in users hitting /login → send them to the admin home
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/", request.url));
    }
    return NextResponse.next();
  }

  // Everything else under /admin/* requires auth
  if (!isAuthenticated) {
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
  matcher: ["/admin/:path*", "/login"],
};
