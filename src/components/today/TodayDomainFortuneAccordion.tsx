"use client";

import TodayDetailedFortuneReport from "@/components/today/TodayDetailedFortuneReport";
import { stripScoreMentions } from "@/lib/today-score-ui-copy";
import {
  getDomainDetailedFortune,
  type TodayApiResult,
  type TodayDomainCard,
} from "@/lib/today-secretary-report";

type TodayDomainFortuneAccordionProps = {
  cards: TodayDomainCard[];
  result: TodayApiResult;
};

/** 분야별 요약 카드 — 역삼각형 탭 시 직장운·재물운 등 상세 펼침 */
export default function TodayDomainFortuneAccordion({ cards, result }: TodayDomainFortuneAccordionProps) {
  return (
    <div className="today-secretary__domain-accordion">
      {cards.map((card) => {
        const detail = getDomainDetailedFortune(result, card.key, card);

        return (
          <details key={card.key} className="today-secretary__domain-details">
            <summary className="today-secretary__domain-summary">
              <div className="today-secretary__domain-summary-inner">
                <div className="today-secretary__domain-top">
                  <p className="today-secretary__domain-label">{card.label}</p>
                </div>
                <p className="today-secretary__body today-secretary__domain-teaser">
                  {stripScoreMentions(card.summary)}
                </p>
                <p className="today-secretary__domain-action-hint">
                  오늘의 선택: {stripScoreMentions(card.action)}
                </p>
              </div>
              <span className="today-secretary__domain-chevron" aria-hidden>
                ▼
              </span>
            </summary>

            {detail && (
              <div className="today-secretary__domain-expand">
                <TodayDetailedFortuneReport items={[detail]} embedded />
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}
