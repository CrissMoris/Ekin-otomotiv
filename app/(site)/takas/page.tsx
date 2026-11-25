import type { Metadata } from "next";
import { InquiryForm } from "@/components/site/InquiryForm";

export const metadata: Metadata = {
  title: "Takas ve Araç Alımı",
  description: "Hasarlı veya hasarsız aracınızı değerlendiriyor; takas ya da doğrudan alım teklifi sunuyoruz.",
};

export default function TradeInPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Takas İşlemleri</h1>
          <p>Hasarlı veya hasarsız aracınızı değerlendiriyor; takas ya da doğrudan alım teklifi sunuyoruz.</p>
        </div>
      </section>
      <div className="page">
        <div className="container contact-grid">
          <section className="panel">
            <span className="eyebrow">Süreç</span>
            <h2>Nasıl ilerliyoruz?</h2>
            <ol className="steps">
              <li>
                <h3>Bilgileri iletin</h3>
                <p className="muted">Aracınızın marka, model, yıl, kilometre ve varsa hasar bilgisini yazın.</p>
              </li>
              <li>
                <h3>Ön değerlendirme</h3>
                <p className="muted">Ekibimiz bilgileri inceler ve kısa sürede ön teklif için sizi arar.</p>
              </li>
              <li>
                <h3>Ekspertiz ve kesin teklif</h3>
                <p className="muted">Aracınızı gördükten sonra kesin teklifimizi sunarız.</p>
              </li>
              <li>
                <h3>Esnek anlaşma</h3>
                <p className="muted">Ödeme ve takas koşullarını birlikte belirler, işlemi hızla tamamlarız.</p>
              </li>
            </ol>
            <p className="alert alert-info" style={{ marginTop: 24, marginBottom: 0 }}>
              Kaza geçirmiş, hasar kayıtlı veya ağır hasarlı araçlar için de teklif veriyoruz. Kendi fiyat
              beklentinizi de iletebilirsiniz.
            </p>
          </section>
          <section className="panel">
            <h2>Teklif talebi</h2>
            <InquiryForm
              defaultType="takas"
              types={["takas", "arac-satis", "bilgi"]}
              messagePlaceholder="Aracınızın marka, model, yıl ve kilometresi; hasar durumu; fiyat beklentiniz; takas için ilgilendiğiniz aracın ilan numarası…"
            />
          </section>
        </div>
      </div>
    </>
  );
}
