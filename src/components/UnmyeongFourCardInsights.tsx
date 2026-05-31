"use client";

import { useMemo } from "react";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { buildUnlockedInsights } from "@/lib/landing-insight-copy";

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
};

/** 헌법 4단 — 흐름 · 타이밍 · 실수 장면 · 비서 제안 (랜딩·/today 공통) */
export function UnmyeongFourCardInsights({
  report,
  dateLabel,
  showShareHint = true,
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
            <p className="landing-unlocked__item-num" aria-hidden>
              {index + 1}
            </p>
            <div className="landing-unlocked__item-body">
              <h3 className="landing-unlocked__item-label">{item.label}</h3>
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
                <p className="landing-unlocked__insight">{renderMultiline(item.insight)}</p>
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
