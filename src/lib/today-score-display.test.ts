import { describe, expect, it } from "vitest";
import { apiScoresToAxisAreas, birthKeyFromTodayPayload, serializeTodayPayload } from "@/lib/today-score-display";
import { generateTodayToneReport } from "@/lib/today-tone-engine";

describe("today-score-display", () => {
  it("maps API scores to four axis areas with same overall", () => {
    const areas = apiScoresToAxisAreas({
      overall: 72,
      love: 80,
      career: 70,
      health: 65,
      wealth: 75,
      luck: 68,
    });
    expect(areas.find((a) => a.key === "relation")?.score).toBe(80);
    expect(areas.find((a) => a.key === "decision")?.score).toBe(70);
    expect(areas.find((a) => a.key === "emotion")?.score).toBe(65);
    expect(areas.find((a) => a.key === "balance")?.score).toBe(72);
  });

  it("birthKey distinguishes hour vs no hour", () => {
    const withHour = birthKeyFromTodayPayload({
      year: 1990,
      month: 1,
      day: 1,
      gender: "남",
      hour: 9,
      minute: 0,
    });
    const noHour = birthKeyFromTodayPayload({
      year: 1990,
      month: 1,
      day: 1,
      gender: "남",
    });
    expect(withHour).not.toBe(noHour);
    expect(serializeTodayPayload({ year: 1, month: 2, day: 3, gender: "여", hour: 9 })).toContain("9");
  });
});

describe("today-tone-engine API score sync", () => {
  it("uses API scores for tone axis when profile.scores provided", () => {
    const report = generateTodayToneReport(new Date("2026-05-19T12:00:00+09:00"), {
      scores: {
        overall: 81,
        love: 85,
        career: 78,
        health: 72,
        wealth: 80,
        luck: 76,
      },
    });
    expect(report.scores.total).toBe(81);
    expect(report.scores.relation).toBe(85);
    expect(report.scores.decision).toBe(78);
    expect(report.scores.emotion).toBe(72);
    expect(report.scores.balance).toBe(78);
  });
});
