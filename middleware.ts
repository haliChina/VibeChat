import { NextResponse, type NextRequest } from "next/server";

// UA fragments for clearly abusive crawlers / scanners / scrapers.
// We block them at the edge so they never reach your origin or CDN.
const BLOCKED_UA_PATTERNS: RegExp[] = [
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /blexbot/i,
  /petalbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /sogou/i,
  /python-requests/i,
  /go-http-client/i,
  /curl\//i,
  /wget\//i,
  /scrapy/i,
  /httpclient/i,
  /libwww-perl/i,
  /masscan/i,
  /zgrab/i,
  /nuclei/i,
  /nikto/i,
  /sqlmap/i,
  /gobuster/i,
  /dirbuster/i,
  /semantic-visions/i,
];

const SECURITY_HEADER_NAMES = [
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

function isBlocked(ua: string | null): boolean {
  if (!ua) return false;
  return BLOCKED_UA_PATTERNS.some((re) => re.test(ua));
}

export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent");

  // 1) Drop abusive UAs at the edge with a 403.
  if (isBlocked(ua)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 2) Forward to the route handler.
  const response = NextResponse.next();

  // 3) Defence-in-depth security headers in case the platform doesn't
  //    apply next.config headers (e.g. some proxies in front of Next).
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  // Strip any forwarded server identification.
  response.headers.delete("X-Powered-By");
  void SECURITY_HEADER_NAMES; // keep reference stable for future per-route tweaks

  return response;
}

// Skip middleware on Next internals and static assets — these are
// already long-cached and never hit origin in steady state.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml).*)",
  ],
};
