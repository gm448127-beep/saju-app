import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import AxisScorePanel from "@/components/AxisScorePanel";
import ToneDecisionChip from "@/components/ToneDecisionChip";
import { TODAY_EMPTY_COPY } from "@/lib/history-copy";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { buildToneChipTooltip, type TodayToneTooltipSource } from "@/lib/today-basis-helpers";
import { getTodayDateKey } from "@/lib/today-pattern-helpers";
import {
  buildOverallComparison,
  getPreviousDayRecord,
  getTodayHistory,
} from "@/lib/today-report-helpers";

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

function getPreviewScores(content: DailyFortuneContent) {
  const overall = clampScore(
    content.axisScores.relation * 0.3 +
      content.axisScores.decision * 0.3 +
      content.axisScores.emotion * 0.2 +
      content.axisScores.balance * 0.2,
  );
  return {
    overall,
    areas: [
      { label: "관계", score: clampScore(content.axisScores.relation) },
      { label: "결정", score: clampScore(content.axisScores.decision) },
      { label: "감정", score: clampScore(content.axisScores.emotion) },
      { label: "균형", score: clampScore(content.axisScores.balance) },
    ],
  };
}

function getTodayStatus(score: number) {
  if (score >= 85) return "상승";
  if (score >= 70) return "안정";
  if (score >= 55) return "보통";
  return "주의";
}

function formatTodayLabel(date = new Date()) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${weekdays[date.getDay()]})`;
}

function PanelShell({
  embedMode,
  className,
  children,
}: {
  embedMode: boolean;
  className: string;
  children: ReactNode;
}) {
  if (embedMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link href="/today#personalize" className={className}>
      {children}
    </Link>
  );
}

interface HomeResultPreviewProps {
  content: DailyFortuneContent;
  displayName?: string;
  isPersonalized?: boolean;
  /** 프로필은 있으나 맞춤 API 로딩 중 */
  isLoadingPersonalized?: boolean;
  /** 맞춤 API에서 받은 일간·일진·십성 (칩 툴팁용) */
  toneTooltipBasis?: TodayToneTooltipSource | null;
  /** 맞춤 API 종합 점수 (없으면 축 점수로 계산) */
  apiOverall?: number | null;
  /** 어제 대비 비교용 birthKey */
  birthKey?: string | null;
  /** 랜딩 임베드 — 앱 링크 없이 미리보기만 */
  embedMode?: boolean;
  /** 하단 TODAY / WEEKLY 미니 카드 */
  showMiniCards?: boolean;
}

export default function HomeResultPreview({
  content,
  displayName,
  isPersonalized = false,
  isLoadingPersonalized = false,
  toneTooltipBasis = null,
  apiOverall = null,
  birthKey = null,
  embedMode = false,
  showMiniCards = false,
}: HomeResultPreviewProps) {
  const scores = getPreviewScores(content);
  const displayOverall =
    isPersonalized && apiOverall != null ? clampScore(apiOverall) : scores.overall;
  const statusLabel = content.toneLabel || getTodayStatus(displayOverall);

  const overallComparison = useMemo(() => {
    if (!isPersonalized || !birthKey) return null;
    const previous = getPreviousDayRecord(getTodayHistory(), getTodayDateKey(), birthKey);
    return buildOverallComparison(previous, displayOverall);
  }, [isPersonalized, birthKey, displayOverall]);
  const toneChipTooltip = isPersonalized
    ? buildToneChipTooltip(toneTooltipBasis, content.toneLabel)
    : null;

  const panelClass =
    "group relative overflow-hidden rounded-[26px] border border-[#E8D7C4] bg-[#FFF8EE] px-5 py-5 shadow-[0_12px_32px_rgba(61,51,56,0.05)]";
  const sideClass =
    "group flex flex-col rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_12px_32px_rgba(61,51,56,0.05)]";
  const interactiveClass = embedMode ? "" : " transition hover:-translate-y-0.5";

  const weeklyTrend =
    content.weekly.trend.length >= 7
      ? content.weekly.trend.slice(0, 7)
      : [...content.weekly.trend, ...Array(Math.max(0, 7 - content.weekly.trend.length)).fill(displayOverall)];
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <section className="@container overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white p-4 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          {embedMode ? (
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#8A7E78]">AI SAJU REPORT</p>
          ) : null}
          <div className={`flex flex-wrap items-center gap-2${embedMode ? " mt-1" : ""}`}>
            <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">TODAY PREVIEW</p>
            {isPersonalized ? (
              <span className="rounded-full border border-[#8B6F47]/40 bg-[#FFF8EE] px-2 py-0.5 text-[10px] font-bold text-[#8B6F47]">
                {TODAY_EMPTY_COPY.badgeMyToday}
              </span>
            ) : (
              <span className="rounded-full border border-[#D9C8C0] bg-[#FFF8EE] px-2 py-0.5 text-[10px] font-bold text-[#6B5E58]">
                {TODAY_EMPTY_COPY.badgeCommon}
              </span>
            )}
          </div>
          <h2 className="mt-1 text-xl leading-tight text-[#2F282B] sm:text-2xl" style={{ fontFamily: "Jua, sans-serif" }}>
            {embedMode
              ? "당신의 오늘"
              : isPersonalized && displayName
                ? `${displayName}의 오늘`
                : isLoadingPersonalized && displayName
                  ? `${displayName}의 오늘`
                  : "오늘의 흐름은 이렇게 읽힙니다"}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#8A7E78]">
            {isLoadingPersonalized
              ? "입력하신 사주 기준으로 오늘 흐름을 맞추는 중입니다."
              : isPersonalized
                ? "아래 점수·한 줄·행동은 모두 입력하신 사주 기준입니다."
                : `${TODAY_EMPTY_COPY.ctaLead}\n→ ${TODAY_EMPTY_COPY.ctaAction}`}
          </p>
        </div>
        {!embedMode ? (
          <Link
            href="/today#personalize"
            className="inline-flex items-center gap-2 rounded-full border border-[#D9C8C0] bg-[#FAF8F5] px-4 py-2 text-xs font-bold text-[#2F282B] transition hover:bg-white"
          >
            {isPersonalized ? "오늘 리포트 보기" : TODAY_EMPTY_COPY.ctaButton}
            <span className="text-base leading-none">›</span>
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 @[34rem]:grid-cols-[1.15fr_0.88fr]">
        <PanelShell embedMode={embedMode} className={`${panelClass}${interactiveClass}`}>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-[#8B6F47]">
              <ToneDecisionChip
                label={`오늘의 결 · ${content.toneLabel}`}
                tooltip={toneChipTooltip}
                size="md"
                variant="white"
                className="relative z-10 bg-white/70"
              />
              {isPersonalized ? (
                <span className="rounded-full border border-[#8B6F47]/30 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#8B6F47]">
                  {TODAY_EMPTY_COPY.badgeMyToday}
                </span>
              ) : (
                <span className="rounded-full border border-[#D9C8C0] bg-white/60 px-2 py-0.5 text-[10px] text-[#6B5E58]">
                  {TODAY_EMPTY_COPY.badgeTodayAll}
                </span>
              )}
              <span className="whitespace-nowrap text-[#8A7E78]">{formatTodayLabel()}</span>
            </div>

            <div className="my-4 h-px bg-[#D9C8C0]/80" />

            <p className="text-xs font-bold text-[#8B6F47]">오늘의 한 줄</p>
            <h3 className="mt-2 text-2xl leading-tight text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
              {content.sentence}
            </h3>

            <div className="relative mt-5">
              {!isPersonalized && (
                <div className="mb-2">
                  <p className="text-[11px] font-bold text-[#8B6F47]">{TODAY_EMPTY_COPY.scoreSectionLabel}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#8A7E78]">{TODAY_EMPTY_COPY.scoreDisclaimer}</p>
                </div>
              )}
              {isPersonalized && (
                <p className="mb-2 text-[11px] font-bold text-[#8B6F47]">내 사주 기준 · 오늘 점수</p>
              )}
              <div className="relative">
                {!isPersonalized && (
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-white/35 backdrop-blur-[1px]" />
                )}
                <AxisScorePanel
                  overall={displayOverall}
                  areas={scores.areas.map((area) => ({
                    key: area.label,
                    label: area.label,
                    score: area.score,
                  }))}
                  overallLabel={isPersonalized ? "종합" : "종합 · 예시"}
                  overallComparison={overallComparison}
                  showDelta={isPersonalized}
                  className="relative bg-white/80"
                />
                <p className="relative z-10 mt-2 text-sm font-bold text-[#8B6F47]">{statusLabel}</p>
              </div>
              {!isPersonalized && (
                <div className="relative z-10 mt-3 rounded-xl border border-[#E8D7C4] bg-[#FFF8EE] px-3 py-2.5">
                  <p className="text-xs font-bold text-[#2F282B]">{TODAY_EMPTY_COPY.ctaLead}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#8B6F47]">→ {TODAY_EMPTY_COPY.ctaAction}</p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-[#E2D7D0] bg-white/70 px-4 py-3">
              <p className="text-xs font-bold text-[#8B6F47]">오늘의 흐름</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">{content.flow}</p>
            </div>
          </div>
        </PanelShell>

        <PanelShell embedMode={embedMode} className={`${sideClass}${interactiveClass}`}>
          <p className="text-xs font-bold text-[#8B6F47]">지금 잘 맞는 움직임</p>
          <p className="mt-1 text-sm text-[#8A7E78]">오늘의 흐름에 맞게 바로 적용할 수 있는 선택들</p>

          <div className="mt-4 grid grid-cols-1 gap-2.5">
            {[
              ["권하는 움직임", content.actionGuide.dos],
              ["늦추는 편이 좋은 것", content.actionGuide.donts],
              ["관계의 결", content.actionGuide.relationTip],
              ["일과 돈의 기준", content.actionGuide.workMoneyTip],
            ].map(([label, text]) => (
              <div key={label} className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-3.5 py-3">
                <p className="text-[11px] font-semibold text-[#8B6F47]">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#4A403B]">{text}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-4 rounded-2xl border border-[#E2D7D0] bg-[#FFFDF9] px-4 py-3">
            <p className="text-xs font-bold text-[#8B6F47]">감정의 중심</p>
            <div className="mt-1">
              <ToneDecisionChip
                label={`오늘의 결 · ${content.toneLabel}`}
                tooltip={toneChipTooltip}
                size="md"
                variant="white"
              />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#5A4E48]">{content.emotionPoint.description}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 @[22rem]:grid-cols-4">
            {content.timeSlots.map((slot) => (
              <div
                key={slot.label}
                className="rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-2.5 py-2.5 text-center"
              >
                <p className="text-[10px] text-[#8A7E78]">{slot.label}</p>
                <p className="mt-0.5 text-sm text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                  {slot.keyword}
                </p>
              </div>
            ))}
          </div>

          {!embedMode ? (
            <p className="mt-4 text-xs font-bold text-[#8B6F47] transition group-hover:translate-x-0.5">
              오늘의 리포트 이어 읽기 ›
            </p>
          ) : null}
        </PanelShell>
      </div>

      {showMiniCards ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#8B6F47]">TODAY</p>
            <h3 className="mt-2 text-base font-bold text-[#2F282B]">오늘의 한 줄</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">{content.sentence}</p>
            {!embedMode ? (
              <p className="mt-3 text-xs font-bold text-[#8B6F47]">자세히 보기 ›</p>
            ) : null}
          </div>

          <div className="rounded-[22px] border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#8B6F47]">WEEKLY</p>
            <h3 className="mt-2 text-base font-bold text-[#2F282B]">이번 주의 흐름</h3>
            <div className="mt-3 flex h-8 items-end gap-1.5">
              {weeklyTrend.map((value, index) => (
                <div key={index} className="relative flex flex-1 flex-col items-center gap-0.5">
                  {index === todayIndex ? (
                    <span className="absolute -top-2.5 h-1.5 w-1.5 rounded-full bg-[#333333] ring-2 ring-[#f5f2ed]" />
                  ) : null}
                  <div
                    className="w-full rounded-t-full bg-[#8B6F47]"
                    style={{ height: `${Math.max(value / 3, 10)}px`, opacity: 0.45 + index * 0.06 }}
                  />
                  <span className="text-[9px] text-[#8A7E78]">{"월화수목금토일"[index]}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">
              {content.weekly.summary || `${content.weekly.keyDay}에 흐름이 모입니다.`}
            </p>
            {!embedMode ? (
              <p className="mt-3 text-xs font-bold text-[#8B6F47]">주간 보기 ›</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
