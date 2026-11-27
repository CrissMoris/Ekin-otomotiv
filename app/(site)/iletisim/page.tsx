import { ContactPage } from "@/components/pages/ContactPage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("tr", "/iletisim", {
  title: t("tr").contact.title,
  description: t("tr").contact.metaDescription,
});

export default function Page() {
  return <ContactPage lang="tr" />;
}
