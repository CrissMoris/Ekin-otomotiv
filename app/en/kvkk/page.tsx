import { KvkkPage } from "@/components/pages/KvkkPage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("en", "/kvkk", {
  title: t("en").kvkk.title,
  description: t("en").kvkk.metaDescription,
});

export default function Page() {
  return <KvkkPage lang="en" />;
}
