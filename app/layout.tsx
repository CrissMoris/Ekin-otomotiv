import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/config";
import "./globals.css";

const description =
  "Ekin Otomotiv: ikinci el araç satışı, hasarlı ve hasarsız araç alımı, takas. Araçlarımızı inceleyin, teklifinizi iletin.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ekin Otomotiv",
    images: [{ url: "/marka/og.png", width: 1200, height: 630, alt: "Ekin Otomotiv" }],
  },
  title: {
    default: "Ekin Otomotiv | İkinci El Araç Alım, Satım ve Takas",
    template: "%s | Ekin Otomotiv",
  },
  description,
};

export const viewport: Viewport = { themeColor: "#111213" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
