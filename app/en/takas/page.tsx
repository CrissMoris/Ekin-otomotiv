import { TradePage } from "@/components/pages/TradePage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("en", "/takas", {
  title: t("en").trade.metaTitle,
  description: t("en").trade.subtitle,
});

export default function Page() {
  return <TradePage lang="en" />;
}
