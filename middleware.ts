import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

// Role permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard": ["HOSPITAL", "SUPER_ADMIN", "ADMIN"],
  "/claims": ["HOSPITAL", "SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/settlements": ["HOSPITAL", "SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/manager-chat": ["SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/patients": ["HOSPITAL", "HOSPITAL_MANAGER", "Admin", "SUPER_ADMIN"],
  "/newClaim": ["HOSPITAL"],
  "/": ["HOSPITAL", "SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/user": ["ADMIN", "SUPER_ADMIN"],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const path = request.nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isAuthRoute = path === "/login";

  // Redirect to login if not logged in and accessing protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in but tries to go to login, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role-based access check
  if (token && role && ROLE_PERMISSIONS[path]) {
    if (!ROLE_PERMISSIONS[path].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/claims",
    "/newClaim",
    "/patients",
    "/queries",
    "/settlements",
    "/enhancements",
    "/manager-chat",
  ],
};
