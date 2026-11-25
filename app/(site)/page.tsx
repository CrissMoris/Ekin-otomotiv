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
import { getPublishedVehicles } from "@/lib/store";

const HOME_LIMIT = 6;

/** Üst alanda kart yerine sade bir avantaj listesi. */
const ADVANTAGES = [
  { icon: ClockIcon, title: "Hızlı dönüş", text: "Talebinize en kısa sürede dönüş yapıyoruz." },
  { icon: TagIcon, title: "Kendi teklifinizle gelin", text: "Beğendiğiniz araç için teklifinizi iletin, birlikte değerlendirelim." },
  { icon: HandshakeIcon, title: "Esnek anlaşma", text: "Ödeme ve takas koşullarını ihtiyacınıza göre birlikte belirliyoruz." },
  { icon: WrenchIcon, title: "Hasarlı araç alımı", text: "Hasarlı ya da hasarsız, her durumdaki aracınıza teklif veriyoruz." },
];

const SERVICES = [
  {
    icon: CarIcon,
    title: "Araç Satışı",
    text: "Kontrolleri yapılmış, bakımlı ikinci el araçlarımızı galerimizde inceleyebilir, ekspertiz raporlarını talep edebilirsiniz.",
  },
  {
    icon: WrenchIcon,
    title: "Hasarlı ve Hasarsız Araç Alımı",
    text: "Kaza geçirmiş, hasar kayıtlı ya da hasarsız aracınızı değerlendiriyor; piyasa koşullarına uygun, hızlı teklif sunuyoruz.",
  },
  {
    icon: SwapIcon,
    title: "Takas",
    text: "Mevcut aracınızı değerlendirerek stoğumuzdaki araçlarla takas ediyor, aradaki farkı birlikte planlıyoruz.",
  },
];

async function Vehicles() {
  const all = await getPublishedVehicles();
  if (all.length === 0) return <div className="empty-state">Şu anda satışta araç bulunmuyor.</div>;
  return (
    <>
      <div className="vehicle-grid">
        {all.slice(0, HOME_LIMIT).map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
      {all.length > HOME_LIMIT && (
        <div className="section-more">
          <Link href="/araclar" className="btn btn-dark">
            Tüm araçları görüntüle ({all.length})
          </Link>
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">Ekin Otomotiv</span>
            <h1>
              İkinci el araçta <span>güvenilir adres.</span>
            </h1>
            <p className="hero-lead">
              Araç satışı, hasarlı ve hasarsız araç alımı ile takas işlemlerinde şeffaf fiyat, hızlı dönüş ve esnek
              anlaşma.
            </p>
            <div className="hero-actions">
              <Link href="/takas" className="btn btn-red">
                Teklifinizi İletin
              </Link>
              <a href={CONTACT.phoneHref} className="btn btn-ghost">
                <PhoneIcon /> {CONTACT.phone}
              </a>
            </div>
          </div>
          <ul className="hero-advantages" aria-label="Neden Ekin Otomotiv">
            {ADVANTAGES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon />
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-gray">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Galeri</span>
              <h2>Satıştaki araçlarımız</h2>
            </div>
            <p className="section-note">Beğendiğiniz araç için kendi teklifinizle gelebilirsiniz.</p>
          </div>
          <Suspense fallback={<VehicleGridSkeleton />}>
            <Vehicles />
          </Suspense>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Hizmetlerimiz</span>
              <h2>Alım, satım ve takas tek noktada</h2>
            </div>
          </div>
          <div className="services">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <div className="service" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="offer">
        <div className="container offer-grid">
          <div>
            <span className="eyebrow">Teklifiniz bizim için önemli</span>
            <h2>Kendi teklifinizle gelin, birlikte anlaşalım.</h2>
            <p>
              Satın almak istediğiniz araç, takasa vermek istediğiniz ya da satmak istediğiniz aracınız için teklifinizi
              iletin. Ekibimiz kısa sürede size dönüş yapsın; ödeme ve takas koşullarını ihtiyacınıza göre birlikte
              belirleyelim.
            </p>
          </div>
          <div className="offer-actions">
            <Link href="/takas" className="btn btn-red">
              Teklifinizi İletin
            </Link>
            <a href={CONTACT.phoneHref} className="btn btn-outline">
              <PhoneIcon /> Hemen Arayın
            </a>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div>
            <h2>İlanlarımız sahibinden.com&apos;da da yayında</h2>
            <p>Mağaza sayfamızdan tüm ilanlarımızı takip edebilirsiniz.</p>
          </div>
          <a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer" className="btn btn-white">
            sahibinden.com Mağazamız <ExternalIcon />
          </a>
        </div>
      </section>
    </>
  );
}
