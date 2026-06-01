import { describe, expect, it } from "vitest";
import { buildTodayExpertBasisGuide } from "@/lib/today-expert-basis-guide";
import type { DailyFortuneContent } from "@/lib/today-content-engine";

const mockReport: DailyFortuneContent = {
  seedKey: "test",
  toneKey: "ORGANIZE",
  toneLabel: "정리",
  status: "정리",
  saveSentence: "정리",
  axisScores: { relation: 60, decision: 70, emotion: 55, balance: 60 },
  sentence: "x",
  flow: "x",
  actionGuide: {
    dos: "정리",
    donts: "서두름",
    relationTip: "짧게 답하세요",
    workMoneyTip: "조건을 확인하세요",
  },
  emotionPoint: { description: "e", tips: [] },
  timeSlots: [],
  weekly: { trend: [], keyDay: "월", summary: "" },
  recommendation: { title: "t", text: "t", href: "/today" },
};

describe("today-expert-basis-guide", () => {
  it("4단계 가이드를 생성한다", () => {
    const guide = buildTodayExpertBasisGuide(
      {
        todaySipsin: "정관",
        todayJiSipsin: "편재",
        myDayGan: "경(庚)",
        myElement: "금",
        todayGan: "갑(甲)",
        todayJi: "자(子)",
        sipsinTitle: "질서·책임의 날",
        pillars: { day: "경진", year: "병자", month: "정축", hour: "무진" },
        ohaengCount: { 목: 1, 화: 1, 토: 3, 금: 2, 수: 1 },
        scores: { career: 55, wealth: 60, love: 58 },
      },
      mockReport,
    );

    expect(guide).not.toBeNull();
    expect(guide!.step1.paragraphs[0]).toContain("정관");
    expect(guide!.step1.paragraphs.join(" ")).toMatch(/책임|규칙|검증/);
    expect(guide!.step2.bullets.length).toBeGreaterThanOrEqual(3);
    expect(guide!.step3.paragraphs.join(" ")).toContain("운명비서");
    expect(guide!.step4.rows.find((r) => r.label === "일간")?.value).toContain("경");
  });
});
