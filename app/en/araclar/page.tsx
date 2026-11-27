import { CatalogPage } from "@/components/pages/CatalogPage";
import type { SearchParams } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("en", "/araclar", {
  title: t("en").catalog.title,
  description: t("en").catalog.metaDescription,
});

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <CatalogPage searchParams={searchParams} lang="en" />;
}
