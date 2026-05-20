"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { ACTION_GUIDE_COPY } from "@/lib/history-copy";
import MyeongriBasisToggle from "@/components/MyeongriBasisToggle";
import ToneDecisionChip from "@/components/ToneDecisionChip";
import { buildTodayMyeongriBasis, buildToneChipTooltip } from "@/lib/today-basis-helpers";
import {
  buildComparisonInsight,
  buildOverallComparison,
  buildThreeDayTrendFromHistory,
  buildYesterdayComparisonsFromRecords,
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
  mode?: "common" | "personalized";
  result?: Record<string, unknown> & {
    scores?: Record<string, number>;
    briefing?: { oneLine?: string; scoreTone?: string };
  };
  birthKey?: string;
  dateLabel?: string;
}

function buildOverallFromAxis(report: DailyFortuneContent) {
  return clampScore(
    report.axisScores.relation * 0.3 +
      report.axisScores.decision * 0.3 +
      report.axisScores.emotion * 0.2 +
      report.axisScores.balance * 0.2,
  );
}

function splitFlowText(flow: string) {
  const sentences = flow.match(/[^.!?]+[.!?]+/g)?.map((part) => part.trim()) ?? [flow.trim()];
  if (sentences.length <= 1) {
    return { headline: flow.trim(), body: "" };
  }
  return {
    headline: sentences[0],
    body: sentences.slice(1).join(" "),
  };
}

type TodayBriefingSlice = {
  oneLine?: string;
  headline?: string;
  scoreTone?: string;
};

/** MY TODAY 요약 블록 — scoreTone(평/길)은 등급만, 본문은 여러 소스를 합친다 */
function buildMyTodaySummary(
  result: TodayFiveCardReportProps["result"],
  report: DailyFortuneContent,
  overall: number,
) {
  const briefing = result?.briefing as TodayBriefingSlice | undefined;
  const summaryText = typeof result?.summary === "string" ? result.summary.trim() : "";
  const sentence = report.sentence?.trim() || "";
  const lead =
    briefing?.oneLine?.trim() ||
    briefing?.headline?.trim() ||
    summaryText ||
    splitFlowText(report.flow).headline ||
    getScoreInterpretation(overall, getTodayStatus(overall));

  return {
    sentence,
    lead,
    grade: briefing?.scoreTone?.trim(),
  };
}

export default function TodayFiveCardReport({
  report,
  mode = "personalized",
  result,
  birthKey = "common",
  dateLabel,
}: TodayFiveCardReportProps) {
  const isPersonalized = mode === "personalized" && Boolean(result);
  const dateKey = report.seedKey.split("-")[0] ?? "";
  const scores = result?.scores ?? {};
  const axisOverall = buildOverallFromAxis(report);
  const overall = isPersonalized ? clampScore(scores.overall ?? axisOverall) : axisOverall;
  const status = isPersonalized ? getTodayStatus(overall) : report.toneLabel;
  const myTodaySummary = isPersonalized ? buildMyTodaySummary(result, report, overall) : null;
  const interpretation = isPersonalized
    ? myTodaySummary?.lead || report.emotionPoint.description
    : report.emotionPoint.description;
  const tonePrefix = isPersonalized ? "나의 오늘" : "오늘의 결";
  const areas = [
    { key: "relation", label: "관계", score: clampScore(report.axisScores.relation) },
    { key: "decision", label: "결정", score: clampScore(report.axisScores.decision) },
    { key: "emotion", label: "감정", score: clampScore(report.axisScores.emotion) },
    { key: "balance", label: "균형", score: clampScore(report.axisScores.balance) },
  ];
  const savedAreas = {
    relation: areas.find((area) => area.key === "relation")?.score ?? overall,
    decision: areas.find((area) => area.key === "decision")?.score ?? overall,
    emotion: areas.find((area) => area.key === "emotion")?.score ?? overall,
    balance: report.axisScores ? clampScore(report.axisScores.balance) : overall,
  };
  const history = getTodayHistory();
  const previousRecord = getPreviousDayRecord(history, dateKey, birthKey);
  const overallComparison = buildOverallComparison(previousRecord, overall);
  const comparisons = buildYesterdayComparisonsFromRecords(areas, previousRecord, report.seedKey);
  const yesterdayHeadline = buildComparisonInsight(overallComparison, comparisons, status, {
    previousToneKey: previousRecord?.toneKey,
    currentToneKey: report.toneKey,
  });
  const threeDayTrend = buildThreeDayTrendFromHistory(
    history,
    dateKey,
    birthKey,
    overall,
    status,
    report.seedKey,
  );
  const hasRealYesterday = isPersonalized && Boolean(previousRecord);

  const [saved, setSaved] = useState(false);
  const [savePulse, setSavePulse] = useState(false);
  const [compareOpen, setCompareOpen] = useState(hasRealYesterday);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const flowParts = splitFlowText(report.flow);
  const myeongriBasisSections = isPersonalized ? buildTodayMyeongriBasis(result) : [];
  const toneChipTooltip = isPersonalized
    ? buildToneChipTooltip(result, report.toneLabel)
    : null;
  const toneChipLabel = `${tonePrefix} · ${report.toneLabel}`;
  const timeSlots = report.timeSlots;

  useEffect(() => {
    if (!isPersonalized) return;
    setSaved(hasSavedToday(dateKey, birthKey));
  }, [birthKey, dateKey, isPersonalized]);

  // /today 진입 시 해당 날짜·birthKey 기준으로 자동 저장 (같은 날 재진입 시 최신으로 덮어씀)
  useEffect(() => {
    saveTodayRecord({
      savedAt: new Date().toISOString(),
      dateKey,
      overall,
      sentence: report.sentence,
      birthKey,
      status,
      flow: report.flow,
      toneKey: report.toneKey,
      toneLabel: report.toneLabel,
      saveSentence: report.saveSentence,
      areas: savedAreas,
    });
    if (isPersonalized) setSaved(true);
  }, [
    birthKey,
    dateKey,
    isPersonalized,
    overall,
    report.flow,
    report.sentence,
    report.toneKey,
    report.toneLabel,
    report.saveSentence,
    savedAreas.balance,
    savedAreas.decision,
    savedAreas.emotion,
    savedAreas.relation,
    status,
  ]);

  const handleSave = () => {
    if (!isPersonalized) return;
    const ok = saveTodayRecord({
      savedAt: new Date().toISOString(),
      dateKey,
      overall,
      sentence: report.sentence,
      birthKey,
      status,
      flow: report.flow,
      toneKey: report.toneKey,
      toneLabel: report.toneLabel,
      saveSentence: report.saveSentence,
      areas: savedAreas,
    });
    if (ok) {
      setSaved(true);
      setSavePulse(true);
      window.setTimeout(() => setSavePulse(false), 700);
    }
  };

  return (
    <section className="space-y-4">
      {!isPersonalized && (
        <div className="mb-1">
          <h1 className="text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
            오늘의 흐름
          </h1>
          {dateLabel && <p className="mt-1 text-sm text-[#8A7E78]">{dateLabel}</p>}
        </div>
      )}

      {/* 점수 + 어제 대비 */}
      <div className="rounded-[28px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_14px_38px_rgba(61,51,56,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">
                {isPersonalized ? "MY TODAY" : "TODAY REPORT"}
              </p>
              <ToneDecisionChip
                label={toneChipLabel}
                tooltip={toneChipTooltip}
                variant="warm"
              />
              {myTodaySummary?.grade && (
                <span className="rounded-full border border-[#E2D7D0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
                  등급 {myTodaySummary.grade}
                </span>
              )}
              {!isPersonalized && (
                <span className="rounded-full border border-[#E2D7D0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
                  공통 흐름
                </span>
              )}
            </div>

            {isPersonalized && myTodaySummary ? (
              <div className="mt-4 w-full max-w-xl space-y-3">
                {myTodaySummary.sentence && (
                  <p
                    className="text-lg leading-snug text-[#2F282B] sm:text-xl"
                    style={{ fontFamily: "Jua, sans-serif" }}
                  >
                    {myTodaySummary.sentence}
                  </p>
                )}
                <div className="rounded-2xl border border-[#E8D7C4] bg-[#FFF8EE] px-4 py-3">
                  <p className="text-[11px] font-bold text-[#8B6F47]">오늘 흐름 요약</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">{myTodaySummary.lead}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 w-full max-w-xl text-sm leading-relaxed text-[#5A4E48]">{interpretation}</p>
            )}
          </div>

          <div className="w-full rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4 lg:max-w-sm">
            <div className="border-b border-[#E2D7D0]/70 pb-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-[#8B6F47]">종합</p>
                  <p className="mt-1 text-3xl font-bold leading-none text-[#2F282B]">{overall}</p>
                </div>
                <ScoreBlocks score={overall} />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {areas.map((area) => (
                <div key={area.key} className="grid grid-cols-[42px_28px_1fr] items-center gap-2">
                  <p className="text-xs font-semibold text-[#6B5E58]">{area.label}</p>
                  <p className="text-xs font-bold text-[#8B6F47]">{area.score}</p>
                  <ScoreBlocks score={area.score} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPersonalized && (
          <>
        <div className="mt-4 rounded-2xl border border-[#E8D7C4] bg-[#FFF8EE] px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[#8B6F47]">어제보다 오늘</p>
            <span className="rounded-full border border-[#E2D7D0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#8B6F47]">
              {hasRealYesterday ? "내 기록 기준" : "예시 흐름"}
            </span>
          </div>

          {overallComparison ? (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold leading-none text-[#A09488]">{overallComparison.previousOverall}</p>
                <span className="pb-0.5 text-sm text-[#A09488]">→</span>
                <p className="text-3xl font-bold leading-none text-[#2F282B]">{overall}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  overallComparison.delta >= 0
                    ? "bg-white text-[#8B6F47]"
                    : "bg-white text-[#7A4A3D]"
                }`}
              >
                {overallComparison.delta >= 0 ? "▲" : "▼"} {Math.abs(overallComparison.delta)}
              </span>
            </div>
          ) : null}

          <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">{yesterdayHeadline}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {comparisons.map((item) => {
              const isUp = item.delta >= 0;
              return (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E2D7D0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5A4E48]"
                >
                  {item.label}
                  <span className={isUp ? "text-[#8B6F47]" : "text-[#7A4A3D]"}>
                    {isUp ? "▲" : "▼"}
                    {Math.abs(item.delta)}
                  </span>
                </span>
              );
            })}
          </div>

          {!hasRealYesterday && (
            <p className="mt-3 text-[11px] leading-relaxed text-[#8A7E78]">
              내일부터는 어제 기록과 실제 점수 변화를 비교할 수 있습니다.
            </p>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {threeDayTrend.map((item) => (
            <div
              key={item.label}
              className={`flex-1 rounded-xl border px-2 py-2 text-center ${
                item.label === "오늘" ? "border-[#C49A4A]/40 bg-[#FFF8EE]" : "border-[#E2D7D0] bg-[#FFFDF9]"
              }`}
            >
              <p className="text-[10px] text-[#8A7E78]">{item.label}</p>
              <p className="text-xs font-bold text-[#8B6F47]">{item.status}</p>
              <p className="text-[10px] text-[#A09488]">{item.score}</p>
              {!item.isReal && item.label !== "오늘" && (
                <p className="mt-0.5 text-[9px] text-[#C4B8AE]">예시</p>
              )}
            </div>
          ))}
        </div>
          </>
        )}
      </div>

      {isPersonalized && (
      <>
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-[#8B6F47]">어제와의 변화</p>
            <span className="text-[10px] font-semibold text-[#8A7E78]">
              {hasRealYesterday ? "저장된 기록 기준" : "첫 방문 예시"}
            </span>
          </div>
          {comparisons.map((item) => {
            const isUp = item.delta >= 0;
            return (
              <div key={item.key} className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#4A403B]">{item.label}</p>
                  <p className={`text-sm font-bold ${isUp ? "text-[#8B6F47]" : "text-[#7A4A3D]"}`}>
                    {isUp ? "▲" : "▼"} {Math.abs(item.delta)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-[#8A7E78]">
                  {item.previousScore} → {item.score}
                  {!item.isReal && " · 예시"}
                </p>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* 오늘의 결 — CARD 01 직전 */}
      <div className="rounded-2xl border border-[#E8D7C4] bg-[#FFFDF8] px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <ToneDecisionChip
            label={`오늘의 결 · ${report.toneLabel}`}
            tooltip={toneChipTooltip}
            size="md"
            variant="white"
          />
          {dateLabel && <span className="text-xs font-semibold text-[#8A7E78]">{dateLabel}</span>}
          {!isPersonalized && (
            <span className="rounded-full border border-[#E2D7D0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
              공통 흐름
            </span>
          )}
          {isPersonalized && (
            <span className="rounded-full border border-[#E2D7D0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
              나의 흐름
            </span>
          )}
        </div>
      </div>

      {/* 카드 1: 오늘의 한 줄 */}
      <CardShell title="CARD 01 · 오늘의 한 줄" className="border-[#E8D7C4] bg-[#FFFDF8]">
        <h2 className="mt-4 text-3xl leading-tight text-[#2F282B] sm:text-4xl" style={{ fontFamily: "Jua, sans-serif" }}>
          {report.sentence}
        </h2>
        <div className="mt-5 rounded-2xl border border-[#E2D7D0] bg-white px-4 py-4">
          <p className="text-[11px] font-bold text-[#8B6F47]">오늘 기억할 말</p>
          <p className="mt-2 text-lg leading-relaxed text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            &ldquo;{report.saveSentence}&rdquo;
          </p>
        </div>
      </CardShell>

      {/* 카드 2: 오늘의 흐름 */}
      <CardShell title="CARD 02 · 오늘의 흐름" className="border-[#E2D7D0] bg-[#F5EDE3]">
        <p className="mt-4 text-xl leading-snug text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {flowParts.headline}
        </p>
        {flowParts.body && (
          <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">{flowParts.body}</p>
        )}
        {myeongriBasisSections.length > 0 && (
          <MyeongriBasisToggle sections={myeongriBasisSections} className="mt-5" />
        )}
      </CardShell>

      {/* 카드 3: 행동 가이드 */}
      <CardShell title="CARD 03 · 행동 가이드" className="border-[#E2D7D0] bg-white">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-4">
            <p className="text-xs font-bold text-[#3D5838]">{ACTION_GUIDE_COPY.dosLabel}</p>
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
            <p className="text-xs font-bold text-[#7A4A3D]">{ACTION_GUIDE_COPY.dontsLabel}</p>
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
        <p className="mt-4 text-xl leading-snug text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {report.emotionPoint.description}
        </p>
        <div className="mt-5 space-y-4">
          {report.emotionPoint.tips.map((tip) => (
            <div key={tip} className="rounded-2xl border border-[#E2D7D0]/80 bg-white/70 px-4 py-3">
              <p className="text-sm leading-relaxed text-[#4A403B]">{tip}</p>
            </div>
          ))}
        </div>
      </CardShell>

      {/* 카드 5: 시간대 운세 */}
      <CardShell title="CARD 05 · 시간대 운세" className="border-[#E2D7D0] bg-white">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-[#8A7E78]">
                {slot.label} · {slot.keyword}
              </p>
              <p className={`mt-2 text-xs leading-relaxed text-[#5A4E48] ${activeSlot === slot.label ? "block" : "line-clamp-3"}`}>
                {slot.description}
              </p>
            </button>
          ))}
        </div>
      </CardShell>
    </section>
  );
}
