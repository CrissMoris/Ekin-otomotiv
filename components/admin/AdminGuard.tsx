import { isAdminSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

/**
 * Her yönetici sayfasının içeriğini sarar. Oturum yoksa içerik hiç oluşturulmaz, giriş formu gösterilir.
 * (Asıl koruma API uçlarındadır; bu bileşen sayfaların veri göstermesini engeller.)
 */
export async function AdminGuard({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) {
    return <LoginForm />;
  }
  return <>{children}</>;
}

export function AdminLoading() {
  return <p className="muted">Yükleniyor…</p>;
}
