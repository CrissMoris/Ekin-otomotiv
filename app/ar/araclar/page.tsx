import { CatalogPage } from "@/components/pages/CatalogPage";
import type { SearchParams } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("ar", "/araclar", {
  title: t("ar").catalog.title,
  description: t("ar").catalog.metaDescription,
});

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <CatalogPage searchParams={searchParams} lang="ar" />;
}
