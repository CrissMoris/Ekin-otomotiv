import Link from "next/link";
import { InstagramMark } from "@/components/Icons";
import { CONTACT, INSTAGRAM_HANDLE, INSTAGRAM_URL, SAHIBINDEN_URL } from "@/lib/constants";
import { lp, t, type Lang } from "@/lib/i18n";
import { Logo } from "./Logo";

export function SiteFooter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo variant="white" className="footer-logo" lang={lang} />
            <p>{d.footer.about}</p>
          </div>
          <div>
            <h3>{d.footer.corporate}</h3>
            <ul>
              <li><Link href={lp(lang, "/araclar")}>{d.nav.vehicles}</Link></li>
              <li><Link href={lp(lang, "/takas")}>{d.nav.trade}</Link></li>
              <li><Link href={lp(lang, "/iletisim")}>{d.nav.contact}</Link></li>
              <li><a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer">{d.footer.sahibindenStore}</a></li>
            </ul>
          </div>
          <div>
            <h3>{d.footer.contact}</h3>
            <ul>
              <li><a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phone}</a></li>
              {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}
              <li>{CONTACT.address}</li>
              <li>{d.hours}</li>
            </ul>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label={`Instagram ${INSTAGRAM_HANDLE}`} title="Instagram">
              <InstagramMark />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{d.footer.rights}</span>
          <Link href={lp(lang, "/kvkk")}>{d.footer.kvkk}</Link>
        </div>
      </div>
    </footer>
  );
}
