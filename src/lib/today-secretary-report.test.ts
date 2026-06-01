import { describe, expect, it } from "vitest";
import { buildTodayExpertBasisGuide } from "@/lib/today-expert-basis-guide";
import {
  buildTodayAvoidChoice,
  buildTodayDecisionPoints,
  buildTodayDomainCards,
  buildTodayFreeContent,
  buildTodayLuckyTime,
  buildTodaySecretaryAdvice,
} from "@/lib/today-secretary-report";

describe("today-secretary-report builders", () => {
  it("handles production-like API payload without throwing", async () => {
    const res = await fetch("https://www.unmyeongbiseo.kr/api/today", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: 1995, month: 1, day: 1, gender: "남", hour: 9 }),
    });
    const result = await res.json();
    const report = result.dailyReport;

    expect(() => buildTodayFreeContent(result, report)).not.toThrow();
    expect(() => buildTodayDecisionPoints(result, report)).not.toThrow();
    expect(() => buildTodayDomainCards(result)).not.toThrow();
    expect(() => buildTodayAvoidChoice(result, report)).not.toThrow();
    expect(() => buildTodayLuckyTime(result, report)).not.toThrow();
    expect(() => buildTodaySecretaryAdvice(result, report)).not.toThrow();
    expect(() => buildTodayExpertBasisGuide(result, report)).not.toThrow();

    const free = buildTodayFreeContent(result, report);
    expect(free.coreMessage.length).toBeGreaterThan(0);
  });

  it("handles minimal report payload", () => {
    const report = {
      seedKey: "test",
      toneKey: "decision" as const,
      toneLabel: "결정",
      status: "stable" as const,
      saveSentence: "오늘은 한 가지만 정하세요.",
      axisScores: { relation: 60, decision: 60, emotion: 60, balance: 60 },
      sentence: "오늘은 정리가 답입니다.",
      flow: "서두르지 마세요.",
      actionGuide: {
        dos: "천천히",
        donts: "서두르지 마세요",
        relationTip: "관계 팁",
        workMoneyTip: "돈 팁",
      },
      emotionPoint: { description: "감정", tips: [] },
      timeSlots: [],
      weekly: { trend: [], keyDay: "월요일", summary: "" },
      recommendation: { title: "오늘", text: "흐름", href: "/today" },
    };
    const result = { scores: { overall: 60, wealth: 60, love: 60, career: 60, health: 60, luck: 60 } };

    expect(() => buildTodayFreeContent(result, report)).not.toThrow();
    expect(() => buildTodayDecisionPoints(result, report)).not.toThrow();
  });
});
