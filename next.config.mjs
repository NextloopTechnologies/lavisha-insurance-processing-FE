import nextPwa from "next-pwa";
import defaultCache from "next-pwa/cache.js";

// The service worker must never store patient data: API responses (separate
// API host, or same-origin /api/) and S3 document URLs are network-only.
// Workbox uses the first matching route, so these go before the defaults.
const runtimeCaching = [
  {
    urlPattern: ({ url }) => self.origin !== url.origin,
    handler: "NetworkOnly",
  },
  {
    urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
    handler: "NetworkOnly",
  },
  ...defaultCache.filter(
    (entry) => !["apis", "cross-origin"].includes(entry.options?.cacheName)
  ),
];

/** @type {import('next').NextConfig} */
const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: false,
  runtimeCaching,
});

const isDev = process.env.NODE_ENV !== "production";

const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin;
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines bootstrap scripts; dev mode also needs eval for fast refresh
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // presigned S3 document/profile URLs and avatars are https images
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`.trim(),
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig = withPWA({
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {},

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
});


export default nextConfig;
