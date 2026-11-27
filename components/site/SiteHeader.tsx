"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { ClockIcon, CloseIcon, ExternalIcon, MenuIcon, PhoneIcon } from "@/components/Icons";
import { CONTACT, SAHIBINDEN_URL } from "@/lib/constants";
import { LANG_INFO, lp, switchPath, t, type Lang } from "@/lib/i18n";
import { LanguageMenu } from "./LanguageMenu";
import { Logo } from "./Logo";

function NavList({ lang, pathname, onNavigate }: { lang: Lang; pathname: string | null; onNavigate: () => void }) {
  const d = t(lang).nav;
  const items = [
    { path: "/", label: d.home },
    { path: "/araclar", label: d.vehicles },
    { path: "/takas", label: d.trade },
    { path: "/iletisim", label: d.contact },
  ];
  const base = pathname === null ? null : switchPath(pathname, "tr");
  const isActive = (path: string) => base !== null && (path === "/" ? base === "/" : base.startsWith(path));
  return (
    <ul>
      {items.map((item) => (
        <li key={item.path}>
          <Link href={lp(lang, item.path)} aria-current={isActive(item.path) ? "page" : undefined} onClick={onNavigate}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Etkin sayfa bilgisi istek anında belli olduğu için ayrı bileşende okunur.
function ActiveNavList({ lang, onNavigate }: { lang: Lang; onNavigate: () => void }) {
  return <NavList lang={lang} pathname={usePathname()} onNavigate={onNavigate} />;
}

export function SiteHeader({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const d = t(lang);

  return (
    <div className="site-top">
      <div className="topbar">
        <div className="container">
          <div className="topbar-group">
            <a href={CONTACT.phoneHref}>
              <PhoneIcon /> <span dir="ltr">{CONTACT.phone}</span>
            </a>
            <span className="hide-sm">
              <ClockIcon /> {d.hours}
            </span>
          </div>
          <div className="topbar-group">
            <a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer" className="topbar-sahibinden">
              sahibinden.com<span className="hide-xs">&nbsp;{d.header.sahibindenStore}</span> <ExternalIcon />
            </a>
            <Suspense fallback={<span className="lang-toggle-placeholder">{LANG_INFO[lang].short}</span>}>
              <LanguageMenu lang={lang} />
            </Suspense>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container">
          <Logo lang={lang} />
          <nav className={`main-nav${open ? " open" : ""}`} aria-label={d.header.mainMenu}>
            <Suspense fallback={<NavList lang={lang} pathname={null} onNavigate={close} />}>
              <ActiveNavList lang={lang} onNavigate={close} />
            </Suspense>
          </nav>
          <div className="header-actions">
            <Link href={lp(lang, "/takas")} className="btn btn-red">
              {d.header.getOffer}
            </Link>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-label={open ? d.header.menuClose : d.header.menuOpen}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
