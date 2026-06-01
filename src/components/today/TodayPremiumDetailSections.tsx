"use client";

import HourlyFlowSection, { type HourlyFlowSlot } from "@/components/HourlyFlowSection";
import TimeAdviceSection from "@/components/TimeAdviceSection";
import TodayActionGuideSection from "@/components/TodayActionGuideSection";
import type { TodayApiResult } from "@/lib/today-secretary-report";

type TodayPremiumDetailSectionsProps = {
  result: TodayApiResult;
};

/** 유료 영역 — 12시진, 시간대·행동 상세 */
export default function TodayPremiumDetailSections({ result }: TodayPremiumDetailSectionsProps) {
  const hourlyFlow = (result.hourlyFlow ?? []) as HourlyFlowSlot[];
  const hasHourly = hourlyFlow.length > 0;

  return (
    <>
      {hasHourly && (
        <article id="today-hourly-flow" className="today-secretary__premium-block scroll-mt-24">
          <div className="today-secretary__premium-head">
            <h3>12시진 전체</h3>
          </div>
          <div className="today-secretary__premium-body today-secretary__premium-body--flush">
            <HourlyFlowSection
              hourlyFlow={hourlyFlow}
              hourlyFlowIntro={result.hourlyFlowIntro}
              hourlyPeak={result.hourlyPeak as HourlyFlowSlot | undefined}
              hourlyCaution={result.hourlyCaution as HourlyFlowSlot | undefined}
              showSijinDetails
            />
          </div>
        </article>
      )}

      <article id="today-premium-time-action" className="today-secretary__premium-block scroll-mt-24">
        <div className="today-secretary__premium-head">
          <h3>시간대 · 행동 상세</h3>
        </div>
        <div className="today-secretary__premium-body today-secretary__premium-body--stack">
          {(result.timeAdvice?.length ?? 0) > 0 && (
            <TimeAdviceSection items={result.timeAdvice ?? []} />
          )}
          <TodayActionGuideSection
            dos={result.todayDos}
            donts={result.todayDonts}
            dosDetailed={result.todayDosDetailed}
            dontsDetailed={result.todayDontsDetailed}
            luckyItems={result.luckyItems}
            tip={result.tip}
            warning={result.warning}
            sipsinTitle={result.sipsinTitle}
          />
        </div>
      </article>
    </>
  );
}
