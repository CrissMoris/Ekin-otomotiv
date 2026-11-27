import { vehicleMetadata, VehicleDetailPage, type DetailParams } from "@/components/pages/VehicleDetailPage";

export function generateMetadata({ params }: { params: DetailParams }) {
  return vehicleMetadata("en", params);
}

export default function Page({ params }: { params: DetailParams }) {
  return <VehicleDetailPage params={params} lang="en" />;
}
