"use client";
/* eslint-disable @next/next/no-img-element -- görseller Cloudinary'de zaten boyutlandırılıyor */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon, CloseIcon, EyeIcon } from "@/components/Icons";
import type { Photo } from "@/lib/types";

interface LightboxProps {
  photos: Photo[];
  title: string;
  startIndex?: number;
  price?: string;
  href?: string; // "Araç detayları" bağlantısı (kartlardan açılınca)
  onClose: () => void;
}

/**
 * Tam ekran fotoğraf görüntüleyici. Sayfadan ayrılmadan fotoğraflar arasında gezinilir:
 * oklar, klavye (← →, Esc) ve mobilde kaydırma ile.
 */
export function Lightbox({ photos, title, startIndex = 0, price, href, onClose }: LightboxProps) {
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
      aria-label={`${title} fotoğrafları`}
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
          <button type="button" className="lightbox-close" onClick={onClose} aria-label="Kapat">
            <CloseIcon />
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
              <button type="button" className="lightbox-nav prev" onClick={() => go(-1)} aria-label="Önceki fotoğraf">
                <ChevronIcon dir="left" />
              </button>
              <button type="button" className="lightbox-nav next" onClick={() => go(1)} aria-label="Sonraki fotoğraf">
                <ChevronIcon />
              </button>
            </>
          )}
        </div>

        <div className="lightbox-bottom">
          {photos.length > 1 && (
            <div className="lightbox-thumbs">
              {photos.map((p, i) => (
                <button key={p.id} type="button" aria-current={i === index} aria-label={`Fotoğraf ${i + 1}`} onClick={() => setIndex(i)}>
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
                  Araç Detayları
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
export function PreviewButton({ photos, title, price, href }: { photos: Photo[]; title: string; price: string; href: string }) {
  const [open, setOpen] = useState(false);
  if (photos.length === 0) return null;
  return (
    <>
      <button type="button" className="preview-button" onClick={() => setOpen(true)} aria-label={`${title} fotoğraflarını önizle`}>
        <EyeIcon /> Önizle <span>{photos.length}</span>
      </button>
      {open && <Lightbox photos={photos} title={title} price={price} href={href} onClose={() => setOpen(false)} />}
    </>
  );
}
