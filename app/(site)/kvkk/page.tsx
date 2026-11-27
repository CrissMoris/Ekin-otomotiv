import { KvkkPage } from "@/components/pages/KvkkPage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("tr", "/kvkk", {
  title: t("tr").kvkk.title,
  description: t("tr").kvkk.metaDescription,
});

export default function Page() {
  return <KvkkPage lang="tr" />;
}
