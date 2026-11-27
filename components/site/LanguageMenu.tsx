"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/Icons";
import { LANG_INFO, LANGS, switchPath, t, type Lang } from "@/lib/i18n";

/** Dil seçimi: "TR ⌄" düğmesi, tıklanınca diller liste olarak açılır. */
export function LanguageMenu({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang-menu" ref={ref}>
      <button
        type="button"
        className="lang-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t(lang).langSwitchAria}: ${LANG_INFO[lang].name}`}
        onClick={() => setOpen((v) => !v)}
      >
        {LANG_INFO[lang].short}
        <ChevronDownIcon />
      </button>
      {open && (
        <ul className="lang-list">
          {LANGS.map((l) => (
            <li key={l}>
              <Link
                href={switchPath(pathname || "/", l)}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                <span>{LANG_INFO[l].name}</span>
                {l === lang && <CheckIcon />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
