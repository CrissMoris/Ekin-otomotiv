"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "@/lib/client-utils";

interface Result {
  vehiclesAdded: number;
  vehiclesSkipped: number;
  inquiriesAdded: number;
  inquiriesSkipped: number;
  issues: string[];
}

/** Google Sheets'teki kayıtları MongoDB'ye kopyalar. Sheets değişmez; tekrar çalıştırmak güvenlidir. */
export function MigrationPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setBusy(true);
    setError("");
    const res = await callApi<{ result: Result; message?: string }>("/api/admin/aktarim", { method: "POST" });
    setBusy(false);
    if (!res.ok || !res.data?.result) {
      setError(res.networkError ? NETWORK_ERROR_MESSAGE : (res.data?.message ?? GENERIC_ERROR_MESSAGE));
      return;
    }
    setResult(res.data.result);
    router.refresh();
  }

  return (
    <section className="panel migration-panel">
      <h2>Google Sheets verisini MongoDB&apos;ye aktar</h2>
      <p className="muted">
        Sheets&apos;teki araçlar ve talepler MongoDB&apos;ye kopyalanır. Sheets&apos;e dokunulmaz; MongoDB&apos;de zaten olan kayıtlar
        atlanır, bu yüzden tekrar çalıştırmak güvenlidir.
      </p>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {result && (
        <div className="alert alert-success" role="status">
          <strong>Aktarım tamamlandı.</strong> Araç: {result.vehiclesAdded} eklendi, {result.vehiclesSkipped} zaten vardı · Talep:{" "}
          {result.inquiriesAdded} eklendi, {result.inquiriesSkipped} zaten vardı.
          {result.issues.length > 0 && (
            <>
              <br />
              Sheets&apos;te okunamayan {result.issues.length} satır aktarılmadı: {result.issues.join(" · ")}
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-dark" onClick={run} disabled={busy}>
        {busy ? "Aktarılıyor…" : "Verileri aktar"}
      </button>
    </section>
  );
}
