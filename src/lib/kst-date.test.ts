import { describe, expect, it } from "vitest";
import { buildLast7DaysFlow } from "@/lib/today-pattern-helpers";
import { getKstDateParts, getTodayDateKeyKst, shiftKstDateKey } from "@/lib/kst-date";
import type { SavedTodayRecord } from "@/lib/today-report-helpers";

describe("kst-date", () => {
  it("UTC 자정 직전은 KST에서는 같은 날짜", () => {
    // 2026-05-18 15:30 UTC = 2026-05-19 00:30 KST
    const instant = new Date("2026-05-18T15:30:00.000Z");
    expect(getTodayDateKeyKst(instant)).toBe("20260519");
    expect(getKstDateParts(instant).day).toBe(19);
  });

  it("한국 5월 19일 정오 근처", () => {
    const instant = new Date("2026-05-19T03:00:00.000Z");
    expect(getTodayDateKeyKst(instant)).toBe("20260519");
  });

  it("shiftKstDateKey는 KST 달력 기준으로 이동", () => {
    expect(shiftKstDateKey("20260519", 1)).toBe("20260520");
    expect(shiftKstDateKey("20260519", -6)).toBe("20260513");
  });
});

describe("buildLast7DaysFlow", () => {
  it("오늘(KST) 기록이 최근 7일 목록에 포함된다", () => {
    const todayKey = getTodayDateKeyKst();
    const record: SavedTodayRecord = {
      savedAt: new Date().toISOString(),
      dateKey: todayKey,
      overall: 72,
      sentence: "테스트",
      birthKey: "1990-1-1-남-h9m0",
      toneLabel: "회복",
    };
    const last7 = buildLast7DaysFlow([record]);
    const todayRow = last7.find((d) => d.dateKey === todayKey);
    expect(todayRow?.hasRecord).toBe(true);
    expect(last7).toHaveLength(7);
  });
});
