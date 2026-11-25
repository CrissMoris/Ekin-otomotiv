import Link from "next/link";
import type { VehicleFilters } from "@/lib/types";

/** URL tabanlı (JavaScript gerektirmeyen) filtre formu. */
export function CatalogFilters({ filters, makes }: { filters: VehicleFilters; makes: string[] }) {
  return (
    <details className="filters" open>
      <summary>Araç Filtrele</summary>
      <form action="/araclar" method="get" className="filters-body">
        <div className="field">
          <label htmlFor="f-marka">Marka</label>
          <select id="f-marka" name="marka" className="select" defaultValue={filters.make ?? ""}>
            <option value="">Tüm markalar</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">Fiyat (₺)</span>
          <div className="range-row">
            <input className="input" name="min_fiyat" inputMode="numeric" placeholder="En az" aria-label="En düşük fiyat" defaultValue={filters.minPrice ?? ""} />
            <input className="input" name="max_fiyat" inputMode="numeric" placeholder="En çok" aria-label="En yüksek fiyat" defaultValue={filters.maxPrice ?? ""} />
          </div>
        </div>
        <div className="field">
          <span className="field-label">Model yılı</span>
          <div className="range-row">
            <input className="input" name="min_yil" inputMode="numeric" placeholder="En eski" aria-label="En eski model yılı" defaultValue={filters.minYear ?? ""} />
            <input className="input" name="max_yil" inputMode="numeric" placeholder="En yeni" aria-label="En yeni model yılı" defaultValue={filters.maxYear ?? ""} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-sirala">Sıralama</label>
          <select id="f-sirala" name="sirala" className="select" defaultValue={filters.sort ?? "yeni"}>
            <option value="yeni">En yeni ilanlar</option>
            <option value="fiyat-artan">Fiyat: düşükten yükseğe</option>
            <option value="fiyat-azalan">Fiyat: yüksekten düşüğe</option>
            <option value="km-artan">Kilometre: düşükten yükseğe</option>
          </select>
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn btn-red">Uygula</button>
          <Link href="/araclar" className="btn btn-outline">Temizle</Link>
        </div>
      </form>
    </details>
  );
}
