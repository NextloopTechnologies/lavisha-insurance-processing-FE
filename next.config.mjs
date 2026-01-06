import nextPwa from "next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  reactStrictMode: true,
  turbopack: {}

  // other options...
});


export default nextConfig;
