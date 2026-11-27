/* eslint-disable @next/next/no-img-element -- görseller Cloudinary'de zaten boyutlandırılıyor */
import Link from "next/link";
import { ArrowIcon, FuelIcon, GaugeIcon, GearIcon } from "@/components/Icons";
import { formatKm, formatPrice } from "@/lib/format";
import { lp, t, type Lang } from "@/lib/i18n";
import type { Vehicle } from "@/lib/types";
import { PreviewButton } from "./PhotoLightbox";

/** Kartın tamamı detay sayfasına gider; "Önizle" fotoğrafları sayfadan çıkmadan açar. */
export function VehicleCard({ vehicle, lang }: { vehicle: Vehicle; lang: Lang }) {
  const d = t(lang);
  const cover = vehicle.photos[0];
  const title = `${vehicle.make} ${vehicle.model}`;
  const href = lp(lang, `/araclar/${vehicle.id}`);
  return (
    <article className="vehicle-card">
      <div className="vehicle-card-media">
        {cover && <img src={cover.thumb} alt={title} loading="lazy" />}
        <span className="media-badge">{vehicle.year}</span>
        <PreviewButton photos={vehicle.photos} title={title} price={formatPrice(vehicle.price)} href={href} lang={lang} />
      </div>
      <div className="vehicle-card-body">
        <h3 className="vehicle-card-title">
          <Link href={href} className="stretched-link">
            {vehicle.make}
            <small>{vehicle.model}</small>
          </Link>
        </h3>
        <ul className="spec-row" aria-label={d.card.specsAria}>
          <li><GaugeIcon /> {formatKm(vehicle.mileage, d.km)}</li>
          <li><FuelIcon /> {d.fuel[vehicle.fuel]}</li>
          <li><GearIcon /> {d.transmission[vehicle.transmission]}</li>
        </ul>
        <div className="vehicle-card-footer">
          <span className="price" dir="ltr">{formatPrice(vehicle.price)}</span>
          <span className="card-link" aria-hidden="true">
            {d.card.inspect} <ArrowIcon className="icon icon-dir" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function VehicleGridSkeleton({ count = 6, lang = "tr" }: { count?: number; lang?: Lang }) {
  return (
    <div className="vehicle-grid" aria-busy="true" aria-label={t(lang).card.loading}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 380 }} />
      ))}
    </div>
  );
}
