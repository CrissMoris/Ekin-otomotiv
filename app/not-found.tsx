import Link from "next/link";
import { Logo } from "@/components/site/Logo";

export default function NotFound() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Logo />
        </div>
      </header>
      <main className="page">
        <div className="container" style={{ maxWidth: 640, textAlign: "center", padding: "48px 20px" }}>
          <span className="eyebrow">404</span>
          <h1>Sayfa bulunamadı</h1>
          <p className="muted">Aradığınız sayfa veya ilan bulunamadı. Araç satılmış ya da yayından kaldırılmış olabilir.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/araclar" className="btn btn-red">Araçlarımıza göz atın</Link>
            <Link href="/" className="btn btn-outline">Ana sayfa</Link>
          </div>
        </div>
      </main>
    </>
  );
}
