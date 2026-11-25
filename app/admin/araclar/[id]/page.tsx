import Link from "next/link";
import { Suspense } from "react";
import { AdminGuard, AdminLoading } from "@/components/admin/AdminGuard";
import { VehicleActions } from "@/components/admin/VehicleActions";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { STATUS_LABELS } from "@/lib/constants";
import { formatStamp } from "@/lib/format";
import { getVehicle } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

async function EditVehicle({ params }: Props) {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) {
    return (
      <div className="empty-state">
        <p>Araç bulunamadı. Silinmiş olabilir.</p>
        <Link href="/admin" className="btn btn-outline">Araç listesine dön</Link>
      </div>
    );
  }
  return (
    <>
      <div className="admin-crumb"><Link href="/admin">Araçlar</Link> / {vehicle.make} {vehicle.model}</div>
      <div className="admin-toolbar">
        <div>
          <h1>Aracı Düzenle</h1>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {vehicle.id} · {STATUS_LABELS[vehicle.status]} · Son güncelleme: {formatStamp(vehicle.updatedAt)}
            {vehicle.status === "yayinda" && (
              <> · <Link href={`/araclar/${vehicle.id}`} target="_blank">Sitede görüntüle ↗</Link></>
            )}
          </span>
        </div>
        <VehicleActions id={vehicle.id} title={`${vehicle.make} ${vehicle.model}`} status={vehicle.status} showEdit={false} />
      </div>
      {/* key: kayıt değiştiğinde form güncel verilerle yeniden başlar */}
      <VehicleForm key={vehicle.updatedAt} vehicle={vehicle} />
    </>
  );
}

export default function EditVehiclePage({ params }: Props) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGuard>
        <EditVehicle params={params} />
      </AdminGuard>
    </Suspense>
  );
}
