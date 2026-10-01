import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

// Role permissions, matched by path prefix ("/claims" also covers "/claims/[id]").
// This only gates the UI; the API enforces the real authorization.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard": ["HOSPITAL", "SUPER_ADMIN", "ADMIN"],
  "/claims": ["HOSPITAL", "SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/settlements": ["HOSPITAL", "SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/manager-chat": ["SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/patients": ["HOSPITAL", "HOSPITAL_MANAGER", "ADMIN", "SUPER_ADMIN"],
  "/newClaim": ["HOSPITAL","ADMIN"],
  "/": ["HOSPITAL", "SUPER_ADMIN", "ADMIN", "HOSPITAL_MANAGER"],
  "/user": ["ADMIN", "SUPER_ADMIN"],
};

type TokenPayload = { role?: string; exp?: number };

// Reads the role and expiry from the API-issued JWT instead of the editable
// user_role cookie. The signature can't be checked here (the secret stays on
// the API), so a forged token only unlocks UI that the API will then reject.
function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")));
  } catch {
    return null;
  }
}

function allowedRolesFor(path: string): string[] | undefined {
  if (path === "/") return ROLE_PERMISSIONS["/"];
  const prefix = Object.keys(ROLE_PERMISSIONS)
    .filter((route) => route !== "/" && (path === route || path.startsWith(`${route}/`)))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? ROLE_PERMISSIONS[prefix] : undefined;
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("access_token");
  response.cookies.delete("user_role");
  return response;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isAuthRoute = path === "/login";

  const payload = token ? decodeToken(token) : null;
  const isTokenValid =
    !!payload?.role && (!payload.exp || payload.exp * 1000 > Date.now());

  // Redirect to login if not logged in (or token unreadable/expired) on a protected route
  if (!isTokenValid && !isPublicRoute) {
    return redirectToLogin(request);
  }

  // If logged in but tries to go to login, redirect to dashboard
  if (isTokenValid && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role-based access check
  const allowedRoles = allowedRolesFor(path);
  if (isTokenValid && allowedRoles && !allowedRoles.includes(payload!.role!)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // every page route; skips Next internals, the service worker and static files
  matcher: [
    "/((?!_next/|api/|sw\\.js|workbox-.*\\.js|manifest\\.json|site\\.webmanifest|assets/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$).*)",
  ],
};
