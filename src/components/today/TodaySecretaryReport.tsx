"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import TomorrowPreviewTeaser from "@/components/TomorrowPreviewTeaser";
import TodayDomainFortuneAccordion from "@/components/today/TodayDomainFortuneAccordion";
import TodayExpertBasisAccordion from "@/components/today/TodayExpertBasisAccordion";
import TodayPremiumDetailSections from "@/components/today/TodayPremiumDetailSections";
import TodayReadingGuide from "@/components/today/TodayReadingGuide";
import { UnmyeongFourCardInsights } from "@/components/UnmyeongFourCardInsights";
import { buildTodayExpertBasisGuide } from "@/lib/today-expert-basis-guide";
import {
  buildTodayAvoidChoice,
  buildTodayDecisionPoints,
  buildTodayDomainCards,
  buildTodayLuckyTime,
  buildTodaySecretaryPremiumAdvice,
  TODAY_PREMIUM_SECTIONS,
  type TodayApiResult,
} from "@/lib/today-secretary-report";
import { TODAY_DECISION_TEASER } from "@/lib/today-page-copy";
import { getTodayDateKey } from "@/lib/today-pattern-helpers";
import { buildTomorrowPreview, profileFromTodayApiResult } from "@/lib/tomorrow-preview";
import {
  clampFortuneScore,
  type TodayApiScores,
} from "@/lib/today-score-display";
import {
  clampScore,
  getTodayStatus,
  hasSavedToday,
  saveTodayRecord,
} from "@/lib/today-report-helpers";

type TodaySecretaryReportProps = {
  report: DailyFortuneContent;
  result: TodayApiResult;
  birthKey: string;
  dateLabel?: string;
};

function buildOverallFromAxis(report: DailyFortuneContent) {
  return clampScore(
    report.axisScores.relation * 0.3 +
      report.axisScores.decision * 0.3 +
      report.axisScores.emotion * 0.2 +
      report.axisScores.balance * 0.2,
  );
}

export default function TodaySecretaryReport({
  report,
  result,
  birthKey,
  dateLabel,
}: TodaySecretaryReportProps) {
  const dateKey = getTodayDateKey();
  const scores = result.scores ?? {};
  const overall = clampFortuneScore(Number(scores.overall) || buildOverallFromAxis(report));
  const status = getTodayStatus(overall);

  const decisionPoints = useMemo(() => buildTodayDecisionPoints(result, report), [result, report]);
  const domainCards = useMemo(() => buildTodayDomainCards(result), [result, report]);
  const avoidChoice = useMemo(() => buildTodayAvoidChoice(result, report), [result, report]);
  const luckyTime = useMemo(() => buildTodayLuckyTime(result, report), [result, report]);
  const premiumAdvice = useMemo(
    () => buildTodaySecretaryPremiumAdvice(result, report),
    [result, report],
  );
  const expertGuide = useMemo(
    () => buildTodayExpertBasisGuide(result, report),
    [result, report],
  );

  const tomorrowPreview = useMemo(
    () =>
      buildTomorrowPreview(
        profileFromTodayApiResult(result as { todaySipsin?: string; myElement?: string }),
        new Date(),
        report.toneKey,
      ),
    [result, report.toneKey],
  );

  const [saved, setSaved] = useState(false);
  const [savePulse, setSavePulse] = useState(false);

  const savedAreas = useMemo(() => {
    const apiScores = scores as TodayApiScores;
    return {
      relation: clampScore(apiScores.love ?? report.axisScores.relation),
      decision: clampScore(apiScores.career ?? report.axisScores.decision),
      emotion: clampScore(apiScores.health ?? report.axisScores.emotion),
      balance: clampScore(apiScores.luck ?? report.axisScores.balance),
    };
  }, [report.axisScores, scores]);

  useEffect(() => {
    setSaved(hasSavedToday(dateKey, birthKey));
  }, [birthKey, dateKey]);

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
    setSaved(true);
  }, [
    birthKey,
    dateKey,
    overall,
    report.flow,
    report.sentence,
    report.toneKey,
    report.toneLabel,
    report.saveSentence,
    savedAreas,
    status,
  ]);

  const handleSave = () => {
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

  const scrollToPremium = () => {
    document.getElementById("today-premium-decision")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="today-secretary" aria-label="오늘의 운세 리포트">
      <TodayReadingGuide />

      <div className="today-secretary__toolbar" data-pdf-ignore>
        <button
          type="button"
          onClick={handleSave}
          className={`today-secretary__toolbar-btn today-secretary__toolbar-btn--primary ${savePulse ? "scale-105" : ""}`}
        >
          {saved ? "저장됨 ✓" : "저장하기"}
        </button>
        <Link href="#today-share-actions" className="today-secretary__toolbar-btn today-secretary__toolbar-btn--ghost">
          공유
        </Link>
        <Link href="/history" className="today-secretary__toolbar-btn today-secretary__toolbar-btn--ghost">
          기록
        </Link>
      </div>

      {/* 무료 영역 — 헌법 4단 (랜딩과 동일 카피) */}
      <div className="today-secretary__four-card">
        <UnmyeongFourCardInsights
          report={report}
          dateLabel={dateLabel ? `${dateLabel} · ${report.toneLabel} · 왜 이러는지` : undefined}
        />
      </div>

      {/* 유료 구분 + 티저 */}
      <div className="today-secretary__divider" id="today-premium-teaser">
        <div className="today-secretary__teaser">
          <h2 className="today-secretary__teaser-title">{TODAY_DECISION_TEASER.title}</h2>
          <div className="today-secretary__teaser-body">
            {TODAY_DECISION_TEASER.body.map((line, index) =>
              line === "" ? (
                <span key={`gap-${index}`} className="today-secretary__teaser-gap" aria-hidden />
              ) : (
                <p key={line} className="today-secretary__teaser-line">
                  {line}
                </p>
              ),
            )}
          </div>
          <button type="button" onClick={scrollToPremium} className="today-secretary__teaser-btn">
            {TODAY_DECISION_TEASER.cta}
          </button>
          <p className="today-secretary__teaser-scroll">{TODAY_DECISION_TEASER.hint}</p>
        </div>
      </div>

      {/* 유료 영역 — 본문 항상 표시 (잠금·블러 없음) */}
      <div className="today-secretary__premium scroll-mt-24" id="today-premium">
        <p className="text-sm leading-relaxed text-[#5A4E48]">
          오늘 선택을 돕는 상세 리포트예요. 계약·연락·투자 같은 고민부터 행운 시간까지 이어서 읽어 보세요.
        </p>

        <article id="today-premium-decision" className="today-secretary__premium-block">
          <div className="today-secretary__premium-head">
            <h3>{TODAY_PREMIUM_SECTIONS[0].title}</h3>
          </div>
          <div className="today-secretary__premium-body">
            <ul className="today-secretary__decision-list">
              {decisionPoints.map((item) => (
                <li key={item.topic} className="today-secretary__decision-item">
                  <p className="today-secretary__decision-topic">{item.topic}</p>
                  <p className="today-secretary__decision-text">{item.guidance}</p>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="today-secretary__premium-block">
          <div className="today-secretary__premium-head">
            <h3>{TODAY_PREMIUM_SECTIONS[1].title}</h3>
          </div>
          <div className="today-secretary__premium-body today-secretary__premium-body--flush">
            <TodayDomainFortuneAccordion cards={domainCards} result={result} />
          </div>
        </article>

        <article className="today-secretary__premium-block">
          <div className="today-secretary__premium-head">
            <h3>{TODAY_PREMIUM_SECTIONS[2].title}</h3>
          </div>
          <div className="today-secretary__premium-body">
            <p className="today-secretary__body">{avoidChoice}</p>
          </div>
        </article>

        <article className="today-secretary__premium-block">
          <div className="today-secretary__premium-head">
            <h3>{TODAY_PREMIUM_SECTIONS[3].title}</h3>
          </div>
          <div className="today-secretary__premium-body">
            <p className="text-sm text-[#8A7E78]">{luckyTime.hourLabel}</p>
            <span className="today-secretary__lucky-time">{luckyTime.rangeLabel}</span>
            <p className="today-secretary__body mt-3">
              <span className="font-semibold text-[#8B6F47]">추천 행동 · </span>
              {luckyTime.recommendedAction}
            </p>
          </div>
        </article>

        <article className="today-secretary__premium-block">
          <div className="today-secretary__premium-head">
            <h3>{TODAY_PREMIUM_SECTIONS[4].title}</h3>
          </div>
          <div className="today-secretary__premium-body today-secretary__premium-advice">
            <div className="today-secretary__advice-part">
              <p className="today-secretary__advice-part-label">1. 오늘 당신을 흔드는 것</p>
              <p className="today-secretary__body">{premiumAdvice.shake}</p>
            </div>
            <div className="today-secretary__advice-part">
              <p className="today-secretary__advice-part-label">2. 왜 이런 흐름이 나타나는가</p>
              <p className="today-secretary__body">{premiumAdvice.myeongri}</p>
            </div>
            <div className="today-secretary__advice-part">
              <p className="today-secretary__advice-part-label">3. 그래서 어떻게 움직일까</p>
              <p className="today-secretary__body">{premiumAdvice.strategy}</p>
            </div>
          </div>
        </article>

        <TodayPremiumDetailSections result={result} />
      </div>

      <TodayExpertBasisAccordion guide={expertGuide} />

      <TomorrowPreviewTeaser preview={tomorrowPreview} />
    </section>
  );
}
