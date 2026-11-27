"use client";
/* eslint-disable @next/next/no-img-element -- görseller Cloudinary'de zaten boyutlandırılıyor */

import { useState } from "react";
import { ChevronIcon, ExpandIcon } from "@/components/Icons";
import { t, type Lang } from "@/lib/i18n";
import type { Photo } from "@/lib/types";
import { Lightbox } from "./PhotoLightbox";

export function VehicleGallery({ photos, title, lang = "tr" }: { photos: Photo[]; title: string; lang?: Lang }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const d = t(lang).lightbox;
  if (photos.length === 0) return <div className="gallery-main" aria-label={d.noPhoto} />;
  const current = photos[Math.min(index, photos.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div dir="ltr">
      <div className="gallery-main">
        <button type="button" className="gallery-open" onClick={() => setZoom(true)} aria-label={d.enlargeAria}>
          <img src={current.url} alt={d.photoAlt(title, index + 1)} />
        </button>
        <button type="button" className="gallery-expand" onClick={() => setZoom(true)}>
          <ExpandIcon /> {d.enlarge}
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label={d.prev}>
              <ChevronIcon dir="left" />
            </button>
            <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label={d.next}>
              <ChevronIcon />
            </button>
            <span className="gallery-counter">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button key={p.id} type="button" aria-current={i === index} aria-label={d.photoN(i + 1)} onClick={() => setIndex(i)}>
              <img src={p.thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {zoom && <Lightbox photos={photos} title={title} startIndex={index} lang={lang} onClose={() => setZoom(false)} />}
    </div>
  );
}
