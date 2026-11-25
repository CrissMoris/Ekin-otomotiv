import type { VehicleFilters } from "./types";

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const int = (v: string | string[] | undefined) => {
  const n = Number(first(v)?.replace(/\D/g, ""));
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
};
const SORTS = ["yeni", "fiyat-artan", "fiyat-azalan", "km-artan"];

/** Adres çubuğundaki filtreleri (?marka=...&max_fiyat=...) güvenle okur. */
export function parseFilters(sp: SearchParams): VehicleFilters {
  const sort = first(sp.sirala);
  return {
    make: first(sp.marka)?.slice(0, 40),
    minPrice: int(sp.min_fiyat),
    maxPrice: int(sp.max_fiyat),
    minYear: int(sp.min_yil),
    maxYear: int(sp.max_yil),
    sort: sort && SORTS.includes(sort) ? (sort as VehicleFilters["sort"]) : undefined,
  };
}

export const hasActiveFilters = (f: VehicleFilters) =>
  Boolean(f.make || f.minPrice || f.maxPrice || f.minYear || f.maxYear);
