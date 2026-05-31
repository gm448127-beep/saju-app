"use client";

import { UnmyeongFourCardInsights } from "@/components/UnmyeongFourCardInsights";
import type { LandingTodaySheetData } from "@/lib/landing-today-sheet";

/** 랜딩 이메일 입력 후 — 헌법 4단 결과 */
export function LandingUnlockedInsights({ data }: { data: LandingTodaySheetData }) {
  return (
    <UnmyeongFourCardInsights
      report={data.report}
      dateLabel={`${data.dateLabel} · 왜 이러는지`}
    />
  );
}
