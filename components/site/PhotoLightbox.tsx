"use client";
/* eslint-disable @next/next/no-img-element -- görseller Cloudinary'de zaten boyutlandırılıyor */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon, CloseIcon, EyeIcon } from "@/components/Icons";
import { t, type Lang } from "@/lib/i18n";
import type { Photo } from "@/lib/types";

interface LightboxProps {
  photos: Photo[];
  title: string;
  startIndex?: number;
  price?: string;
  href?: string; // "Araç detayları" bağlantısı (kartlardan açılınca)
  onClose: () => void;
  lang?: Lang;
}

/**
 * Tam ekran fotoğraf görüntüleyici. Sayfadan ayrılmadan fotoğraflar arasında gezinilir:
 * oklar, klavye (← →, Esc) ve mobilde kaydırma ile.
 */
export function Lightbox({ photos, title, startIndex = 0, price, href, onClose, lang = "tr" }: LightboxProps) {
  const d = t(lang).lightbox;
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const [index, setIndex] = useState(startIndex);
  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const current = photos[index];
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={d.photosOf(title)}
      dir="ltr"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="lightbox-inner">
        <div className="lightbox-top">
          <div>
            <strong>{title}</strong>
            <span>
              {index + 1} / {photos.length}
            </span>
          </div>
          <button type="button" className="lightbox-close" onClick={onClose}>
            <CloseIcon /> <span>{d.close}</span>
          </button>
        </div>

        <div
          className="lightbox-stage"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <img src={current.url} alt={`${title} — fotoğraf ${index + 1}`} />
          {photos.length > 1 && (
            <>
              <button type="button" className="lightbox-nav prev" onClick={() => go(-1)} aria-label={d.prev}>
                <ChevronIcon dir="left" />
              </button>
              <button type="button" className="lightbox-nav next" onClick={() => go(1)} aria-label={d.next}>
                <ChevronIcon />
              </button>
            </>
          )}
        </div>

        <div className="lightbox-bottom">
          {photos.length > 1 && (
            <div className="lightbox-thumbs">
              {photos.map((p, i) => (
                <button key={p.id} type="button" aria-current={i === index} aria-label={d.photoN(i + 1)} onClick={() => setIndex(i)}>
                  <img src={p.thumb} alt="" />
                </button>
              ))}
            </div>
          )}
          {(price || href) && (
            <div className="lightbox-footer">
              {price && <span className="lightbox-price">{price}</span>}
              {href && (
                <Link href={href} className="btn btn-red btn-sm">
                  {d.details}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

/** Araç kartındaki "Önizle" düğmesi: fotoğrafları sayfadan çıkmadan açar. */
export function PreviewButton({
  photos,
  title,
  price,
  href,
  lang = "tr",
}: {
  photos: Photo[];
  title: string;
  price: string;
  href: string;
  lang?: Lang;
}) {
  const [open, setOpen] = useState(false);
  const d = t(lang).card;
  if (photos.length === 0) return null;
  return (
    <>
      <button type="button" className="preview-button" onClick={() => setOpen(true)} aria-label={d.previewAria(title)}>
        <EyeIcon /> {d.preview} <span>{photos.length}</span>
      </button>
      {open && <Lightbox photos={photos} title={title} price={price} href={href} lang={lang} onClose={() => setOpen(false)} />}
    </>
  );
}
