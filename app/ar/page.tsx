import { HomePage } from "@/components/pages/HomePage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("ar", "/", {
  title: t("ar").home.metaTitle,
  absolute: true,
  description: t("ar").home.metaDescription,
});

export default function Page() {
  return <HomePage lang="ar" />;
}
