import Link from "next/link";
import { lp, t, type Lang } from "@/lib/i18n";
import type { VehicleFilters } from "@/lib/types";

/** URL tabanlı (JavaScript gerektirmeyen) filtre formu. */
export function CatalogFilters({ filters, makes, lang }: { filters: VehicleFilters; makes: string[]; lang: Lang }) {
  const d = t(lang).catalog.filters;
  const action = lp(lang, "/araclar");
  return (
    <details className="filters" open>
      <summary>{d.title}</summary>
      <form action={action} method="get" className="filters-body">
        <div className="field">
          <label htmlFor="f-marka">{d.make}</label>
          <select id="f-marka" name="marka" className="select" defaultValue={filters.make ?? ""}>
            <option value="">{d.allMakes}</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">{d.price}</span>
          <div className="range-row">
            <input className="input" name="min_fiyat" inputMode="numeric" placeholder={d.min} aria-label={d.minPriceAria} defaultValue={filters.minPrice ?? ""} />
            <input className="input" name="max_fiyat" inputMode="numeric" placeholder={d.max} aria-label={d.maxPriceAria} defaultValue={filters.maxPrice ?? ""} />
          </div>
        </div>
        <div className="field">
          <span className="field-label">{d.year}</span>
          <div className="range-row">
            <input className="input" name="min_yil" inputMode="numeric" placeholder={d.oldest} aria-label={d.minYearAria} defaultValue={filters.minYear ?? ""} />
            <input className="input" name="max_yil" inputMode="numeric" placeholder={d.newest} aria-label={d.maxYearAria} defaultValue={filters.maxYear ?? ""} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-sirala">{d.sort}</label>
          <select id="f-sirala" name="sirala" className="select" defaultValue={filters.sort ?? "yeni"}>
            {(Object.keys(d.sorts) as (keyof typeof d.sorts)[]).map((k) => (
              <option key={k} value={k}>{d.sorts[k]}</option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn btn-red">{d.apply}</button>
          <Link href={action} className="btn btn-outline">{d.clear}</Link>
        </div>
      </form>
    </details>
  );
}
