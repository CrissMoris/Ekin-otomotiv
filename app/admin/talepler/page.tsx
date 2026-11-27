import Link from "next/link";
import { Suspense } from "react";
import { AdminGuard, AdminLoading } from "@/components/admin/AdminGuard";
import { INQUIRY_TYPE_LABELS } from "@/lib/constants";
import { sheetsConfig } from "@/lib/config";
import { dataBackend, listInquiries } from "@/lib/store";

async function InquiryList() {
  const inquiries = await listInquiries();
  return (
    <>
      <div className="admin-toolbar">
        <h1>Talepler</h1>
      </div>
      {sheetsConfig() && dataBackend().kind === "sheets" && (
        <p className="alert alert-info">
          Talepler Google Sheets&apos;teki “Talepler” sekmesine de kaydedilir. Takip için oradaki “Durum” sütununu
          kullanabilirsiniz.
        </p>
      )}
      {inquiries.length === 0 ? (
        <div className="empty-state">Henüz talep yok. Sitedeki bir araç sayfasından deneme talebi gönderebilirsiniz.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Talep</th>
                <th>Kişi</th>
                <th>Araç</th>
                <th>Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i) => (
                <tr key={i.id}>
                  <td data-label="Tarih" style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                    {i.date}
                  </td>
                  <td data-label="Talep">
                    <strong>{INQUIRY_TYPE_LABELS[i.type]}</strong>
                    {i.formLang && (
                      <span className="badge badge-muted" style={{ marginInlineStart: 6 }}>
                        {i.formLang === "ar" ? "Arapça form" : "İngilizce form"}
                      </span>
                    )}
                    <div className="muted" style={{ fontSize: "0.8rem" }}>{i.id}</div>
                  </td>
                  <td data-label="Kişi">
                    {i.fullName}
                    <div style={{ fontSize: "0.85rem" }}>
                      <a href={`tel:${i.phone.replace(/\s/g, "")}`}>{i.phone}</a>
                      {i.email && (
                        <>
                          {" · "}
                          <a href={`mailto:${i.email}`}>{i.email}</a>
                        </>
                      )}
                    </div>
                  </td>
                  <td data-label="Araç">
                    {i.vehicleId ? (
                      <>
                        <Link href={`/admin/araclar/${i.vehicleId}`}>{i.vehicleSummary ?? i.vehicleId}</Link>
                        <div className="muted" style={{ fontSize: "0.8rem" }}>{i.vehicleId}</div>
                      </>
                    ) : (
                      <span className="muted">Genel talep</span>
                    )}
                  </td>
                  <td data-label="Mesaj" style={{ maxWidth: 320, whiteSpace: "pre-line" }}>
                    {i.message ?? <span className="muted">—</span>}
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

export default function InquiriesPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGuard>
        <InquiryList />
      </AdminGuard>
    </Suspense>
  );
}
