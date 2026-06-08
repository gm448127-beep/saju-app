"use client";

import { useEffect, useRef } from "react";
import { LandingPremiumLockedTeaser } from "@/components/landing/LandingPremiumLockedTeaser";
import { UnmyeongFourCardInsights } from "@/components/UnmyeongFourCardInsights";
import { trackLandingViewContent } from "@/lib/landing-analytics";
import { LANDING_RESULT_FREE_BADGE } from "@/lib/landing-trust-copy";
import type { LandingTodaySheetData } from "@/lib/landing-today-sheet";

export function LandingTodaySheet({ data }: { data: LandingTodaySheetData }) {
  const viewContentTracked = useRef(false);

  useEffect(() => {
    if (viewContentTracked.current) return;
    viewContentTracked.current = true;
    trackLandingViewContent();
  }, []);

  return (
    <div id="landing-today-sheet" className="landing-sheet-wrap">
      <p className="landing-sheet__free-badge">{LANDING_RESULT_FREE_BADGE}</p>
      <UnmyeongFourCardInsights
        report={data.report}
        dateLabel={`${data.dateLabel} · 왜 이러는지`}
        lockInsightFromIndex={2}
        showShareHint={false}
      />
      <LandingPremiumLockedTeaser />
      <p className="landing-sheet__footer">매일 아침, 나를 들키는 문장을 이렇게 받아볼 수 있어요.</p>
    </div>
  );
}
