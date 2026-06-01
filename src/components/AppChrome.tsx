"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import { isLandingPath } from "@/lib/landing-routes";

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const minimal = isLandingPath(pathname);

  if (minimal) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">{children}</main>
    </>
  );
}
