"use client";
/* eslint-disable @next/next/no-img-element -- görseller Cloudinary'de zaten boyutlandırılıyor */

import { useState } from "react";
import { ChevronIcon, ExpandIcon } from "@/components/Icons";
import type { Photo } from "@/lib/types";
import { Lightbox } from "./PhotoLightbox";

export function VehicleGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  if (photos.length === 0) return <div className="gallery-main" aria-label="Fotoğraf yok" />;
  const current = photos[Math.min(index, photos.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div>
      <div className="gallery-main">
        <button type="button" className="gallery-open" onClick={() => setZoom(true)} aria-label="Fotoğrafı büyüt">
          <img src={current.url} alt={`${title} — fotoğraf ${index + 1}`} />
        </button>
        <button type="button" className="gallery-expand" onClick={() => setZoom(true)}>
          <ExpandIcon /> Büyüt
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label="Önceki fotoğraf">
              <ChevronIcon dir="left" />
            </button>
            <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label="Sonraki fotoğraf">
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
            <button key={p.id} type="button" aria-current={i === index} aria-label={`Fotoğraf ${i + 1}`} onClick={() => setIndex(i)}>
              <img src={p.thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {zoom && <Lightbox photos={photos} title={title} startIndex={index} onClose={() => setZoom(false)} />}
    </div>
  );
}
