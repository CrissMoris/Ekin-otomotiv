"use client";
/* eslint-disable @next/next/no-img-element -- küçük, sabit logo dosyası */
import Link from "next/link";
import { lp, t, type Lang } from "@/lib/i18n";

/** Logo her zaman ana sayfaya götürür; zaten ana sayfadaysanız sayfanın başına kaydırır. */
export function Logo({
  variant = "color",
  className = "logo",
  lang = "tr",
}: {
  variant?: "color" | "white";
  className?: string;
  lang?: Lang;
}) {
  const home = lp(lang, "/");
  return (
    <Link
      href={home}
      className={className}
      aria-label={t(lang).header.logoAria}
      onClick={(e) => {
        if (window.location.pathname === home) {
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
