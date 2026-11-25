import Link from "next/link";
import { Suspense } from "react";
import { AdminGuard, AdminLoading } from "@/components/admin/AdminGuard";
import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NewVehiclePage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGuard>
        <div className="admin-crumb"><Link href="/admin">Araçlar</Link> / Yeni araç</div>
        <div className="admin-toolbar"><h1>Yeni Araç Ekle</h1></div>
        <VehicleForm />
      </AdminGuard>
    </Suspense>
  );
}
