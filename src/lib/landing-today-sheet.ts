import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { landingBirthKeyFromStored } from "@/lib/landing-birth-payload";
import type { StoredLandingBirth } from "@/lib/landing-preview-storage";
import { pickTodayToneTooltipSource, type TodayToneTooltipSource } from "@/lib/today-basis-helpers";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";

export type LandingTodaySheetData = {
  dateLabel: string;
  report: DailyFortuneContent;
  overall: number;
  toneTooltipBasis?: TodayToneTooltipSource | null;
  birthKey?: string | null;
};

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

/** @deprecated landingBirthKeyFromStored 사용 */
export function landingBirthKey(payload: {
  year: number;
  month: number;
  day: number;
  gender: "남" | "여";
}) {
  return landingBirthKeyFromStored({
    year: String(payload.year),
    month: String(payload.month),
    day: String(payload.day),
    gender: payload.gender,
    timeMode: "none",
  });
}

export { landingBirthKeyFromStored };

export function overallFromReport(report: DailyFortuneContent) {
  return clampScore(
    report.axisScores.relation * 0.3 +
      report.axisScores.decision * 0.3 +
      report.axisScores.emotion * 0.2 +
      report.axisScores.balance * 0.2,
  );
}

export function buildSheetFromApi(
  json: {
    date?: string;
    scores?: { overall?: number };
    dailyReport?: DailyFortuneContent;
  } & Record<string, unknown>,
  birthKey?: string | null,
): LandingTodaySheetData {
  const report = json.dailyReport;
  if (!report?.sentence) {
    throw new Error("리포트를 만들지 못했어요.");
  }

  return {
    dateLabel: json.date?.trim() || "오늘",
    report,
    overall:
      typeof json.scores?.overall === "number"
        ? clampScore(json.scores.overall)
        : overallFromReport(report),
    toneTooltipBasis: pickTodayToneTooltipSource(json),
    birthKey: birthKey ?? null,
  };
}

export function buildSheetFromPreview(
  preview: { sentence: string; toneLabel: string },
  dateLabel = "오늘",
  birthKey?: string | null,
): LandingTodaySheetData {
  const fallback = buildDailyFortuneContent();
  const report: DailyFortuneContent = {
    ...fallback,
    seedKey: "landing-fallback",
    toneLabel: preview.toneLabel,
    saveSentence: preview.sentence,
    sentence: preview.sentence,
    flow: preview.sentence,
  };

  return {
    dateLabel,
    report,
    overall: overallFromReport(report),
    toneTooltipBasis: null,
    birthKey: birthKey ?? null,
  };
}
