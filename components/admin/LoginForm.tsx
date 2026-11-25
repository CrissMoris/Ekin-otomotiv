"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "@/lib/client-utils";

/** Yönetici girişi: yalnızca rakamlardan oluşan PIN. */
export function LoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!pin) {
      setError("Lütfen PIN'i giriniz.");
      return;
    }
    setSending(true);
    setError("");
    const res = await callApi("/api/admin/giris", { method: "POST", json: { pin } });
    setSending(false);
    if (res.ok) {
      setPin("");
      router.refresh();
      return;
    }
    setPin("");
    setError(res.networkError ? NETWORK_ERROR_MESSAGE : (res.data?.message ?? GENERIC_ERROR_MESSAGE));
  }

  return (
    <div className="panel login-card">
      <h1 style={{ fontSize: "1.4rem" }}>Yönetici Girişi</h1>
      <p className="muted">Yönetim paneline erişmek için PIN&apos;i giriniz.</p>
      <form onSubmit={onSubmit} className="form-grid" noValidate>
        <div className={`field${error ? " has-error" : ""}`}>
          <label htmlFor="admin-pin">PIN</label>
          <input
            id="admin-pin"
            name="pin"
            type="password"
            className="input pin-input"
            inputMode="numeric"
            autoComplete="current-password"
            placeholder="PIN'i giriniz"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 12))}
            autoFocus
          />
          {error && (
            <span className="field-error" role="alert">
              {error}
            </span>
          )}
        </div>
        <button type="submit" className="btn btn-red btn-block" disabled={sending}>
          {sending ? "Kontrol ediliyor…" : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
