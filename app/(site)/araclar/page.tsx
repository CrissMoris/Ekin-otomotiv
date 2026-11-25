import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/site/CatalogFilters";
import { VehicleCard, VehicleGridSkeleton } from "@/components/site/VehicleCard";
import { hasActiveFilters, parseFilters, type SearchParams } from "@/lib/filters";
import { getMakes, getPublishedVehicles } from "@/lib/store";

export const metadata: Metadata = {
  title: "Araçlarımız",
  description: "Satıştaki ikinci el araçlarımızı marka, fiyat ve model yılına göre filtreleyin.",
};

async function Catalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseFilters(await searchParams);
  const [vehicles, makes] = await Promise.all([getPublishedVehicles(filters), getMakes()]);
  return (
    <div className="catalog-layout">
      <CatalogFilters filters={filters} makes={makes} />
      <div>
        <div className="results-bar">
          <span>
            <strong>{vehicles.length}</strong> araç listeleniyor{hasActiveFilters(filters) ? " (filtre uygulandı)" : ""}
          </span>
        </div>
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <p>Seçtiğiniz kriterlere uygun araç bulunamadı.</p>
            <Link href="/araclar" className="btn btn-outline">
              Filtreleri temizle
            </Link>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Araçlarımız</h1>
          <p>Satıştaki ikinci el araçlarımızı keşfedin, aradığınız araç için bizimle iletişime geçin.</p>
        </div>
      </section>
      <div className="page">
        <div className="container">
          <Suspense fallback={<VehicleGridSkeleton />}>
            <Catalog searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
