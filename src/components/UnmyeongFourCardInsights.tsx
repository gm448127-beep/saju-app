"use client";

import { useMemo } from "react";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { buildUnlockedInsights } from "@/lib/landing-insight-copy";
import {
  LANDING_INSIGHT_LOCK_MESSAGE,
  LANDING_RESULT_LOCK_BADGE,
} from "@/lib/landing-trust-copy";

function renderMultiline(text: string) {
  return text.split("\n\n").map((paragraph, paragraphIndex) => (
    <span key={`p-${paragraphIndex}`}>
      {paragraphIndex > 0 ? (
        <>
          <br />
          <br />
        </>
      ) : null}
      {paragraph.split("\n").map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`}>
          {lineIndex > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </span>
  ));
}

type UnmyeongFourCardInsightsProps = {
  report: DailyFortuneContent;
  dateLabel?: string;
  showShareHint?: boolean;
  /** 랜딩: 이 인덱스부터 보조 통찰(insight) 잠금 — 0=1번 카드 */
  lockInsightFromIndex?: number;
};

/** 헌법 4단 — 흐름 · 타이밍 · 실수 장면 · 비서 제안 (랜딩·/today 공통) */
export function UnmyeongFourCardInsights({
  report,
  dateLabel,
  showShareHint = true,
  lockInsightFromIndex,
}: UnmyeongFourCardInsightsProps) {
  const items = useMemo(() => buildUnlockedInsights(report), [report]);

  return (
    <section className="landing-unlocked" aria-label="오늘의 4단 리포트">
      <header className="landing-unlocked__header">
        <p className="landing-unlocked__brand">UNMYEONG BISEO</p>
        <h2 className="landing-unlocked__hook">어떻게 이걸 알았지?</h2>
        {dateLabel ? <p className="landing-unlocked__date">{dateLabel}</p> : null}
      </header>

      <ol className="landing-unlocked__list">
        {items.map((item, index) => (
          <li
            key={item.label}
            className={`landing-unlocked__item${item.highlight ? " landing-unlocked__item--quote" : ""}`}
          >
            <div className="landing-unlocked__item-body">
              <h3 className="landing-unlocked__item-label">
                {index + 1}. {item.label}
              </h3>
              <p
                className={
                  item.highlight
                    ? "landing-unlocked__fortune landing-unlocked__fortune--quote"
                    : "landing-unlocked__fortune"
                }
              >
                {renderMultiline(item.fortune)}
              </p>
              {item.insight ? (
                lockInsightFromIndex !== undefined && index >= lockInsightFromIndex ? (
                  <div className="landing-unlocked__insight-lock">
                    <p className="landing-unlocked__insight landing-unlocked__insight--blurred" aria-hidden>
                      {renderMultiline(item.insight)}
                    </p>
                    <div className="landing-unlocked__insight-lock-overlay">
                      <span className="landing-unlocked__insight-lock-badge">{LANDING_RESULT_LOCK_BADGE}</span>
                      <p className="landing-unlocked__insight-lock-text">{LANDING_INSIGHT_LOCK_MESSAGE}</p>
                    </div>
                  </div>
                ) : (
                  <p className="landing-unlocked__insight">{renderMultiline(item.insight)}</p>
                )
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {showShareHint ? (
        <p className="landing-unlocked__share">오늘 비서의 제안, 한 번만 실행해 보세요.</p>
      ) : null}
    </section>
  );
}
