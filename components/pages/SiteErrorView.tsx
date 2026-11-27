"use client";

import { CONTACT } from "@/lib/constants";
import { t, type Lang } from "@/lib/i18n";

/** Veri kaynağına (veritabanı) ulaşılamazsa gösterilir. */
export function SiteErrorView({ lang, reset }: { lang: Lang; reset: () => void }) {
  const d = t(lang).error;
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640, textAlign: "center", padding: "48px 20px" }}>
        <h1>{d.title}</h1>
        <p className="muted">
          {d.text} <a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phone}</a>
        </p>
        <button type="button" className="btn btn-red" onClick={reset}>{d.retry}</button>
      </div>
    </div>
  );
}
