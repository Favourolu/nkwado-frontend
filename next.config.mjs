/** @type {import('next').NextConfig} */

// Baseline security response headers applied to every route. A strict Content-Security-Policy
// is intentionally left off for now — the app renders react-three-fiber/WebGL scenes and
// relies on inline styles, so a tight CSP needs its own dedicated pass to avoid breaking the
// UI. These headers close the cheap, high-value gaps in the meantime: clickjacking, MIME
// sniffing, referrer leakage to third parties, and HTTPS downgrade.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
