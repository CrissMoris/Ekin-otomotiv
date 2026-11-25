"use client";

import { CONTACT } from "@/lib/constants";

/** Veri kaynağına (Google Sheets) ulaşılamazsa gösterilir. */
export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640, textAlign: "center", padding: "48px 20px" }}>
        <h1>Araç bilgileri şu anda yüklenemiyor</h1>
        <p className="muted">
          Lütfen biraz sonra tekrar deneyin. Acil durumlarda bizi arayabilirsiniz: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
        </p>
        <button type="button" className="btn btn-red" onClick={reset}>Tekrar dene</button>
      </div>
    </div>
  );
}
