"use client";

import { useState } from "react";
import { InquiryForm } from "./InquiryForm";

/** Araç detayındaki "Teklif ve Takas Talebi Oluştur" butonu ve açılan form. */
export function InquiryPanel({ vehicleId, vehicleLabel }: { vehicleId: string; vehicleLabel: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn btn-red btn-block" onClick={() => setOpen(true)}>
        Teklif ve Takas Talebi Oluştur
      </button>
    );
  }

  return (
    <div id="talep-formu">
      <h3>Teklif ve Takas Talebi</h3>
      <InquiryForm vehicleId={vehicleId} vehicleLabel={vehicleLabel} types={["satin-alma", "takas", "bilgi"]} messagePlaceholder="Teklifinizi veya sorularınızı yazabilirsiniz." />
      <button type="button" className="link-button" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>
        Formu kapat
      </button>
    </div>
  );
}
