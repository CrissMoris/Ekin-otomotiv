import { TradePage } from "@/components/pages/TradePage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("ar", "/takas", {
  title: t("ar").trade.metaTitle,
  description: t("ar").trade.subtitle,
});

export default function Page() {
  return <TradePage lang="ar" />;
}
