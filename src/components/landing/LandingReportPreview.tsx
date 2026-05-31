"use client";

import { useMemo } from "react";
import {
  LandingReportCards,
  type LandingReportCardItem,
} from "@/components/landing/LandingReportCards";
import type { LandingTodaySheetData } from "@/lib/landing-today-sheet";

function splitGuideLines(guide?: string): string[] {
  if (!guide?.trim()) return [];
  return guide
    .split("\n")
    .map((line) => line.replace(/^·\s*/, "").trim())
    .filter(Boolean);
}

function buildPersonalReportItems(data: LandingTodaySheetData): LandingReportCardItem[] {
  const { report } = data;
  const dontLine = splitGuideLines(report.actionGuide.donts)[0] ?? "감정이 올라온 상태에서 내리는 즉흥 결정";
  const dosLines = splitGuideLines(report.actionGuide.dos);
  const bestSlot =
    report.timeSlots.find((slot) => slot.label === "오후") ??
    report.timeSlots.find((slot) => slot.label === "오전") ??
    report.timeSlots[0];

  return [
    {
      title: "오늘의 운세",
      body: report.sentence,
      subLabel: report.flow,
    },
    {
      title: "오늘 가장 좋은 시간",
      body: bestSlot ? `${bestSlot.label} · ${bestSlot.keyword}` : "오늘 안, 집중이 잘 맞는 시간",
      subLabel: bestSlot?.description ?? report.actionGuide.workMoneyTip,
      bullets: dosLines.length > 0 ? dosLines.slice(0, 3) : undefined,
    },
    {
      title: "오늘 피해야 할 행동",
      body: dontLine,
      subLabel: report.actionGuide.relationTip || report.emotionPoint.description,
    },
  ];
}

export function LandingReportPreview({ data }: { data: LandingTodaySheetData }) {
  const items = useMemo(() => buildPersonalReportItems(data), [data]);

  return (
    <section className="landing-report" aria-label="오늘의 운세 리포트">
      <header className="landing-report__header">
        <p className="landing-report__brand">UNMYEONG BISEO</p>
        <p className="landing-report__date">{data.dateLabel}</p>
      </header>
      <LandingReportCards
        sectionTitle="당신 사주 기준 · 오늘 리포트"
        toneLabel={data.report.toneLabel}
        items={items}
        variant="personal"
      />
    </section>
  );
}
