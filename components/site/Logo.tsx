"use client";
/* eslint-disable @next/next/no-img-element -- küçük, sabit logo dosyası */
import Link from "next/link";

/** Logo her zaman ana sayfaya götürür; zaten ana sayfadaysanız sayfanın başına kaydırır. */
export function Logo({ variant = "color", className = "logo" }: { variant?: "color" | "white"; className?: string }) {
  return (
    <Link
      href="/"
      className={className}
      aria-label="Ekin Otomotiv ana sayfa"
      onClick={(e) => {
        if (window.location.pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      <img
        src={variant === "white" ? "/marka/logo-beyaz.png" : "/marka/logo.png"}
        alt="Ekin Otomotiv"
        width={726}
        height={444}
      />
    </Link>
  );
}
