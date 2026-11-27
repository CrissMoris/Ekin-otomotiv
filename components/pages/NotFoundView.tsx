import Link from "next/link";
import { lp, t, type Lang } from "@/lib/i18n";

export function NotFoundView({ lang }: { lang: Lang }) {
  const d = t(lang).notFound;
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640, textAlign: "center", padding: "48px 20px" }}>
        <span className="eyebrow">404</span>
        <h1>{d.title}</h1>
        <p className="muted">{d.text}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={lp(lang, "/araclar")} className="btn btn-red">{d.browse}</Link>
          <Link href={lp(lang, "/")} className="btn btn-outline">{d.home}</Link>
        </div>
      </div>
    </div>
  );
}
