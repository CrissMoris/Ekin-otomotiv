"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { ClockIcon, CloseIcon, ExternalIcon, MenuIcon, PhoneIcon } from "@/components/Icons";
import { CONTACT, SAHIBINDEN_URL } from "@/lib/constants";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/araclar", label: "Araçlarımız" },
  { href: "/takas", label: "Takas İşlemleri" },
  { href: "/iletisim", label: "İletişim" },
];

function NavList({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  const isActive = (href: string) => pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <ul>
      {NAV.map((item) => (
        <li key={item.href}>
          <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} onClick={onNavigate}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Etkin sayfa bilgisi istek anında belli olduğu için ayrı bileşende okunur.
function ActiveNavList({ onNavigate }: { onNavigate: () => void }) {
  return <NavList pathname={usePathname()} onNavigate={onNavigate} />;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-group">
            <a href={CONTACT.phoneHref}>
              <PhoneIcon /> {CONTACT.phone}
            </a>
            <span className="hide-sm">
              <ClockIcon /> {CONTACT.hours}
            </span>
          </div>
          <a href={SAHIBINDEN_URL} target="_blank" rel="noopener noreferrer">
            sahibinden.com<span className="hide-xs">&nbsp;mağazamız</span> <ExternalIcon />
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="container">
          <Logo />
          <nav className={`main-nav${open ? " open" : ""}`} aria-label="Ana menü">
            <Suspense fallback={<NavList pathname={null} onNavigate={close} />}>
              <ActiveNavList onNavigate={close} />
            </Suspense>
          </nav>
          <div className="header-actions">
            <Link href="/takas" className="btn btn-red">
              Teklif Al
            </Link>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
