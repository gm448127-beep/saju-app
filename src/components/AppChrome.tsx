"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/components/Header";

/** 랜딩 전용 경로 — 글로벌 헤더·기본 main 패딩 없음 */
const MINIMAL_CHROME_PREFIXES = ["/landing-mbti", "/landing-restart", "/landing-decision"];

function isMinimalChrome(pathname: string | null) {
  if (!pathname) return false;
  return MINIMAL_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const minimal = isMinimalChrome(pathname);

  if (minimal) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-6">{children}</main>
    </>
  );
}
