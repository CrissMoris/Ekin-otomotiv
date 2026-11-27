import { notFound } from "next/navigation";

/** /en altındaki bilinmeyen adresler İngilizce "sayfa bulunamadı" ekranını gösterir. */
export default function Page() {
  notFound();
}
