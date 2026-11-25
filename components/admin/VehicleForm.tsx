"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "@/lib/client-utils";
import { FUEL_LABELS, FUEL_TYPES, STATUS_LABELS, TRANSMISSIONS, TRANSMISSION_LABELS } from "@/lib/constants";
import { formatNumber, formatPrice, parseInteger } from "@/lib/format";
import { uploadPhoto } from "@/lib/images/client";
import type { FuelType, Transmission, Vehicle, VehicleStatus } from "@/lib/types";
import { validateVehicle, withoutError, type FieldErrors } from "@/lib/validation";
import { PhotoManager, type PhotoItem } from "./PhotoManager";

const COMMON_MAKES = [
  "Alfa Romeo", "Audi", "BMW", "Chery", "Citroën", "Cupra", "Dacia", "Fiat", "Ford", "Honda", "Hyundai", "Jeep",
  "Kia", "Land Rover", "Mazda", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot",
  "Renault", "Seat", "Skoda", "Suzuki", "Tesla", "Togg", "Toyota", "Volkswagen", "Volvo",
];

interface FormValues {
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuel: FuelType | "";
  transmission: Transmission | "";
  price: string;
  description: string;
  sahibindenUrl: string;
  status: VehicleStatus;
}

function initialValues(v?: Vehicle): FormValues {
  return {
    make: v?.make ?? "",
    model: v?.model ?? "",
    year: v ? String(v.year) : "",
    mileage: v ? formatNumber(v.mileage) : "",
    fuel: v?.fuel ?? "",
    transmission: v?.transmission ?? "",
    price: v ? formatNumber(v.price) : "",
    description: v?.description ?? "",
    sahibindenUrl: v?.sahibindenUrl ?? "",
    status: v?.status ?? "taslak",
  };
}

const initialPhotos = (v?: Vehicle): PhotoItem[] =>
  v?.photos.map((p) => ({ key: p.id, id: p.id, src: p.thumb })) ?? [];

/** Yeni araç ekleme ve mevcut aracı düzenleme formu. */
export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const isEdit = Boolean(vehicle);
  const [values, setValues] = useState<FormValues>(() => initialValues(vehicle));
  const [photos, setPhotos] = useState<PhotoItem[]>(() => initialPhotos(vehicle));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((e) => withoutError(e, field));
  };

  function resetForm() {
    photos.forEach((p) => p.file && URL.revokeObjectURL(p.src));
    setValues(initialValues());
    setPhotos([]);
    setErrors({});
    setProgress("");
    setFormError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError("");

    // 1) Önce alanları kontrol et (fotoğraf kimlikleri henüz yok; sayıyı kontrol etmek için geçici anahtarlar)
    const check = validateVehicle({ ...values, photoIds: photos.map((p) => p.key) });
    if (!check.ok) {
      setErrors(check.errors);
      setFormError("Lütfen işaretli alanları kontrol edin.");
      const first = Object.keys(check.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setSaving(true);

    // 2) Yeni seçilen fotoğrafları sırayla yükle
    const items = [...photos];
    const newCount = items.filter((p) => !p.id).length;
    let done = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id || !item.file) continue;
      done += 1;
      setProgress(`Fotoğraflar yükleniyor (${done}/${newCount})…`);
      const result = await uploadPhoto(item.file);
      if (!result.ok) {
        setPhotos([...items]); // başarıyla yüklenenler tekrar yüklenmesin
        setSaving(false);
        setProgress("");
        setFormError(`Fotoğraf yüklenemedi: ${result.message}`);
        return;
      }
      items[i] = { ...item, id: result.id }; // önizleme aynı kalır, artık yüklenmiş sayılır
    }
    setPhotos([...items]);

    // 3) Araç kaydını oluştur / güncelle
    setProgress("Araç bilgileri kaydediliyor…");
    const payload = {
      ...values,
      photoIds: items.map((p) => p.id ?? ""),
      expectedUpdatedAt: vehicle?.updatedAt,
    };
    const res = await callApi<{ vehicle: Vehicle }>(isEdit ? `/api/admin/araclar/${vehicle!.id}` : "/api/admin/araclar", {
      method: isEdit ? "PUT" : "POST",
      json: payload,
    });
    setSaving(false);
    setProgress("");

    if (!res.ok || !res.data?.vehicle) {
      setFormError(res.networkError ? NETWORK_ERROR_MESSAGE : (res.data?.message ?? GENERIC_ERROR_MESSAGE));
      if (res.data?.fieldErrors) setErrors(res.data.fieldErrors);
      return;
    }

    const saved = res.data.vehicle;
    if (!isEdit) resetForm(); // sayfa arka planda saklandığı için bir sonraki ekleme boş formla başlasın
    router.push(`/admin?durum=${isEdit ? "guncellendi" : "eklendi"}&arac=${encodeURIComponent(saved.id)}`);
    router.refresh();
  }

  const fieldClass = (name: string) => `field${errors[name] ? " has-error" : ""}`;
  const err = (name: string) => errors[name] && <span className="field-error">{errors[name]}</span>;
  const priceValue = parseInteger(values.price);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="admin-form">
      <section className="form-section">
        <h2>Araç bilgileri</h2>
        <div className="form-grid two">
          <div className={fieldClass("make")}>
            <label htmlFor="v-make">Marka</label>
            <input id="v-make" name="make" className="input" list="marka-listesi" value={values.make} onChange={set("make")} maxLength={40} />
            <datalist id="marka-listesi">
              {COMMON_MAKES.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            {err("make")}
          </div>
          <div className={fieldClass("model")}>
            <label htmlFor="v-model">Model</label>
            <input id="v-model" name="model" className="input" placeholder="örn. Corolla 1.5 Dream" value={values.model} onChange={set("model")} maxLength={60} />
            {err("model")}
          </div>
          <div className={fieldClass("year")}>
            <label htmlFor="v-year">Model yılı</label>
            <input id="v-year" name="year" className="input" inputMode="numeric" placeholder="örn. 2021" value={values.year} onChange={set("year")} maxLength={4} />
            {err("year")}
          </div>
          <div className={fieldClass("mileage")}>
            <label htmlFor="v-mileage">Kilometre</label>
            <input id="v-mileage" name="mileage" className="input" inputMode="numeric" placeholder="örn. 45.000" value={values.mileage} onChange={set("mileage")} maxLength={12} />
            {err("mileage")}
          </div>
          <div className={fieldClass("fuel")}>
            <label htmlFor="v-fuel">Yakıt türü</label>
            <select id="v-fuel" name="fuel" className="select" value={values.fuel} onChange={set("fuel")}>
              <option value="">Seçin</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {FUEL_LABELS[f]}
                </option>
              ))}
            </select>
            {err("fuel")}
          </div>
          <div className={fieldClass("transmission")}>
            <label htmlFor="v-transmission">Vites</label>
            <select id="v-transmission" name="transmission" className="select" value={values.transmission} onChange={set("transmission")}>
              <option value="">Seçin</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {TRANSMISSION_LABELS[t]}
                </option>
              ))}
            </select>
            {err("transmission")}
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2>Fiyat ve açıklama</h2>
        <div className="form-grid">
          <div className={fieldClass("price")} style={{ maxWidth: 320 }}>
            <label htmlFor="v-price">Fiyat (₺)</label>
            <input id="v-price" name="price" className="input" inputMode="numeric" placeholder="örn. 1.250.000" value={values.price} onChange={set("price")} maxLength={15} />
            {priceValue !== null && !errors.price && <span className="hint">Sitede görünecek: {formatPrice(priceValue)}</span>}
            {err("price")}
          </div>
          <div className={fieldClass("description")}>
            <label htmlFor="v-description">
              Açıklama <span className="optional">(isteğe bağlı)</span>
            </label>
            <textarea
              id="v-description"
              name="description"
              className="textarea"
              rows={6}
              placeholder="Aracın durumu, bakım geçmişi, boya/değişen bilgisi, donanımlar…"
              value={values.description}
              onChange={set("description")}
              maxLength={3000}
            />
            <span className="hint">{values.description.length} / 3000</span>
            {err("description")}
          </div>
          <div className={fieldClass("sahibindenUrl")}>
            <label htmlFor="v-sahibinden">
              sahibinden.com ilan linki <span className="optional">(isteğe bağlı)</span>
            </label>
            <input
              id="v-sahibinden"
              name="sahibindenUrl"
              className="input"
              type="url"
              placeholder="https://www.sahibinden.com/ilan/..."
              value={values.sahibindenUrl}
              onChange={set("sahibindenUrl")}
              maxLength={300}
            />
            <span className="hint">Doldurulursa araç sayfasında “sahibinden.com&apos;da görüntüle” düğmesi çıkar.</span>
            {err("sahibindenUrl")}
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2>Fotoğraflar</h2>
        <PhotoManager
          items={photos}
          onChange={(next) => {
            setPhotos(next);
            if (errors.photos) setErrors((e) => withoutError(e, "photos"));
          }}
          error={errors.photos}
          disabled={saving}
        />
        <p className="hint" style={{ marginTop: 12, marginBottom: 0 }}>
          Yeni fotoğraflar “Kaydet” düğmesine basıldığında yüklenir.
        </p>
      </section>

      <section className="form-section">
        <h2>Yayın durumu</h2>
        <div className="radio-group" role="radiogroup" aria-label="Yayın durumu">
          {(["yayinda", "taslak"] as const).map((s) => (
            <label key={s} className="radio-pill">
              <input type="radio" name="status" value={s} checked={values.status === s} onChange={set("status")} />
              <span>{s === "yayinda" ? "Yayında (sitede görünür)" : `${STATUS_LABELS[s]} (sitede görünmez)`}</span>
            </label>
          ))}
        </div>
        {err("status")}
      </section>

      <div className="form-actions">
        {formError && !saving && (
          <div className="alert alert-error" role="alert" style={{ marginRight: "auto", padding: "8px 12px" }}>
            {formError}
          </div>
        )}
        {progress && (
          <span className="muted" style={{ marginRight: "auto" }} role="status">
            {progress}
          </span>
        )}
        <Link href="/admin" className="btn btn-outline">
          Vazgeç
        </Link>
        <button type="submit" className="btn btn-red" disabled={saving}>
          {saving ? "Kaydediliyor…" : isEdit ? "Değişiklikleri Kaydet" : "Aracı Kaydet"}
        </button>
      </div>
    </form>
  );
}
