import { describe, expect, it } from "vitest";
import { buildTodaySecretaryCopySync } from "@/lib/today-secretary-copy-engine";
import type { DailyFortuneContent } from "@/lib/today-content-engine";

const mockReport: DailyFortuneContent = {
  seedKey: "test",
  toneKey: "DECIDE",
  toneLabel: "결정",
  status: "상승",
  saveSentence: "오늘은 선택을 분명히 하세요.",
  axisScores: { relation: 60, decision: 70, emotion: 55, balance: 60 },
  sentence: "시적인 한 줄",
  flow: "시적인 흐름",
  actionGuide: {
    dos: "미뤄둔 결정 하나를 정하세요",
    donts: "감정 위에서 확답하지 마세요",
    relationTip: "짧고 분명한 답이 관계를 가볍게 만듭니다",
    workMoneyTip: "숫자와 일정을 한 번 더 확인하세요",
  },
  emotionPoint: { description: "감정", tips: [] },
  timeSlots: [],
  weekly: { label: "주", summary: "주간" },
  recommendation: { title: "오늘", text: "읽기", href: "/today" },
};

describe("today-secretary-copy-engine", () => {
  it("무료·유료 카피에 사업/돈/관계 맥락과 행동 문장이 포함된다", () => {
    const copy = buildTodaySecretaryCopySync(
      {
        scores: { overall: 65, career: 55, wealth: 60, love: 58, health: 62, luck: 64 },
        todaySipsin: "정관",
        todayJiSipsin: "편재",
        relationDetail: "규율과 책임의 기운",
        summary: "오늘은 차분히 정리하세요",
      },
      mockReport,
    );

    expect(copy.coreMessage).toMatch(/오늘은/);
    expect(copy.coreMessage.split(/[.!?]/).filter(Boolean).length).toBeLessThanOrEqual(2);
    expect(copy.flowNarrative.length).toBeGreaterThan(20);
    expect(copy.warningLine.length).toBeGreaterThan(10);
    expect(copy.shake).toMatch(/흔드는 것/);
    expect(copy.myeongri).toMatch(/일진|십성|기운/);
    expect(copy.strategy).toMatch(/그래서 오늘은/);

    const combined = `${copy.flowNarrative} ${copy.shake} ${copy.strategy}`;
    expect(combined).toMatch(/사업|돈|인간관계|연애|일·|관계/);
  });
});
