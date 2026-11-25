import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarIcon, CheckIcon, ExternalIcon, FuelIcon, GaugeIcon, GearIcon, PhoneIcon } from "@/components/Icons";
import { InquiryPanel } from "@/components/site/InquiryPanel";
import { VehicleGallery } from "@/components/site/VehicleGallery";
import { CONTACT, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import { formatKm, formatPrice } from "@/lib/format";
import { getPublishedVehicle } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getPublishedVehicle((await params).id);
  if (!v) return { title: "Araç bulunamadı" };
  return {
    title: `${v.year} ${v.make} ${v.model}`,
    openGraph: v.photos[0] ? { images: [{ url: v.photos[0].url }] } : undefined,
    description: `${v.year} model ${v.make} ${v.model}, ${formatKm(v.mileage)}, ${FUEL_LABELS[v.fuel]}, ${TRANSMISSION_LABELS[v.transmission]} — ${formatPrice(v.price)}`,
  };
}

async function VehicleDetail({ params }: Props) {
  const v = await getPublishedVehicle((await params).id);
  if (!v) notFound();
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
    fuelType: FUEL_LABELS[v.fuel],
    vehicleTransmission: TRANSMISSION_LABELS[v.transmission],
    image: v.photos.map((p) => p.url),
    description: v.description || undefined,
    offers: { "@type": "Offer", price: v.price, priceCurrency: "TRY", availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="detail-crumbs">
        <div className="container">
          <nav className="breadcrumb" aria-label="Sayfa yolu">
            <Link href="/">Ana Sayfa</Link>
            <span aria-hidden="true">/</span>
            <Link href="/araclar">Araçlarımız</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
        </div>
      </div>
      <div className="page page-detail">
        <div className="container">
          <div className="detail-layout">
            <div className="detail-gallery">
              <VehicleGallery photos={v.photos} title={title} />
            </div>

            {v.description && (
              <div className="detail-info">
                <section className="panel">
                  <h2>Açıklama</h2>
                  <p className="description">{v.description}</p>
                </section>
              </div>
            )}

            <aside className="detail-aside">
              <div className="panel">
                <span className="listing-code">İLAN NO: {v.id}</span>
                <h1 className="detail-title">{title}</h1>
                <div className="detail-price">{formatPrice(v.price)}</div>
                <dl className="key-specs">
                  <div><CalendarIcon /><span><dt>Yıl</dt><dd>{v.year}</dd></span></div>
                  <div><GaugeIcon /><span><dt>Kilometre</dt><dd>{formatKm(v.mileage)}</dd></span></div>
                  <div><FuelIcon /><span><dt>Yakıt</dt><dd>{FUEL_LABELS[v.fuel]}</dd></span></div>
                  <div><GearIcon /><span><dt>Vites</dt><dd>{TRANSMISSION_LABELS[v.transmission]}</dd></span></div>
                </dl>
                <div className="stack">
                  <InquiryPanel vehicleId={v.id} vehicleLabel={`${title} (${v.year})`} />
                  <a className="btn btn-dark btn-block" href={CONTACT.phoneHref}>
                    <PhoneIcon /> Hemen Arayın
                  </a>
                  {v.sahibindenUrl && (
                    <a className="btn btn-outline btn-block" href={v.sahibindenUrl} target="_blank" rel="noopener noreferrer">
                      sahibinden.com&apos;da görüntüle <ExternalIcon />
                    </a>
                  )}
                </div>
                <ul className="perks">
                  <li><CheckIcon /> Kendi teklifinizle gelebilirsiniz</li>
                  <li><CheckIcon /> Esnek anlaşma ve takas imkânı</li>
                  <li><CheckIcon /> Talebinize hızlı dönüş</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VehicleDetailPage({ params }: Props) {
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
      <VehicleDetail params={params} />
    </Suspense>
  );
}
