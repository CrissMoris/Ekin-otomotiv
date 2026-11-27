import { isRtl, type Lang } from "@/lib/i18n";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Herkese açık sayfaların ortak iskeleti. Arapçada yazı yönü sağdan sola olur. */
export function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <div className="site-root" lang={lang} dir={isRtl(lang) ? "rtl" : "ltr"}>
      <SiteHeader lang={lang} />
      <main>{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}
