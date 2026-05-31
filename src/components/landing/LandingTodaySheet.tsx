import { LandingUnlockedInsights } from "@/components/landing/LandingUnlockedInsights";

import type { LandingTodaySheetData } from "@/lib/landing-today-sheet";



export function LandingTodaySheet({ data }: { data: LandingTodaySheetData }) {

  return (

    <div className="landing-sheet-wrap">

      <LandingUnlockedInsights data={data} />

      <p className="landing-sheet__footer">매일 아침, 나를 들키는 문장을 이렇게 받아볼 수 있어요.</p>

    </div>

  );

}

