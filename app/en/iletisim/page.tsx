import { ContactPage } from "@/components/pages/ContactPage";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("en", "/iletisim", {
  title: t("en").contact.title,
  description: t("en").contact.metaDescription,
});

export default function Page() {
  return <ContactPage lang="en" />;
}
