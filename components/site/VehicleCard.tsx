/* eslint-disable @next/next/no-img-element -- görseller Cloudinary'de zaten boyutlandırılıyor */
import Link from "next/link";
import { ArrowIcon, FuelIcon, GaugeIcon, GearIcon } from "@/components/Icons";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import { formatKm, formatPrice } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { PreviewButton } from "./PhotoLightbox";

/** Kartın tamamı detay sayfasına gider; "Önizle" fotoğrafları sayfadan çıkmadan açar. */
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const cover = vehicle.photos[0];
  const title = `${vehicle.make} ${vehicle.model}`;
  const href = `/araclar/${vehicle.id}`;
  return (
    <article className="vehicle-card">
      <div className="vehicle-card-media">
        {cover && <img src={cover.thumb} alt={title} loading="lazy" />}
        <span className="media-badge">{vehicle.year}</span>
        <PreviewButton photos={vehicle.photos} title={title} price={formatPrice(vehicle.price)} href={href} />
      </div>
      <div className="vehicle-card-body">
        <h3 className="vehicle-card-title">
          <Link href={href} className="stretched-link">
            {vehicle.make}
            <small>{vehicle.model}</small>
          </Link>
        </h3>
        <ul className="spec-row" aria-label="Araç özellikleri">
          <li><GaugeIcon /> {formatKm(vehicle.mileage)}</li>
          <li><FuelIcon /> {FUEL_LABELS[vehicle.fuel]}</li>
          <li><GearIcon /> {TRANSMISSION_LABELS[vehicle.transmission]}</li>
        </ul>
        <div className="vehicle-card-footer">
          <span className="price">{formatPrice(vehicle.price)}</span>
          <span className="card-link" aria-hidden="true">
            İncele <ArrowIcon className="icon" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="vehicle-grid" aria-busy="true" aria-label="Araçlar yükleniyor">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 380 }} />
      ))}
    </div>
  );
}
