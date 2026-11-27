import Link from "next/link";
import { Suspense } from "react";
import {
  CarIcon,
  ClockIcon,
  ExternalIcon,
  HandshakeIcon,
  PhoneIcon,
  SwapIcon,
  TagIcon,
  WrenchIcon,
} from "@/components/Icons";
import { VehicleCard, VehicleGridSkeleton } from "@/components/site/VehicleCard";
import { CONTACT, SAHIBINDEN_URL } from "@/lib/constants";
import { lp, t, type Lang } from "@/lib/i18n";
import { getPublishedVehicles } from "@/lib/store";

const HOME_LIMIT = 6;
const ADVANTAGE_ICONS = [ClockIcon, TagIcon, HandshakeIcon, WrenchIcon];
const SERVICE_ICONS = [CarIcon, WrenchIcon, SwapIcon];

async function Vehicles({ lang }: { lang: Lang }) {
  const d = t(lang).home;
  const all = await getPublishedVehicles();
  if (all.length === 0) return <div className="empty-state">{d.noVehicles}</div>;
  return (
    <>
      <div className="vehicle-grid">
        {all.slice(0, HOME_LIMIT).map((v) => (
          <VehicleCard key={v.id} vehicle={v} lang={lang} />
        ))}
      </div>
      {all.length > HOME_LIMIT && (
        <div className="section-more">
          <Link href={lp(lang, "/araclar")} className="btn btn-dark">
            {d.viewAll(all.length)}
          </Link>
        </div>
      )}
    </>
  );
}

export function HomePage({ lang }: { lang: Lang }) {
  const d = t(lang).home;
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">{d.eyebrow}</span>
            <h1>
              {d.titleA}
              <span>{d.titleB}</span>
            </h1>
            <p className="hero-lead">{d.lead}</p>
            <div className="hero-actions">
              <Link href={lp(lang, "/takas")} className="btn btn-red">
                {d.ctaOffer}
              </Link>
              <a href={CONTACT.phoneHref} className="btn btn-ghost">
                <PhoneIcon /> <span dir="ltr">{CONTACT.phone}</span>
              </a>
            </div>
          </div>
          <ul className="hero-advantages" aria-label={d.advantagesAria}>
            {d.advantages.map(({ title, text }, i) => {
              const Icon = ADVANTAGE_ICONS[i];
              return (
                <li key={title}>
                  <Icon />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section section-gray">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{d.galleryEyebrow}</span>
              <h2>{d.galleryTitle}</h2>
            </div>
            <p className="section-note">{d.galleryNote}</p>
          </div>
          <Suspense fallback={<VehicleGridSkeleton lang={lang} />}>
            <Vehicles lang={lang} />
          </Suspense>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{d.servicesEyebrow}</span>
              <h2>{d.servicesTitle}</h2>
            </div>
          </div>
          <div className="services">
            {d.services.map(({ title, text }, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <div className="service" key={title}>
                  <Icon />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="offer">
        <div className="container offer-grid">
          <div>
            <span className="eyebrow">{d.offerEyebrow}</span>
            <h2>{d.offerTitle}</h2>
            <p>{d.offerText}</p>
          </div>
          <div className="offer-actions">
            <Link href={lp(lang, "/takas")} className="btn btn-red">
              {d.ctaOffer}
            </Link>
            <a href={CONTACT.phoneHref} className="btn btn-outline">
              <PhoneIcon /> {d.callNow}
            </a>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div>
            <h2>{d.bandTitle}</h2>
            <p>{d.bandText}</p>
          </div>
          <a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer" className="btn btn-white">
            {t(lang).footer.sahibindenStore} <ExternalIcon />
          </a>
        </div>
      </section>
    </>
  );
}
