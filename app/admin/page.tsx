/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Suspense } from "react";
import { AdminGuard, AdminLoading } from "@/components/admin/AdminGuard";
import { VehicleActions } from "@/components/admin/VehicleActions";
import { sheetsConfig } from "@/lib/config";
import { FUEL_LABELS, STATUS_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import type { SearchParams } from "@/lib/filters";
import { formatKm, formatPrice, formatStamp } from "@/lib/format";
import { getAllVehicles, listInquiries } from "@/lib/store";

const FLASH: Record<string, string> = {
  eklendi: "Araç eklendi.",
  guncellendi: "Değişiklikler kaydedildi.",
  silindi: "Araç silindi.",
};

async function Dashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const [{ vehicles, issues }, inquiries] = await Promise.all([getAllVehicles(), listInquiries()]);
  const published = vehicles.filter((v) => v.status === "yayinda").length;
  const flash = FLASH[String(sp.durum ?? "")];
  const sheetId = sheetsConfig()?.sheetId;

  return (
    <>
      <div className="admin-toolbar">
        <h1>Araçlar</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sheetId && (
            <a className="btn btn-outline" href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noopener noreferrer">
              Google Sheets&apos;i aç ↗
            </a>
          )}
          <Link href="/admin/araclar/yeni" className="btn btn-red">+ Yeni Araç Ekle</Link>
        </div>
      </div>

      {flash && (
        <div className="alert alert-success" role="status" style={{ marginBottom: 16 }}>
          {flash} {typeof sp.arac === "string" && <span>({sp.arac})</span>}
        </div>
      )}

      {issues.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <p><strong>Sheets&apos;teki bazı satırlar okunamadı ve sitede gösterilmiyor:</strong></p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {issues.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      )}

      <div className="stat-row">
        <div className="stat-card"><strong>{vehicles.length}</strong><span>Toplam araç</span></div>
        <div className="stat-card"><strong>{published}</strong><span>Yayında</span></div>
        <div className="stat-card">
          <strong>{inquiries.length}</strong>
          <span>Talep · <Link href="/admin/talepler">Görüntüle</Link></span>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>Henüz araç eklenmemiş.</p>
          <Link href="/admin/araclar/yeni" className="btn btn-red">İlk aracı ekle</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Fotoğraf</th>
                <th>Araç</th>
                <th>Fiyat</th>
                <th>Durum</th>
                <th>Güncelleme</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.photos[0] ? <img className="table-thumb" src={v.photos[0].thumb} alt="" /> : <div className="table-thumb" />}
                  </td>
                  <td>
                    <Link href={`/admin/araclar/${v.id}`} style={{ fontWeight: 700 }}>{v.make} {v.model}</Link>
                    <div className="muted" style={{ fontSize: "0.82rem" }}>
                      {v.id} · {v.year} · {formatKm(v.mileage)} · {FUEL_LABELS[v.fuel]} · {TRANSMISSION_LABELS[v.transmission]}
                    </div>
                  </td>
                  <td data-label="Fiyat" style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{formatPrice(v.price)}</td>
                  <td data-label="Durum">
                    <span className={`badge ${v.status === "yayinda" ? "badge-success" : "badge-muted"}`}>{STATUS_LABELS[v.status]}</span>
                  </td>
                  <td data-label="Güncelleme" style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>{formatStamp(v.updatedAt)}</td>
                  <td>
                    <VehicleActions id={v.id} title={`${v.make} ${v.model}`} status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminHomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGuard>
        <Dashboard searchParams={searchParams} />
      </AdminGuard>
    </Suspense>
  );
}
