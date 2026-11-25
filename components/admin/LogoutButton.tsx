"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi } from "@/lib/client-utils";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await callApi("/api/admin/cikis", { method: "POST" });
        setBusy(false);
        router.push("/admin");
        router.refresh();
      }}
    >
      Çıkış Yap
    </button>
  );
}
