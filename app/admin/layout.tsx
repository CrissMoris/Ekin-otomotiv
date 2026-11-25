/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { isAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

async function AdminNav() {
  if (!(await isAdminSession())) return null;
  return (
    <nav className="admin-nav" aria-label="Yönetim menüsü">
      <Link href="/admin">Araçlar</Link>
      <Link href="/admin/araclar/yeni">Yeni Araç</Link>
      <Link href="/admin/talepler">Talepler</Link>
      <Link href="/" target="_blank">Siteyi Görüntüle ↗</Link>
      <LogoutButton />
    </nav>
  );
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="container">
          <div className="admin-brand">
            <Link href="/" title="Siteye git">
              <img src="/marka/logo-beyaz.png" alt="Ekin Otomotiv ana sayfa" width={726} height={444} />
            </Link>
            <Link href="/admin">Yönetim Paneli</Link>
          </div>
          <Suspense fallback={null}>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main className="admin-main">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
