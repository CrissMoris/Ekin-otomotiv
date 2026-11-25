"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONTACT, INQUIRY_TYPES, INQUIRY_TYPE_LABELS } from "@/lib/constants";
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE, randomKey } from "@/lib/client-utils";
import type { InquiryType } from "@/lib/types";
import { validateInquiry, withoutError, type FieldErrors } from "@/lib/validation";

interface Props {
  vehicleId?: string;
  vehicleLabel?: string;
  defaultType?: InquiryType;
  /** Formda gösterilecek talep türleri (sayfaya göre değişir). */
  types?: InquiryType[];
  messagePlaceholder?: string;
}

const EMPTY = { fullName: "", phone: "", email: "", message: "" };

/** Telefon alanına yalnızca rakam girilir (+90 ile otomatik doldurulursa 0'a çevrilir). */
function onlyDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length > 11) digits = "0" + digits.slice(2);
  return digits.slice(0, 11);
}

export function InquiryForm({ vehicleId, vehicleLabel, defaultType = "satin-alma", types = INQUIRY_TYPES, messagePlaceholder }: Props) {
  const [values, setValues] = useState({ ...EMPTY, type: defaultType as InquiryType });
  const [website, setWebsite] = useState(""); // bot tuzağı: gerçek kullanıcılar görmez
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [result, setResult] = useState<{ id: string } | null>(null);
  const startedAt = useRef(0);
  const submissionKey = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const update = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === "phone" ? onlyDigits(e.target.value) : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => withoutError(e, field));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    const check = validateInquiry({ ...values, vehicleId });
    if (!check.ok) {
      setErrors(check.errors);
      setStatus("idle");
      const firstField = Object.keys(check.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus("sending");
    setServerMessage("");
    submissionKey.current ??= randomKey();

    const res = await callApi<{ inquiryId: string }>("/api/talep", {
      method: "POST",
      json: { ...values, vehicleId: vehicleId ?? null, website, startedAt: startedAt.current, submissionKey: submissionKey.current },
    });

    if (res.ok && res.data) {
      setResult({ id: res.data.inquiryId });
      setStatus("success");
      setValues({ ...EMPTY, type: defaultType });
      submissionKey.current = null;
      return;
    }

    setStatus("error");
    if (res.networkError) setServerMessage(NETWORK_ERROR_MESSAGE);
    else setServerMessage(res.data?.message ?? GENERIC_ERROR_MESSAGE);
    if (res.data?.fieldErrors) setErrors(res.data.fieldErrors);
  }

  if (status === "success" && result) {
    return (
      <div className="alert alert-success" role="status">
        <p>
          <strong>Talebiniz alındı.</strong> Ekibimiz en kısa sürede sizinle iletişime geçecek.
        </p>
        <p>Talep numaranız: <strong>{result.id}</strong></p>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setStatus("idle");
            setResult(null);
            startedAt.current = Date.now();
          }}
        >
          Yeni bir talep oluştur
        </button>
      </div>
    );
  }

  const fieldClass = (name: string) => `field${errors[name] ? " has-error" : ""}`;
  const idp = vehicleId ? `t-${vehicleId}` : "t-genel";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="form-grid" aria-label="Talep formu">
      {vehicleLabel && (
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          İlgilendiğiniz araç: <strong>{vehicleLabel}</strong> <span className="listing-code">({vehicleId})</span>
        </p>
      )}

      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field-label" style={{ marginBottom: 6 }}>Talep türü</legend>
        <div className="radio-group">
          {types.map((t) => (
            <label key={t} className="radio-pill">
              <input
                type="radio"
                name="type"
                value={t}
                checked={values.type === t}
                onChange={() => setValues((v) => ({ ...v, type: t }))}
              />
              <span>{INQUIRY_TYPE_LABELS[t]}</span>
            </label>
          ))}
        </div>
        {errors.type && <span className="field-error">{errors.type}</span>}
      </fieldset>

      <div className={fieldClass("fullName")}>
        <label htmlFor={`${idp}-ad`}>Ad soyad</label>
        <input
          id={`${idp}-ad`}
          name="fullName"
          className="input"
          autoComplete="name"
          value={values.fullName}
          onChange={update("fullName")}
          aria-invalid={Boolean(errors.fullName)}
          maxLength={80}
        />
        {errors.fullName && <span className="field-error">{errors.fullName}</span>}
      </div>

      <div className={fieldClass("phone")}>
        <label htmlFor={`${idp}-tel`}>Telefon</label>
        <input
          id={`${idp}-tel`}
          name="phone"
          type="tel"
          className="input"
          autoComplete="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="05XXXXXXXXX"
          value={values.phone}
          onChange={update("phone")}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      <div className={fieldClass("email")}>
        <label htmlFor={`${idp}-eposta`}>
          E-posta <span className="optional">(isteğe bağlı)</span>
        </label>
        <input
          id={`${idp}-eposta`}
          name="email"
          type="email"
          className="input"
          autoComplete="email"
          value={values.email}
          onChange={update("email")}
          aria-invalid={Boolean(errors.email)}
          maxLength={120}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className={fieldClass("message")}>
        <label htmlFor={`${idp}-mesaj`}>
          Mesajınız <span className="optional">(isteğe bağlı)</span>
        </label>
        <textarea
          id={`${idp}-mesaj`}
          name="message"
          className="textarea"
          placeholder={messagePlaceholder ?? "Sormak istediğiniz bir şey varsa yazabilirsiniz."}
          value={values.message}
          onChange={update("message")}
          maxLength={1000}
        />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </div>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${idp}-web`}>Web siteniz</label>
        <input
          id={`${idp}-web`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "error" && serverMessage && (
        <div className="alert alert-error" role="alert">
          <p>{serverMessage}</p>
          <p style={{ fontSize: "0.85rem" }}>
            Sorun devam ederse bizi arayabilirsiniz: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-red btn-block" disabled={status === "sending"}>
        {status === "sending" ? "Gönderiliyor…" : "Talebi Gönder"}
      </button>

      <p className="privacy-note">
        Bilgileriniz yalnızca talebinize dönüş yapmak amacıyla kullanılır. Ayrıntılar için{" "}
        <Link href="/kvkk">KVKK Aydınlatma Metni</Link>&apos;ni inceleyebilirsiniz.
      </p>
    </form>
  );
}
