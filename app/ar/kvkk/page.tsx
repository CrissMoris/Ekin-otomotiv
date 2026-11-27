import { KvkkPage } from "@/components/pages/KvkkPage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("ar", "/kvkk", {
  title: t("ar").kvkk.title,
  description: t("ar").kvkk.metaDescription,
});

export default function Page() {
  return <KvkkPage lang="ar" />;
}
