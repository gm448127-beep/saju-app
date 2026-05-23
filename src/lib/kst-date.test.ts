import { describe, expect, it } from "vitest";
import { getKstDateParts, getTodayDateKeyKst } from "@/lib/kst-date";

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
});
