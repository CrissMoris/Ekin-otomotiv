import { HomePage } from "@/components/pages/HomePage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("en", "/", {
  title: t("en").home.metaTitle,
  absolute: true,
  description: t("en").home.metaDescription,
});

export default function Page() {
  return <HomePage lang="en" />;
}
