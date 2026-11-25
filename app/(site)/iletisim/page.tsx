import type { Metadata } from "next";
import { ClockIcon, ExternalIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { InquiryForm } from "@/components/site/InquiryForm";
import { CONTACT, SAHIBINDEN_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Ekin Otomotiv iletişim bilgileri ve bilgi talep formu.",
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>İletişim</h1>
          <p>Sorularınız için bizi arayabilir veya formu doldurabilirsiniz.</p>
        </div>
      </section>
      <div className="page">
        <div className="container contact-grid">
          <section className="panel">
            <h2>İletişim bilgileri</h2>
            <ul className="contact-list">
              <li><PhoneIcon /><span><strong>Telefon</strong><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></span></li>
              {CONTACT.email && (
                <li><MailIcon /><span><strong>E-posta</strong><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></span></li>
              )}
              <li><PinIcon /><span><strong>Adres</strong>{CONTACT.address}</span></li>
              <li><ClockIcon /><span><strong>Çalışma saatleri</strong>{CONTACT.hours}</span></li>
              <li>
                <ExternalIcon />
                <span>
                  <strong>sahibinden.com</strong>
                  <a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer">ekinotomotiv77.sahibinden.com</a>
                </span>
              </li>
            </ul>
          </section>
          <section className="panel">
            <h2>Bize yazın</h2>
            <InquiryForm defaultType="bilgi" />
          </section>
        </div>
      </div>
    </>
  );
}
