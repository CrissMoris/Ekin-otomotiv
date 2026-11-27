import { TradePage } from "@/components/pages/TradePage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("tr", "/takas", {
  title: t("tr").trade.metaTitle,
  description: t("tr").trade.subtitle,
});

export default function Page() {
  return <TradePage lang="tr" />;
}
