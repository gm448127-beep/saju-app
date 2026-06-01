import type { DailyFortuneContent } from "../lib/today-content-engine";

export type LandingTodaySheetData = {
  dateLabel: string;
  report: DailyFortuneContent;
  overall: number;
};

function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

export function overallFromReport(report: DailyFortuneContent) {
  return clampScore(
    report.axisScores.relation * 0.3 +
      report.axisScores.decision * 0.3 +
      report.axisScores.emotion * 0.2 +
      report.axisScores.balance * 0.2,
  );
}

export function buildSheetFromApi(json: {
  date?: string;
  scores?: { overall?: number };
  dailyReport?: DailyFortuneContent;
}): LandingTodaySheetData {
  const report = json.dailyReport;
  if (!report?.sentence) {
    throw new Error("由ы룷?몃? 留뚮뱾吏 紐삵뻽?댁슂.");
  }

  return {
    dateLabel: json.date?.trim() || "?ㅻ뒛",
    report,
    overall:
      typeof json.scores?.overall === "number"
        ? clampScore(json.scores.overall)
        : overallFromReport(report),
  };
}

export function buildSheetFromPreview(
  preview: { sentence: string; toneLabel: string },
  dateLabel = "?ㅻ뒛",
): LandingTodaySheetData {
  const report: DailyFortuneContent = {
    seedKey: "landing-fallback",
    toneKey: "balance",
    toneLabel: preview.toneLabel,
    status: "neutral",
    saveSentence: preview.sentence,
    axisScores: { relation: 72, decision: 68, emotion: 70, balance: 74 },
    sentence: preview.sentence,
    flow: preview.sentence,
    actionGuide: {
      dos: "?ㅻ뒛???먮쫫??留욎떠 ??媛吏?⑸쭔 ?뺣━??蹂댁꽭??",
      donts: "?쒓볼踰덉뿉 紐⑤뱺 寃곗젙???대━???섏? 留덉꽭??",
      relationTip: "",
      workMoneyTip: "",
    },
    emotionPoint: { description: "", tips: [] },
    timeSlots: [],
    weekly: { trend: [], keyDay: "", summary: "" },
    recommendation: { title: "", text: "", href: "/" },
  };

  return {
    dateLabel,
    report,
    overall: overallFromReport(report),
  };
}

