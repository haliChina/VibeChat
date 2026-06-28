import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibe-chat.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block obvious probe paths; the app has no /api routes.
        disallow: ["/api/", "/_next/", "/admin/"],
      },
      // Common abusive bots — keep them out so they can't burn your quota.
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "BLEXBot"],
        disallow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
