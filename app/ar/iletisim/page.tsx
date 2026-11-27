import { ContactPage } from "@/components/pages/ContactPage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("ar", "/iletisim", {
  title: t("ar").contact.title,
  description: t("ar").contact.metaDescription,
});

export default function Page() {
  return <ContactPage lang="ar" />;
}
