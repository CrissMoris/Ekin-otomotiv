import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckIcon, ExternalIcon, PhoneIcon } from "@/components/Icons";
import { InquiryPanel } from "@/components/site/InquiryPanel";
import { InspectionDiagram } from "@/components/site/InspectionDiagram";
import { ShareMenu } from "@/components/site/ShareMenu";
import { VehicleGallery } from "@/components/site/VehicleGallery";
import { CONTACT } from "@/lib/constants";
import { formatKm, formatNumber, formatPrice, formatStamp } from "@/lib/format";
import { lp, pick, t, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { getPublishedVehicle } from "@/lib/store";
import type { Vehicle } from "@/lib/types";
import {
  BODY_PART_KEYS,
  BODY_PARTS,
  BODY_TYPE_LABELS,
  COLOR_LABELS,
  DRIVETRAIN_LABELS,
  FEATURE_GROUP_KEYS,
  FEATURE_GROUPS,
  HEAVY_DAMAGE_LABELS,
  PART_STATE_KEYS,
  PART_STATES,
  TRADE_LABELS,
  type PartState,
} from "@/lib/vehicle-specs";

export type DetailParams = Promise<{ id: string }>;

export async function vehicleMetadata(lang: Lang, params: DetailParams): Promise<Metadata> {
  const { id } = await params;
  const d = t(lang);
  const v = await getPublishedVehicle(id);
  if (!v) return { title: d.notFound.title };
  const summary = `${v.year} ${v.make} ${v.model}, ${formatKm(v.mileage, d.km)}, ${d.fuel[v.fuel]}, ${d.transmission[v.transmission]}`;
  return pageMeta(lang, `/araclar/${v.id}`, {
    title: `${v.year} ${v.make} ${v.model}`,
    description: d.detail.metaDescription(summary, formatPrice(v.price)),
    image: v.photos[0]?.url,
  });
}

/** Sağdaki ilan bilgileri listesi: yalnızca dolu alanlar gösterilir. */
function infoRows(v: Vehicle, lang: Lang): [string, React.ReactNode][] {
  const d = t(lang);
  const x = d.detail;
  const rows: [string, React.ReactNode | null][] = [
    [x.listingNo, <span key="id" dir="ltr">{v.id}</span>],
    [x.listingDate, v.createdAt ? <span key="date" dir="ltr">{formatStamp(v.createdAt).slice(0, 10)}</span> : null],
    [x.make, v.make],
    [x.model, <span key="model" dir="auto">{v.model}</span>],
    [x.year, v.year],
    [x.mileage, formatKm(v.mileage, d.km)],
    [x.fuel, d.fuel[v.fuel]],
    [x.transmission, d.transmission[v.transmission]],
    [x.bodyType, v.bodyType ? pick(BODY_TYPE_LABELS[v.bodyType], lang) : null],
    [x.color, v.color ? (lang === "tr" ? v.color : (COLOR_LABELS[v.color]?.[lang] ?? v.color)) : null],
    [x.engineCc, v.engineCc ? `${formatNumber(v.engineCc)} ${x.ccUnit}` : null],
    [x.enginePower, v.enginePower ? `${formatNumber(v.enginePower)} ${x.hpUnit}` : null],
    [x.drivetrain, v.drivetrain ? pick(DRIVETRAIN_LABELS[v.drivetrain], lang) : null],
    [x.trade, v.trade ? pick(TRADE_LABELS[v.trade], lang) : null],
    [x.heavyDamage, v.heavyDamage ? pick(HEAVY_DAMAGE_LABELS[v.heavyDamage], lang) : null],
    [x.tramer, v.tramer === null ? null : v.tramer === 0 ? x.tramerNone : <span key="tr" dir="ltr">{formatPrice(v.tramer)}</span>],
  ];
  return rows.filter((r): r is [string, React.ReactNode] => r[1] !== null && r[1] !== "");
}

function InspectionCard({ v, lang }: { v: Vehicle; lang: Lang }) {
  const x = t(lang).detail;
  const specified = BODY_PART_KEYS.filter((p) => v.inspection[p]);
  if (specified.length === 0) return null;
  const changed = PART_STATE_KEYS.filter((s) => s !== "orijinal")
    .map((s) => ({ state: s, parts: specified.filter((p) => v.inspection[p] === s) }))
    .filter((g) => g.parts.length > 0);
  return (
    <section className="panel inspection-card">
      <div className="card-head">
        <h2>{x.inspectionTitle}</h2>
        <p className="muted">{x.inspectionSubtitle}</p>
      </div>
      <div className="inspection-layout">
        <InspectionDiagram inspection={v.inspection} lang={lang} notSpecified={x.notSpecified} />
        <div className="inspection-summary">
          <ul className="inspection-legend">
            {PART_STATE_KEYS.map((s) => (
              <li key={s}>
                <Swatch state={s} lang={lang} /> {pick(PART_STATES[s], lang)}
              </li>
            ))}
          </ul>
          {changed.length === 0 ? (
            <p className="inspection-ok">
              <CheckIcon /> {x.allOriginal}
            </p>
          ) : (
            <dl className="inspection-groups">
              {changed.map((g) => (
                <div key={g.state}>
                  <dt>
                    <Swatch state={g.state} lang={lang} /> {pick(PART_STATES[g.state], lang)}
                  </dt>
                  <dd>{g.parts.map((p) => pick(BODY_PARTS[p], lang)).join(", ")}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <p className="hint inspection-note">{x.inspectionNote}</p>
    </section>
  );
}

/** Lejant kutusu: şemadaki renk ve kısaltma ile aynı. */
function Swatch({ state, lang }: { state: PartState; lang: Lang }) {
  const s = PART_STATES[state];
  return (
    <i className="swatch" style={{ background: s.color, color: s.ink }} aria-hidden="true">
      {s.abbr[lang]}
    </i>
  );
}

/** Tüm donanım listesi: araçta olanlar tikli, olmayanlar soluk gri gösterilir. */
function FeaturesCard({ v, lang }: { v: Vehicle; lang: Lang }) {
  if (v.features.length === 0) return null;
  const x = t(lang).detail;
  const groups = FEATURE_GROUP_KEYS.map((g) => ({
    key: g,
    label: pick(FEATURE_GROUPS[g], lang),
    items: Object.entries(FEATURE_GROUPS[g].items),
  }));
  return (
    <section className="panel features-card">
      <div className="card-head">
        <h2>{x.featuresTitle}</h2>
      </div>
      <div className="feature-groups">
        {groups.map((g) => (
          <div key={g.key} className="feature-list">
            <h3>{g.label}</h3>
            <ul>
              {g.items.map(([k, label]) =>
                v.features.includes(k) ? (
                  <li key={k}>
                    <CheckIcon /> {pick(label, lang)}
                  </li>
                ) : (
                  <li key={k} className="is-absent">
                    <span className="feature-gap" aria-hidden="true" />
                    {pick(label, lang)}
                    <span className="sr-only"> ({x.featureAbsent})</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

async function VehicleDetail({ params, lang }: { params: DetailParams; lang: Lang }) {
  const { id } = await params;
  const v = await getPublishedVehicle(id);
  if (!v) notFound();
  const d = t(lang);
  const x = d.detail;
  const title = `${v.make} ${v.model}`;
  // Arama motorları için yapılandırılmış veri (schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.year} ${title}`,
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
    fuelType: t("tr").fuel[v.fuel],
    vehicleTransmission: t("tr").transmission[v.transmission],
    color: v.color || undefined,
    bodyType: v.bodyType ? BODY_TYPE_LABELS[v.bodyType].tr : undefined,
    image: v.photos.map((p) => p.url),
    description: v.description || undefined,
    offers: { "@type": "Offer", price: v.price, priceCurrency: "TRY", availability: "https://schema.org/InStock" },
  };
  const hasInfo = Boolean(v.description) || BODY_PART_KEYS.some((p) => v.inspection[p]) || v.features.length > 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="detail-crumbs">
        <div className="container">
          <nav className="breadcrumb" aria-label={x.breadcrumbAria}>
            <Link href={lp(lang, "/")}>{d.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={lp(lang, "/araclar")}>{d.nav.vehicles}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page"><bdi>{title}</bdi></span>
          </nav>
        </div>
      </div>
      <div className="page page-detail">
        <div className="container">
          <div className="detail-layout">
            <div className="detail-gallery">
              <VehicleGallery photos={v.photos} title={title} lang={lang} />
            </div>

            {hasInfo && (
              <div className="detail-info">
                {v.description && (
                  <section className="panel">
                    <h2>{x.description}</h2>
                    <p className="description" dir="auto" lang="tr">{v.description}</p>
                    {x.descriptionNote && <p className="hint">{x.descriptionNote}</p>}
                  </section>
                )}
                <InspectionCard v={v} lang={lang} />
                <FeaturesCard v={v} lang={lang} />
              </div>
            )}

            <aside className="detail-aside">
              <div className="panel summary-card">
                <div className="summary-head">
                  <div>
                    <h1 className="detail-title"><bdi>{title}</bdi></h1>
                    <p className="summary-sub">
                      {v.year} · {formatKm(v.mileage, d.km)} · {d.fuel[v.fuel]} · {d.transmission[v.transmission]}
                    </p>
                  </div>
                  <ShareMenu title={`${v.year} ${title}`} lang={lang} />
                </div>
                <div className="summary-price">
                  <span>{x.price}</span>
                  <strong dir="ltr">{formatPrice(v.price)}</strong>
                </div>
                <div className="stack">
                  <InquiryPanel vehicleId={v.id} vehicleLabel={`${title} (${v.year})`} lang={lang} />
                  <a className="btn btn-dark btn-block" href={CONTACT.phoneHref}>
                    <PhoneIcon /> {x.call}
                  </a>
                  {v.sahibindenUrl && (
                    <a className="btn btn-outline btn-block" href={v.sahibindenUrl} target="_blank" rel="noopener noreferrer">
                      {x.viewOnSahibinden} <ExternalIcon />
                    </a>
                  )}
                </div>
                <div className="info-block">
                  <h2 className="info-title">{x.infoTitle}</h2>
                  <dl className="info-list">
                    {infoRows(v, lang).map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <ul className="perks">
                  {x.perks.map((p) => (
                    <li key={p}>
                      <CheckIcon /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export function VehicleDetailPage({ params, lang }: { params: DetailParams; lang: Lang }) {
  return (
    <Suspense
      fallback={
        <div className="page">
          <div className="container">
            <div className="skeleton" style={{ height: 480 }} />
          </div>
        </div>
      }
    >
      <VehicleDetail params={params} lang={lang} />
    </Suspense>
  );
}
