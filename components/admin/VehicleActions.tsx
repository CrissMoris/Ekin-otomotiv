"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "@/lib/client-utils";
import type { VehicleStatus } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";

const errorText = (res: Awaited<ReturnType<typeof callApi>>) =>
  res.networkError ? NETWORK_ERROR_MESSAGE : (res.data?.message ?? GENERIC_ERROR_MESSAGE);

interface Props {
  id: string;
  title: string;
  status: VehicleStatus;
  /** Liste satırında düzenle bağlantısı da gösterilir. */
  showEdit?: boolean;
}

/** Yayına al / yayından kaldır ve silme (onaylı) işlemleri. */
export function VehicleActions({ id, title, status, showEdit = true }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function toggleStatus() {
    setBusy(true);
    setError("");
    const next: VehicleStatus = status === "yayinda" ? "taslak" : "yayinda";
    const res = await callApi(`/api/admin/araclar/${id}`, { method: "PATCH", json: { status: next } });
    setBusy(false);
    if (!res.ok) {
      setError(errorText(res));
      return;
    }
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    setDeleteError("");
    const res = await callApi(`/api/admin/araclar/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      setDeleteError(errorText(res));
      return;
    }
    setConfirmOpen(false);
    router.push(`/admin?durum=silindi&arac=${encodeURIComponent(id)}`);
    router.refresh();
  }

  return (
    <div>
      <div className="row-actions">
        {showEdit && (
          <Link href={`/admin/araclar/${id}`} className="btn btn-outline btn-sm">
            Düzenle
          </Link>
        )}
        <button type="button" className="btn btn-outline btn-sm" onClick={toggleStatus} disabled={busy}>
          {status === "yayinda" ? "Yayından Kaldır" : "Yayına Al"}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ color: "var(--danger)" }}
          onClick={() => {
            setDeleteError("");
            setConfirmOpen(true);
          }}
          disabled={busy}
        >
          Sil
        </button>
      </div>
      {error && (
        <p className="field-error" role="alert" style={{ margin: "6px 0 0" }}>
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Araç silinsin mi?"
        confirmLabel="Evet, kalıcı olarak sil"
        busy={busy}
        error={deleteError}
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      >
        <p>
          <strong>{title}</strong> ({id}) ilanı ve fotoğrafları silinecek. Bu işlem geri alınamaz.
        </p>
        <p style={{ marginBottom: 0 }}>Aracı yalnızca sitede gizlemek istiyorsanız “Yayından Kaldır” seçeneğini kullanın.</p>
      </ConfirmDialog>
    </div>
  );
}
