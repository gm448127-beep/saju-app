"use client";

import { useMemo } from "react";
import { buildUnlockedInsights } from "@/lib/landing-insight-copy";
import type { LandingTodaySheetData } from "@/lib/landing-today-sheet";

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

/** 이메일 입력 후 — 흐름·타이밍·장면·비서 제안 */
export function LandingUnlockedInsights({ data }: { data: LandingTodaySheetData }) {
  const items = useMemo(() => buildUnlockedInsights(data.report), [data.report]);

  return (
    <section id="landing-today-sheet" className="landing-unlocked" aria-label="나의 발견">
      <header className="landing-unlocked__header">
        <p className="landing-unlocked__brand">UNMYEONG BISEO</p>
        <h2 className="landing-unlocked__hook">어떻게 이걸 알았지?</h2>
        <p className="landing-unlocked__date">{data.dateLabel} · 왜 이러는지</p>
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
                  item.highlight ? "landing-unlocked__fortune landing-unlocked__fortune--quote" : "landing-unlocked__fortune"
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

      <p className="landing-unlocked__share">오늘 비서의 제안, 한 번만 실행해 보세요.</p>
    </section>
  );
}
