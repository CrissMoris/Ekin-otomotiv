"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { InquiryForm } from "./InquiryForm";

/** Araç detayındaki "Teklif ve Takas Talebi Oluştur" butonu ve açılan form. */
export function InquiryPanel({ vehicleId, vehicleLabel, lang = "tr" }: { vehicleId: string; vehicleLabel: string; lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const d = t(lang);

  if (!open) {
    return (
      <button type="button" className="btn btn-red btn-block" onClick={() => setOpen(true)}>
        {d.detail.ctaInquiry}
      </button>
    );
  }

  return (
    <div id="talep-formu">
      <h3>{d.inquiry.panelTitle}</h3>
      <InquiryForm
        vehicleId={vehicleId}
        vehicleLabel={vehicleLabel}
        types={["satin-alma", "takas", "bilgi"]}
        messagePlaceholder={d.inquiry.panelPlaceholder}
        lang={lang}
      />
      <button type="button" className="link-button" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>
        {d.inquiry.panelClose}
      </button>
    </div>
  );
}
