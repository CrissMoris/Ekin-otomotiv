import Link from "next/link";
import { CONTACT, SAHIBINDEN_URL } from "@/lib/constants";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo variant="white" className="footer-logo" />
            <p>
              İkinci el araç satışı, hasarlı ve hasarsız araç alımı ile takas işlemlerinde şeffaf ve güvenilir
              hizmet.
            </p>
          </div>
          <div>
            <h3>Kurumsal</h3>
            <ul>
              <li><Link href="/araclar">Araçlarımız</Link></li>
              <li><Link href="/takas">Takas İşlemleri</Link></li>
              <li><Link href="/iletisim">İletişim</Link></li>
              <li><a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer">sahibinden.com Mağazamız</a></li>
            </ul>
          </div>
          <div>
            <h3>İletişim</h3>
            <ul>
              <li><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
              {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}
              <li>{CONTACT.address}</li>
              <li>{CONTACT.hours}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© Ekin Otomotiv. Tüm hakları saklıdır.</span>
          <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
        </div>
      </div>
    </footer>
  );
}
