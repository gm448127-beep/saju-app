"use client";

import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { ACTION_GUIDE_COPY } from "@/lib/history-copy";
import { getSiteUrl } from "@/lib/site-metadata";

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

function overallScore(content: DailyFortuneContent) {
  return clampScore(
    content.axisScores.relation * 0.3 +
      content.axisScores.decision * 0.3 +
      content.axisScores.emotion * 0.2 +
      content.axisScores.balance * 0.2,
  );
}

function splitGuideLines(text: string, max = 2) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

export interface TodayShareCardProps {
  report: DailyFortuneContent;
  dateLabel: string;
  displayName?: string;
  /** 스토리 캡처용 고정 크기 (9:16) */
  className?: string;
}

/** 인스타·카카오 스토리용 9:16 공유 카드 (캡처 전용) */
export default function TodayShareCard({
  report,
  dateLabel,
  displayName,
  className = "",
}: TodayShareCardProps) {
  const overall = overallScore(report);
  const areas = [
    { label: "관계", score: clampScore(report.axisScores.relation) },
    { label: "결정", score: clampScore(report.axisScores.decision) },
    { label: "감정", score: clampScore(report.axisScores.emotion) },
    { label: "균형", score: clampScore(report.axisScores.balance) },
  ];
  const dosLines = splitGuideLines(report.actionGuide.dos);
  const siteHost = getSiteUrl().replace(/^https?:\/\//, "");

  return (
    <div
      className={`flex h-[640px] w-[360px] flex-col overflow-hidden rounded-[32px] border-2 border-[#E2D7D0] bg-[#FFFDF8] text-[#2F282B] shadow-none ${className}`}
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <div className="border-b border-[#E8D7C4] bg-[#FFF8EE] px-6 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2F282B] text-lg font-bold text-[#F4E7D6]"
              style={{ fontFamily: "Jua, sans-serif" }}
            >
              命
            </span>
            <div>
              <p className="text-sm font-bold text-[#8B6F47]">운명비서</p>
              <p className="text-[10px] text-[#8A7E78]">MY TODAY</p>
            </div>
          </div>
          <span className="rounded-full border border-[#D9C8C0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#8B6F47]">
            내 사주 기준
          </span>
        </div>
        <p className="mt-3 text-xs text-[#8A7E78]">{dateLabel}</p>
        {displayName && (
          <p className="mt-1 text-base font-bold text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            {displayName}의 오늘
          </p>
        )}
        <p className="mt-2 inline-block rounded-full border border-[#E2D7D0] bg-white px-2.5 py-0.5 text-xs font-bold text-[#8B6F47]">
          오늘의 결 · {report.toneLabel}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-6 py-5">
        <p className="text-xs font-bold text-[#8B6F47]">오늘의 한 줄</p>
        <p
          className="mt-2 text-[1.65rem] leading-snug text-[#2F282B]"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {report.sentence}
        </p>

        <div className="mt-5 rounded-2xl border border-[#E2D7D0] bg-white px-4 py-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#8B6F47]">종합</p>
              <p className="text-4xl font-bold leading-none">{overall}</p>
            </div>
            <p className="text-sm font-bold text-[#8B6F47]">{report.toneLabel}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {areas.map((area) => (
              <div key={area.label} className="rounded-xl bg-[#FAF8F5] px-3 py-2.5">
                <p className="text-[11px] text-[#8A7E78]">{area.label}</p>
                <p className="text-xl font-bold text-[#8B6F47]">{area.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-3">
          <p className="text-xs font-bold text-[#3D5838]">{ACTION_GUIDE_COPY.dosLabel}</p>
          <ul className="mt-2 space-y-1.5">
            {dosLines.map((line) => (
              <li key={line} className="flex gap-2 text-sm leading-snug text-[#4A403B]">
                <span className="font-bold text-[#8B6F47]">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E8D7C4] bg-[#2F282B] px-6 py-4 text-center">
        <p className="text-xs font-bold text-[#F4E7D6]">{siteHost}</p>
        <p className="mt-0.5 text-[10px] text-[#B8A78D]">오늘의 흐름 · 운명비서</p>
      </div>
    </div>
  );
}
