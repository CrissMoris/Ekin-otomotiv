import "server-only";
import { deleteImage, imageUrl, isCloudinaryId } from "./cloudinary";
import type { Photo } from "./types";

/** Saklanan fotoğraf değerinden (Cloudinary kimliği veya https adresi) gösterim adreslerini üretir. */
export function toPhoto(id: string): Photo | null {
  if (/^https:\/\/\S+$/.test(id)) return { id, url: id, thumb: id };
  const large = imageUrl(id, "large");
  const thumb = imageUrl(id, "thumb");
  return large && thumb ? { id, url: large, thumb } : null;
}

export function isAllowedPhotoId(id: string): boolean {
  if (/^https:\/\/\S+$/.test(id)) return true;
  return isCloudinaryId(id);
}

/** Kaydı silinen ya da değiştirilen araçtan kalan fotoğrafları Cloudinary'den kaldırır. */
export async function removePhotos(ids: string[]) {
  for (const id of ids) {
    try {
      if (isCloudinaryId(id)) await deleteImage(id);
    } catch (error) {
      console.error("Fotoğraf silinemedi (kayıt etkilenmedi):", id, error);
    }
  }
}
