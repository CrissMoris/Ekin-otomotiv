import { HomePage } from "@/components/pages/HomePage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("tr", "/", {
  title: t("tr").home.metaTitle,
  absolute: true,
  description: t("tr").home.metaDescription,
});

export default function Page() {
  return <HomePage lang="tr" />;
}
