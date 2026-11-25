"use client";
/* eslint-disable @next/next/no-img-element -- yerel önizleme (blob:) adresleri için düz <img> gerekir */

import { useRef, useState } from "react";
import { MAX_PHOTOS_PER_VEHICLE } from "@/lib/constants";
import { checkSelectedFile } from "@/lib/images/client";

/**
 * Formdaki bir fotoğraf. `id` doluysa fotoğraf yüklenmiştir (Sheets'e yazılacak değer);
 * boşsa bilgisayardan yeni seçilmiştir ve "Kaydet"e basınca yüklenecektir.
 */
export interface PhotoItem {
  key: string;
  id: string | null;
  src: string; // önizleme adresi
  file?: File;
}

let counter = 0;
const fromFile = (file: File): PhotoItem => ({
  key: `yeni-${++counter}`,
  id: null,
  src: URL.createObjectURL(file),
  file,
});

interface Props {
  items: PhotoItem[];
  onChange: (items: PhotoItem[]) => void;
  error?: string;
  disabled?: boolean;
}

export function PhotoManager({ items, onChange, error, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");

  function addFiles(files: FileList) {
    const problems: string[] = [];
    const added: PhotoItem[] = [];
    for (const file of Array.from(files)) {
      const problem = checkSelectedFile(file);
      if (problem) problems.push(problem);
      else if (items.length + added.length >= MAX_PHOTOS_PER_VEHICLE) {
        problems.push(`En fazla ${MAX_PHOTOS_PER_VEHICLE} fotoğraf eklenebilir.`);
        break;
      } else added.push(fromFile(file));
    }
    setNotice(problems.join(" "));
    if (added.length) onChange([...items, ...added]);
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function remove(index: number) {
    if (items[index].file) URL.revokeObjectURL(items[index].src);
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        className={`dropzone${dragging ? " dragging" : ""}`}
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
      >
        <strong>Fotoğraf seçmek için tıklayın veya sürükleyip bırakın</strong>
        <p>En fazla {MAX_PHOTOS_PER_VEHICLE} fotoğraf · İlk fotoğraf kapak fotoğrafıdır · Fotoğraflar otomatik küçültülür</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label="Fotoğraf seç"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {(notice || error) && (
        <p className="field-error" role="alert" style={{ marginTop: 8 }}>
          {notice || error}
        </p>
      )}

      {items.length > 0 && (
        <div className="photo-grid">
          {items.map((item, i) => (
            <div className="photo-item" key={item.key}>
              <div className="photo-item-media">
                <img src={item.src} alt={`Fotoğraf ${i + 1}`} />
                {i === 0 && <span className="photo-tag">Kapak</span>}
                {!item.id && <span className="photo-tag new">Yeni</span>}
              </div>
              <div className="photo-item-actions">
                <button type="button" className="icon-btn" onClick={() => move(i, i - 1)} disabled={disabled || i === 0} aria-label="Sola taşı">←</button>
                <button type="button" className="icon-btn" onClick={() => move(i, i + 1)} disabled={disabled || i === items.length - 1} aria-label="Sağa taşı">→</button>
                {i !== 0 && (
                  <button type="button" className="icon-btn" onClick={() => move(i, 0)} disabled={disabled}>Kapak yap</button>
                )}
                <button type="button" className="icon-btn danger" onClick={() => remove(i)} disabled={disabled}>Kaldır</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
