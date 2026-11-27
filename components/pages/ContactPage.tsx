import { ClockIcon, ExternalIcon, InstagramMark, MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { InquiryForm } from "@/components/site/InquiryForm";
import { CONTACT, INSTAGRAM_URL, SAHIBINDEN_URL } from "@/lib/constants";
import { t, type Lang } from "@/lib/i18n";

export function ContactPage({ lang }: { lang: Lang }) {
  const d = t(lang);
  const c = d.contact;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{c.title}</h1>
          <p>{c.subtitle}</p>
        </div>
      </section>
      <div className="page">
        <div className="container contact-grid">
          <section className="panel">
            <h2>{c.infoTitle}</h2>
            <ul className="contact-list">
              <li><PhoneIcon /><span><strong>{c.phone}</strong><a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phone}</a></span></li>
              {CONTACT.email && (
                <li><MailIcon /><span><strong>{c.email}</strong><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></span></li>
              )}
              <li><PinIcon /><span><strong>{c.address}</strong>{CONTACT.address}</span></li>
              <li><ClockIcon /><span><strong>{c.hours}</strong>{d.hours}</span></li>
              <li>
                <ExternalIcon />
                <span>
                  <strong>sahibinden.com</strong>
                  <a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer" dir="ltr">ekinotomotiv77.sahibinden.com</a>
                </span>
              </li>
              <li className="contact-social">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <InstagramMark />
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </section>
          <section className="panel">
            <h2>{c.writeUs}</h2>
            <InquiryForm defaultType="bilgi" lang={lang} />
          </section>
        </div>
      </div>
    </>
  );
}
