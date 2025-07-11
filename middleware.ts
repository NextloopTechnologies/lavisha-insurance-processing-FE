// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  const isAuth = Boolean(token);
  const isLogin = request.nextUrl.pathname === "/login";

  if (!isAuth && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && isLogin) {
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
