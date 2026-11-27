import { InquiryForm } from "@/components/site/InquiryForm";
import { t, type Lang } from "@/lib/i18n";

export function TradePage({ lang }: { lang: Lang }) {
  const d = t(lang).trade;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{d.title}</h1>
          <p>{d.subtitle}</p>
        </div>
      </section>
      <div className="page">
        <div className="container contact-grid">
          <section className="panel">
            <span className="eyebrow">{d.eyebrow}</span>
            <h2>{d.stepsTitle}</h2>
            <ol className="steps">
              {d.steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </li>
              ))}
            </ol>
            <p className="alert alert-info" style={{ marginTop: 24, marginBottom: 0 }}>
              {d.alert}
            </p>
          </section>
          <section className="panel">
            <h2>{d.formTitle}</h2>
            <InquiryForm defaultType="takas" types={["takas", "arac-satis", "bilgi"]} messagePlaceholder={d.placeholder} lang={lang} />
          </section>
        </div>
      </div>
    </>
  );
}
