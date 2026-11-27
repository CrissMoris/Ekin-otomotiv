import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/site/CatalogFilters";
import { VehicleCard, VehicleGridSkeleton } from "@/components/site/VehicleCard";
import { hasActiveFilters, parseFilters, type SearchParams } from "@/lib/filters";
import { lp, t, type Lang } from "@/lib/i18n";
import { getMakes, getPublishedVehicles } from "@/lib/store";

async function Catalog({ searchParams, lang }: { searchParams: Promise<SearchParams>; lang: Lang }) {
  const d = t(lang).catalog;
  const filters = parseFilters(await searchParams);
  const [vehicles, makes] = await Promise.all([getPublishedVehicles(filters), getMakes()]);
  return (
    <div className="catalog-layout">
      <CatalogFilters filters={filters} makes={makes} lang={lang} />
      <div>
        <div className="results-bar">
          <span>
            <strong>{vehicles.length}</strong> {d.listed}
            {hasActiveFilters(filters) ? d.filtered : ""}
          </span>
        </div>
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <p>{d.empty}</p>
            <Link href={lp(lang, "/araclar")} className="btn btn-outline">
              {d.clearFilters}
            </Link>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CatalogPage({ searchParams, lang }: { searchParams: Promise<SearchParams>; lang: Lang }) {
  const d = t(lang).catalog;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{d.title}</h1>
          <p>{d.subtitle}</p>
        </div>
      </section>
      <div className="page">
        <div className="container">
          <Suspense fallback={<VehicleGridSkeleton lang={lang} />}>
            <Catalog searchParams={searchParams} lang={lang} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
