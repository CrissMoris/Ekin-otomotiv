import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { getPublishedVehicles } from "@/lib/store";

/** Arama motorları için site haritası: sabit sayfalar + yayındaki tüm araçlar. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/araclar", "/takas", "/iletisim", "/kvkk"].map((p) => ({ url: `${base}${p}` }));
  try {
    const vehicles = await getPublishedVehicles();
    return [...pages, ...vehicles.map((v) => ({ url: `${base}/araclar/${v.id}` }))];
  } catch {
    return pages; // veri kaynağına ulaşılamazsa yalnızca sabit sayfalar
  }
}
