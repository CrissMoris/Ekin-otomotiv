import { SiteShell } from "@/components/site/SiteShell";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell lang="tr">{children}</SiteShell>;
}
