"use client";

import { SiteErrorView } from "@/components/pages/SiteErrorView";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return <SiteErrorView lang="en" reset={reset} />;
}
