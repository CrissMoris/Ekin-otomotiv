import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { LANGS, lp } from "@/lib/i18n";
import { getPublishedVehicles } from "@/lib/store";

/** Arama motorları için site haritası: sabit sayfalar + yayındaki tüm araçlar (Türkçe, İngilizce ve Arapça). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const languages = (path: string) => Object.fromEntries(LANGS.map((l) => [l, `${base}${lp(l, path)}`]));
  const both = (path: string) => LANGS.map((l) => ({ url: `${base}${lp(l, path)}`, alternates: { languages: languages(path) } }));
  const pages = ["/", "/araclar", "/takas", "/iletisim", "/kvkk"].flatMap(both);
  try {
    const vehicles = await getPublishedVehicles();
    return [...pages, ...vehicles.flatMap((v) => both(`/araclar/${v.id}`))];
  } catch {
    return pages; // veri kaynağına ulaşılamazsa yalnızca sabit sayfalar
  }
}
