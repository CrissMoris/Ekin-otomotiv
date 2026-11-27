"use client";

import { useEffect, useRef, useState } from "react";
import { ChatIcon, CheckIcon, LinkIcon, MailIcon, ShareIcon } from "@/components/Icons";
import { t, type Lang } from "@/lib/i18n";

/** Sayfanın adresi (sorgu ve çapa olmadan). Yalnızca menü açıldıktan sonra çağrılır. */
function pageUrl() {
  return window.location.origin + window.location.pathname;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Pano izni olmayan eski tarayıcılar için yedek yöntem
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}

/** İlan paylaşımı: WhatsApp, bağlantıyı kopyala, e-posta. */
export function ShareMenu({ title, lang }: { title: string; lang: Lang }) {
  const x = t(lang).detail;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1600);
    return () => clearTimeout(id);
  }, [copied]);

  const url = open ? pageUrl() : "";
  const text = x.shareText(title);

  return (
    <div className="share-menu" ref={ref}>
      <button
        type="button"
        className="share-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ShareIcon /> {x.share}
      </button>
      {open && (
        <ul className="share-list">
          <li>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <ChatIcon /> {x.shareWhatsApp}
            </a>
          </li>
          <li>
            <button type="button" onClick={async () => setCopied(await copyText(url))}>
              {copied ? <CheckIcon /> : <LinkIcon />} {copied ? x.shareCopied : x.shareCopy}
            </button>
          </li>
          <li>
            <a
              href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
              onClick={() => setOpen(false)}
            >
              <MailIcon /> {x.shareEmail}
            </a>
          </li>
        </ul>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? x.shareCopied : ""}
      </span>
    </div>
  );
}
