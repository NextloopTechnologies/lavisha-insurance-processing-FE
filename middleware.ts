// app/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isPublicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname);
  const isAuthRoute = request.nextUrl.pathname === "/login";

  // If no token and trying to access protected page → redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists and trying to access login → redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/claims",
    "/patients",
    "/queries",
    "/settlements",
    "/enhancements",
  ],
};
