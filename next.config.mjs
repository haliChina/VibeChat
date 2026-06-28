// Security/CSP/Cache headers are set here (Vercel/Node/Edge all read these).
// CSP is intentionally permissive enough for the inline `<style>` and font
// preloads Next injects; tighten if you don't need external API calls
// from the browser.
const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // Sensible defaults — adjust to your deployment domain.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js dev needs eval; lock down in prod.
      isProd ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Allow the user-configured OpenAI-compatible base URLs. The default
      // api.openai.com is whitelisted; users can extend via Settings UI.
      "connect-src 'self' http://127.0.0.1:* http://localhost:* https://api.openai.com https://*.openai.com https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // Static page → prerender at build time to serve as a static asset.
  // This is the single biggest lever for cutting request cost under load.
  output: "standalone",
  experimental: {
    // Keep the bundle lean: tree-shake unused geist variants.
    optimizePackageImports: ["geist"],
  },
  async headers() {
    return [
      {
        // Long-cache hashed assets emitted by Next.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Other static files in /public.
        source: "/:path(icon|robots\\.txt|sitemap\\.xml|favicon\\.ico|manifest\\.webmanifest)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // The HTML document: short cache so updates ship fast,
        // but still let the CDN absorb repeat hits.
        source: "/((?!api|_next).*)",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: isProd
              ? "public, max-age=0, must-revalidate, s-maxage=300, stale-while-revalidate=86400"
              : "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
