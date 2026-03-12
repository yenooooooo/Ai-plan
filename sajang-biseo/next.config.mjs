import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 클릭재킹 방지
          { key: "X-Frame-Options", value: "DENY" },
          // MIME 스니핑 방지
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS 필터
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // HTTPS 강제 (1년)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Referrer 정보 제한
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 권한 정책
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          // CSP — 필요한 출처만 허용
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.anthropic.com https://challenges.cloudflare.com",
              "frame-src https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
