import { CatalogPage } from "@/components/pages/CatalogPage";
import type { SearchParams } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("tr", "/araclar", {
  title: t("tr").catalog.title,
  description: t("tr").catalog.metaDescription,
});

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <CatalogPage searchParams={searchParams} lang="tr" />;
}
