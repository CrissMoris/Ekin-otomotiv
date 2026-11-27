"use client";

/** Yönetim panelinde veri okunamazsa (ör. veritabanı ayarı hatalıysa) gösterilir. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.3rem" }}>Veriler okunamadı</h1>
      <p className="muted">
        Veritabanı bağlantısında bir sorun var. Ayrıntılı hata mesajı sunucu kayıtlarında (terminal / Vercel
        günlükleri) yer alır. En sık nedenler: MONGODB_URI hatalı, Atlas&apos;ta Network Access listesinde 0.0.0.0/0
        yok ya da küme duraklatılmış.
      </p>
      {error.digest && <p className="hint">Hata kodu: {error.digest}</p>}
      <button type="button" className="btn btn-red" onClick={reset}>Tekrar dene</button>
    </div>
  );
}
