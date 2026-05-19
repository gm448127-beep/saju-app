"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import {
  buildAreaScores,
  buildRealYesterdayHeadline,
  buildThreeDayTrend,
  buildYesterdayComparisons,
  buildYesterdayHeadline,
  getPreviousDayRecord,
  getTodayHistory,
  clampScore,
  getScoreInterpretation,
  getTodayStatus,
  hasSavedToday,
  saveTodayRecord,
  splitGuideLines,
} from "@/lib/today-report-helpers";

function ScoreBlocks({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 8);
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} className={`h-2 w-2 rounded-sm ${index < filled ? "bg-[#8B6F47]" : "bg-[#EDE4DC]"}`} />
      ))}
    </div>
  );
}

function CardShell({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-[26px] border px-5 py-5 shadow-[0_10px_28px_rgba(61,51,56,0.05)] ${className}`}>
      <p className="text-[11px] font-bold tracking-[0.12em] text-[#8B6F47]">{title}</p>
      {children}
    </article>
  );
}

interface TodayFiveCardReportProps {
  report: DailyFortuneContent;
  result: {
    scores?: Record<string, number>;
    briefing?: { oneLine?: string; scoreTone?: string };
  };
  birthKey: string;
}

export default function TodayFiveCardReport({ report, result, birthKey }: TodayFiveCardReportProps) {
  const scores = result?.scores ?? {};
  const overall = clampScore(scores.overall ?? 70);
  const status = getTodayStatus(overall);
  const interpretation = result.briefing?.scoreTone || getScoreInterpretation(overall, status);
  const areas = buildAreaScores(scores, overall);
  const history = getTodayHistory();
  const previousRecord = getPreviousDayRecord(history, dateKey, birthKey);
  const comparisons = buildYesterdayComparisons(report.seedKey, areas).map((item) => {
    if (!previousRecord) return item;
    const currentArea = areas.find((area) => area.key === item.key);
    if (!currentArea) return item;
    const delta = currentArea.score - previousRecord.overall;
    return {
      ...item,
      delta,
      previousScore: clampScore(previousRecord.overall),
    };
  });
  const yesterdayHeadline =
    buildRealYesterdayHeadline(previousRecord, overall, status) ?? buildYesterdayHeadline(comparisons);
  const threeDayTrend = buildThreeDayTrend(report.seedKey).map((item, index) => {
    if (index !== 2 || !previousRecord) return item;
    return { ...item, score: overall, status };
  });
  const dateKey = report.seedKey.split("-")[0] ?? "";

  const [saved, setSaved] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const timeSlots = report.timeSlots.slice(0, 3);

  useEffect(() => {
    setSaved(hasSavedToday(dateKey, birthKey));
  }, [dateKey, birthKey]);

  useEffect(() => {
    saveTodayRecord({
      savedAt: new Date().toISOString(),
      dateKey,
      overall,
      sentence: report.sentence,
      birthKey,
      status,
      flow: report.flow,
    });
    setSaved(true);
  }, [birthKey, dateKey, overall, report.flow, report.sentence, status]);

  const handleSave = () => {
    const ok = saveTodayRecord({
      savedAt: new Date().toISOString(),
      dateKey,
      overall,
      sentence: report.sentence,
      birthKey,
      status,
      flow: report.flow,
    });
    if (ok) {
      setSaved(true);
      setSavePulse(true);
      window.setTimeout(() => setSavePulse(false), 700);
    }
  };

  return (
    <section className="space-y-4">
      {/* 점수 + 어제 대비 */}
      <div className="rounded-[28px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_14px_38px_rgba(61,51,56,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">오늘의 상태</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-5xl font-bold leading-none text-[#2F282B]">{overall}</p>
              <div>
                <p className="text-lg font-bold text-[#8B6F47]">{status}</p>
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-[#5A4E48]">{interpretation}</p>
              </div>
            </div>
          </div>
          <div className="min-w-[200px] flex-1 space-y-2.5 rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-3">
            {areas.map((area) => (
              <div key={area.key} className="grid grid-cols-[72px_34px_1fr] items-center gap-2">
                <p className="text-sm font-semibold text-[#3D3338]">{area.label}</p>
                <p className="text-sm font-bold text-[#8B6F47]">{area.score}</p>
                <ScoreBlocks score={area.score} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#E8D7C4] bg-[#FFF8EE] px-4 py-3">
          <p className="text-xs font-bold text-[#8B6F47]">어제보다 오늘</p>
          <p className="mt-1 text-sm leading-relaxed text-[#4A403B]">{yesterdayHeadline}</p>
        </div>

        <div className="mt-3 flex gap-2">
          {threeDayTrend.map((item) => (
            <div key={item.label} className="flex-1 rounded-xl border border-[#E2D7D0] bg-[#FFFDF9] px-2 py-2 text-center">
              <p className="text-[10px] text-[#8A7E78]">{item.label}</p>
              <p className="text-xs font-bold text-[#8B6F47]">{item.status}</p>
              <p className="text-[10px] text-[#A09488]">{item.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 인터랙션 */}
      <div className="sticky bottom-3 z-20 flex flex-wrap gap-2 rounded-2xl border border-[#E2D7D0] bg-white/95 p-2 shadow-[0_8px_24px_rgba(61,51,56,0.1)] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={handleSave}
          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${saved ? "bg-[#FFF8EE] text-[#8B6F47]" : "bg-[#2F282B] text-white"} ${savePulse ? "scale-105" : ""}`}
        >
          {saved ? "저장됨 ✓" : "저장하기"}
        </button>
        <button
          type="button"
          onClick={() => setCompareOpen((open) => !open)}
          className="rounded-xl border border-[#D9C8C0] bg-white px-3 py-2 text-xs font-bold text-[#2F282B]"
        >
          어제와 비교
        </button>
        <Link href="#today-share-actions" className="rounded-xl border border-[#D9C8C0] bg-white px-3 py-2 text-xs font-bold text-[#2F282B]">
          공유 카드
        </Link>
        <Link href="/history" className="rounded-xl border border-[#D9C8C0] bg-white px-3 py-2 text-xs font-bold text-[#2F282B]">
          기록 보기
        </Link>
      </div>

      {compareOpen && (
        <div className="animate-fade-in space-y-2 rounded-[24px] border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
          <p className="text-xs font-bold text-[#8B6F47]">어제와의 변화</p>
          {comparisons.map((item) => {
            const isUp = item.delta >= 0;
            return (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-[#E2D7D0] bg-white px-3 py-2.5">
                <p className="text-sm text-[#4A403B]">{item.label}</p>
                <p className={`text-sm font-bold ${isUp ? "text-[#8B6F47]" : "text-[#7A4A3D]"}`}>
                  {isUp ? "▲" : "▼"} {Math.abs(item.delta)} ({item.previousScore} → {item.score})
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 카드 1: 오늘의 한 줄 */}
      <CardShell title="CARD 01 · 오늘의 한 줄" className="border-[#E8D7C4] bg-[#FFFDF8]">
        <h2 className="mt-4 text-3xl leading-tight text-[#2F282B] sm:text-4xl" style={{ fontFamily: "Jua, sans-serif" }}>
          {report.sentence}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#6B5E58]">오늘 하루를 기억할 한 문장입니다.</p>
      </CardShell>

      {/* 카드 2: 오늘의 흐름 */}
      <CardShell title="CARD 02 · 오늘의 흐름" className="border-[#E2D7D0] bg-[#F5EDE3]">
        <p className="mt-4 text-xl leading-snug text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {report.flow.split(".")[0]}.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">{report.flow}</p>
      </CardShell>

      {/* 카드 3: 행동 가이드 */}
      <CardShell title="CARD 03 · 행동 가이드" className="border-[#E2D7D0] bg-white">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-4">
            <p className="text-xs font-bold text-[#3D5838]">하면 좋은 것</p>
            <ul className="mt-3 space-y-2">
              {splitGuideLines(report.actionGuide.dos).map((line) => (
                <li key={line} className="flex gap-2 text-sm leading-relaxed text-[#4A403B]">
                  <span className="text-[#8B6F47]">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-[#FFFDF9] px-4 py-4">
            <p className="text-xs font-bold text-[#7A4A3D]">피하면 좋은 것</p>
            <ul className="mt-3 space-y-2">
              {splitGuideLines(report.actionGuide.donts).map((line) => (
                <li key={line} className="flex gap-2 text-sm leading-relaxed text-[#4A403B]">
                  <span className="text-[#9A685B]">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-[#FAF8F5] px-3 py-3">
            <p className="text-[11px] font-semibold text-[#8B6F47]">관계의 결</p>
            <p className="mt-1 text-sm text-[#4A403B]">{report.actionGuide.relationTip}</p>
          </div>
          <div className="rounded-xl bg-[#FAF8F5] px-3 py-3">
            <p className="text-[11px] font-semibold text-[#8B6F47]">일과 돈의 기준</p>
            <p className="mt-1 text-sm text-[#4A403B]">{report.actionGuide.workMoneyTip}</p>
          </div>
        </div>
      </CardShell>

      {/* 카드 4: 감정 포인트 */}
      <CardShell title="CARD 04 · 감정 포인트" className="border-[#E8D7D0] bg-[#F8F0ED]">
        <h3 className="mt-4 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {report.emotionPoint.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">{report.emotionPoint.description}</p>
      </CardShell>

      {/* 카드 5: 시간대 운세 */}
      <CardShell title="CARD 05 · 시간대 운세" className="border-[#E2D7D0] bg-white">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.label}
              type="button"
              onClick={() => setActiveSlot(activeSlot === slot.label ? null : slot.label)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                activeSlot === slot.label
                  ? "border-[#8B6F47] bg-[#FFF8EE] shadow-[0_8px_20px_rgba(139,111,71,0.12)]"
                  : "border-[#E2D7D0] bg-[#FFFDF9]"
              }`}
            >
              <p className="text-xs text-[#8A7E78]">{slot.label}</p>
              <p className="mt-1 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {slot.keyword}
              </p>
              <p className={`mt-2 text-xs leading-relaxed text-[#5A4E48] ${activeSlot === slot.label ? "block" : "line-clamp-2"}`}>
                {slot.description}
              </p>
            </button>
          ))}
        </div>
        {report.timeSlots[3] && (
          <p className="mt-3 text-xs leading-relaxed text-[#8A7E78]">
            밤 · {report.timeSlots[3].keyword} — {report.timeSlots[3].description}
          </p>
        )}
      </CardShell>
    </section>
  );
}
