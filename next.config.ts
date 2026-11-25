import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const onVercel = Boolean(process.env.VERCEL);

/**
 * İçerik Güvenlik Politikası: sayfa yalnızca kendi dosyalarını ve Cloudinary görsellerini yükleyebilir;
 * başka sitelerden komut dosyası çalıştırılamaz ve site başka bir sitenin içine gömülemez.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(onVercel ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(onVercel ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false, // sunucu teknolojisini başlıkta göstermez
  productionBrowserSourceMaps: false, // tarayıcıya okunabilir kaynak kod haritası gönderilmez
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Yönetim paneli ve API yanıtları tarayıcı/ara sunucu önbelleğinde tutulmaz.
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
