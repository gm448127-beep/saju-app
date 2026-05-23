"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { ACTION_GUIDE_COPY } from "@/lib/history-copy";
import HourlyFlowSection, { type HourlyFlowSlot } from "@/components/HourlyFlowSection";
import TodayReadingGuide from "@/components/today/TodayReadingGuide";
import MyeongriBasisToggle from "@/components/MyeongriBasisToggle";
import AxisScorePanel from "@/components/AxisScorePanel";
import ToneDecisionChip from "@/components/ToneDecisionChip";
import { TODAY_CARD_META, TODAY_CARD_SURFACE } from "@/lib/today-page-copy";
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
import {
  apiScoresToAxisAreas,
  clampFortuneScore,
  type TodayApiScores,
} from "@/lib/today-score-display";

function CardShell({
  cardId,
  children,
}: {
  cardId: keyof typeof TODAY_CARD_META;
  children: React.ReactNode;
}) {
  const meta = TODAY_CARD_META[cardId];
  return (
    <article id={`today-card-${cardId}`} className={TODAY_CARD_SURFACE}>
      <div className="flex flex-wrap items-center gap-2">
        {meta.step != null && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F282B] text-xs font-bold text-[#F5F1EB]">
            {meta.step}
          </span>
        )}
        <p className="text-sm font-bold text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {meta.title}
        </p>
      </div>
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
  hourlyFlow?: HourlyFlowSlot[];
  hourlyFlowIntro?: string;
  hourlyPeak?: HourlyFlowSlot;
  hourlyCaution?: HourlyFlowSlot;
  onOpenDetail?: () => void;
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

function buildMyTodaySummary(
  result: TodayFiveCardReportProps["result"],
  report: DailyFortuneContent,
  overall: number,
) {
  const briefing = result?.briefing as TodayBriefingSlice | undefined;
  const summaryText = typeof result?.summary === "string" ? result.summary.trim() : "";
  const flowParts = splitFlowText(report.flow);
  const lead =
    briefing?.oneLine?.trim() ||
    briefing?.headline?.trim() ||
    summaryText ||
    flowParts.headline ||
    getScoreInterpretation(overall, getTodayStatus(overall));

  return {
    sentence: report.sentence?.trim() || "",
    lead,
    grade: briefing?.scoreTone?.trim(),
  };
}

const TIME_SLOT_LABELS: Record<string, string> = {
  오전: "🌅",
  오후: "☀️",
  저녁: "🌆",
  밤: "🌙",
};

export default function TodayFiveCardReport({
  report,
  mode = "personalized",
  result,
  birthKey = "common",
  dateLabel,
  hourlyFlow,
  hourlyFlowIntro,
  hourlyPeak,
  hourlyCaution,
  onOpenDetail,
}: TodayFiveCardReportProps) {
  const isPersonalized = mode === "personalized" && Boolean(result);
  const dateKey = report.seedKey.split("-")[0] ?? "";
  const scores = result?.scores ?? {};
  const apiScores: TodayApiScores | null =
    isPersonalized && typeof scores.overall === "number"
      ? {
          overall: scores.overall,
          wealth: scores.wealth,
          love: scores.love,
          career: scores.career,
          health: scores.health,
          luck: scores.luck,
        }
      : null;
  const axisOverall = buildOverallFromAxis(report);
  const overall =
    isPersonalized && apiScores
      ? clampFortuneScore(apiScores.overall)
      : isPersonalized
        ? clampScore(Number(scores.overall) || axisOverall)
        : axisOverall;
  const status = isPersonalized ? getTodayStatus(overall) : report.toneLabel;
  const myTodaySummary = isPersonalized ? buildMyTodaySummary(result, report, overall) : null;
  const tonePrefix = isPersonalized ? "나의 오늘" : "오늘의 결";
  const areas = apiScores
    ? apiScoresToAxisAreas(apiScores)
    : [
        { key: "relation", label: "관계", score: clampScore(report.axisScores.relation) },
        { key: "decision", label: "결정", score: clampScore(report.axisScores.decision) },
        { key: "emotion", label: "감정", score: clampScore(report.axisScores.emotion) },
        { key: "balance", label: "균형", score: clampScore(report.axisScores.balance) },
      ];
  const savedAreas = {
    relation: areas.find((area) => area.key === "relation")?.score ?? overall,
    decision: areas.find((area) => area.key === "decision")?.score ?? overall,
    emotion: areas.find((area) => area.key === "emotion")?.score ?? overall,
    balance: areas.find((area) => area.key === "balance")?.score ?? overall,
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
  const [compareOpen, setCompareOpen] = useState(false);

  const flowParts = splitFlowText(report.flow);
  const myeongriBasisSections = isPersonalized ? buildTodayMyeongriBasis(result) : [];
  const toneChipTooltip = isPersonalized
    ? buildToneChipTooltip(result, report.toneLabel)
    : null;
  const toneChipLabel = `${tonePrefix} · ${report.toneLabel}`;

  useEffect(() => {
    if (!isPersonalized) return;
    setSaved(hasSavedToday(dateKey, birthKey));
  }, [birthKey, dateKey, isPersonalized]);

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

  const summaryLead = isPersonalized
    ? myTodaySummary?.lead
    : report.emotionPoint.description;

  return (
    <section className="space-y-8">
      {!isPersonalized && (
        <div>
          <h1 className="text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
            오늘의 흐름
          </h1>
          {dateLabel && <p className="mt-1 text-sm text-[#8A7E78]">{dateLabel}</p>}
        </div>
      )}

      {isPersonalized && <TodayReadingGuide />}

      {isPersonalized && (
        <div
          className="flex flex-wrap gap-2 rounded-[26px] border border-[#E8D7C4] bg-[#FAF5ED] px-4 py-3"
          data-pdf-ignore
        >
          <button
            type="button"
            onClick={handleSave}
            className={`min-h-10 rounded-xl px-4 py-2 text-xs font-bold transition ${saved ? "bg-white text-[#8B6F47]" : "bg-[#2F282B] text-white"} ${savePulse ? "scale-105" : ""}`}
          >
            {saved ? "저장됨 ✓" : "저장하기"}
          </button>
          <button
            type="button"
            onClick={() => setCompareOpen((open) => !open)}
            className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-bold ${
              compareOpen ? "border-[#8B6F47] bg-white text-[#8B6F47]" : "border-[#E8D7C4] bg-white text-[#2F282B]"
            }`}
          >
            어제와 비교
          </button>
          <Link
            href="#today-share-actions"
            className="inline-flex min-h-10 items-center rounded-xl border border-[#E8D7C4] bg-white px-4 py-2 text-xs font-bold text-[#2F282B]"
          >
            공유
          </Link>
          <Link
            href="/history"
            className="inline-flex min-h-10 items-center rounded-xl border border-[#E8D7C4] bg-white px-4 py-2 text-xs font-bold text-[#2F282B]"
          >
            기록
          </Link>
        </div>
      )}

      {/* ① 한 줄 요약 */}
      <CardShell cardId="sentence">
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ToneDecisionChip label={toneChipLabel} tooltip={toneChipTooltip} variant="warm" />
          {myTodaySummary?.grade && (
            <span className="rounded-full border border-[#E8D7C4] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
              등급 {myTodaySummary.grade}
            </span>
          )}
          {!isPersonalized && (
            <span className="rounded-full border border-[#E8D7C4] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
              공통 흐름
            </span>
          )}
        </div>
        <h2 className="mt-4 text-2xl leading-snug text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
          {report.sentence}
        </h2>
        {summaryLead && summaryLead !== report.sentence && (
          <p className="mt-3 text-sm leading-relaxed text-[#5A4E48]">{summaryLead}</p>
        )}
        <p className="mt-4 border-t border-[#E8D7C4]/80 pt-4 text-base leading-relaxed text-[#4A403B]">
          <span className="text-[#8B6F47]">&ldquo;</span>
          {report.saveSentence}
          <span className="text-[#8B6F47]">&rdquo;</span>
        </p>
      </CardShell>

      {/* ② 4축 점수 */}
      <CardShell cardId="scores">
        <p className="mt-1 text-xs text-[#8A7E78]">{status}</p>
        <div className="mt-4">
          <AxisScorePanel
            overall={overall}
            areas={areas}
            overallComparison={overallComparison}
            showDelta={isPersonalized}
          />
        </div>

        {isPersonalized && compareOpen && (
          <div className="mt-5 space-y-3 border-t border-[#E8D7C4] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#8B6F47]">어제보다 오늘</p>
              <span className="text-[10px] font-semibold text-[#8A7E78]">
                {hasRealYesterday ? "내 기록 기준" : "예시 흐름"}
              </span>
            </div>
            {overallComparison && (
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-2xl font-bold text-[#A09488]">{overallComparison.previousOverall}</p>
                <span className="text-[#A09488]">→</span>
                <p className="text-3xl font-bold text-[#2F282B]">{overall}</p>
                <span
                  className={`rounded-full bg-white px-2.5 py-1 text-xs font-bold ${
                    overallComparison.delta >= 0 ? "text-[#8B6F47]" : "text-[#7A4A3D]"
                  }`}
                >
                  {overallComparison.delta >= 0 ? "▲" : "▼"} {Math.abs(overallComparison.delta)}
                </span>
              </div>
            )}
            <p className="text-sm leading-relaxed text-[#4A403B]">{yesterdayHeadline}</p>
            <div className="flex flex-wrap gap-2">
              {comparisons.map((item) => {
                const isUp = item.delta >= 0;
                return (
                  <span
                    key={item.key}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E8D7C4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5A4E48]"
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
            <div className="flex gap-2">
              {threeDayTrend.map((item) => (
                <div
                  key={item.label}
                  className={`flex-1 rounded-xl border px-2 py-2 text-center ${
                    item.label === "오늘" ? "border-[#C49A4A]/40 bg-white" : "border-[#E8D7C4] bg-white/60"
                  }`}
                >
                  <p className="text-[10px] text-[#8A7E78]">{item.label}</p>
                  <p className="text-xs font-bold text-[#8B6F47]">{item.status}</p>
                  <p className="text-[10px] text-[#A09488]">{item.score}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardShell>

      {/* ③ 오늘의 흐름 — 오전/오후/저녁/밤 */}
      <CardShell cardId="flow">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {report.timeSlots.map((slot) => (
            <div
              key={slot.label}
              className="rounded-2xl border border-[#E8D7C4] bg-white/70 px-4 py-3"
            >
              <p className="text-xs font-bold text-[#8B6F47]">
                {TIME_SLOT_LABELS[slot.label] ?? ""} {slot.label}
                <span className="ml-1.5 font-normal text-[#8A7E78]">· {slot.keyword}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">{slot.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-lg leading-snug text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {flowParts.headline}
        </p>
        {flowParts.body && (
          <p className="mt-3 text-sm leading-relaxed text-[#4A403B]">{flowParts.body}</p>
        )}
        {myeongriBasisSections.length > 0 && (
          <MyeongriBasisToggle sections={myeongriBasisSections} className="mt-5" />
        )}
      </CardShell>

      {/* ④ 행동 가이드 */}
      <CardShell cardId="action">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E8D7C4] bg-white/70 px-4 py-4">
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
          <div className="rounded-2xl border border-[#E8D7C4] bg-white/70 px-4 py-4">
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
          <div className="rounded-xl border border-[#E8D7C4]/80 bg-white/60 px-3 py-3">
            <p className="text-[11px] font-semibold text-[#8B6F47]">관계</p>
            <p className="mt-1 text-sm text-[#4A403B]">{report.actionGuide.relationTip}</p>
          </div>
          <div className="rounded-xl border border-[#E8D7C4]/80 bg-white/60 px-3 py-3">
            <p className="text-[11px] font-semibold text-[#8B6F47]">일과 돈</p>
            <p className="mt-1 text-sm text-[#4A403B]">{report.actionGuide.workMoneyTip}</p>
          </div>
        </div>
      </CardShell>

      {/* ⑤ 시간대별 운세 */}
      {hourlyFlow && hourlyFlow.length > 0 ? (
        <CardShell cardId="hourly">
          <div className="mt-4 -mx-1">
            <HourlyFlowSection
              hourlyFlow={hourlyFlow}
              hourlyFlowIntro={hourlyFlowIntro}
              hourlyPeak={hourlyPeak}
              hourlyCaution={hourlyCaution}
            />
          </div>
        </CardShell>
      ) : (
        isPersonalized &&
        onOpenDetail && (
          <div className={`${TODAY_CARD_SURFACE} text-center`}>
            <p className="text-sm text-[#5A4E48]">
              출생시간을 넣으면 12시진 그래프가 여기에 표시됩니다.
            </p>
            <button
              type="button"
              onClick={onOpenDetail}
              className="mt-3 rounded-xl bg-[#2F282B] px-4 py-2.5 text-xs font-bold text-white"
            >
              자세히 탭에서 보기
            </button>
          </div>
        )
      )}
    </section>
  );
}
