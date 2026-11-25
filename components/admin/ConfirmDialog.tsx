"use client";

import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Silme gibi geri alınamaz işlemler için onay penceresi. */
export function ConfirmDialog({ open, title, children, confirmLabel, busy, error, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 style={{ fontSize: "1.15rem" }}>{title}</h2>
      <div className="muted">{children}</div>
      {error && (
        <p className="alert alert-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
          Vazgeç
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? "İşleniyor…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
