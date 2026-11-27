import type { Metadata } from "next";
import { LANG_INFO, lp, type Lang } from "./i18n";

const OG_IMAGE = { url: "/marka/og.png", width: 1200, height: 630, alt: "Ekin Otomotiv" };

/** Sayfa başlığı/açıklaması + dil alternatifleri (hreflang) + paylaşım bilgileri. */
export function pageMeta(
  lang: Lang,
  path: string,
  meta: { title: string; absolute?: boolean; description: string; image?: string },
): Metadata {
  return {
    title: meta.absolute ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: {
      canonical: lp(lang, path),
      languages: { tr: lp("tr", path), en: lp("en", path), ar: lp("ar", path), "x-default": lp("tr", path) },
    },
    openGraph: {
      type: "website",
      siteName: "Ekin Otomotiv",
      locale: LANG_INFO[lang].locale,
      url: lp(lang, path),
      title: meta.title,
      description: meta.description,
      images: meta.image ? [{ url: meta.image }] : [OG_IMAGE],
    },
  };
}
