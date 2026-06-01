import { describe, expect, it } from "vitest";
import { brandGradeStyle, brandScoreColor, BRAND_COLORS } from "@/lib/brand-colors";

describe("brand-colors", () => {
  it("점수 색은 CTA와 분리된 데이터 강조를 쓴다", () => {
    expect(brandScoreColor(85)).toBe(BRAND_COLORS.dataAccent);
    expect(brandScoreColor(70)).toBe(BRAND_COLORS.accent);
    expect(brandScoreColor(55)).toBe(BRAND_COLORS.inkMuted);
  });

  it("등급 색은 무지개가 아니다", () => {
    const s = brandGradeStyle("S");
    expect(s.color).not.toMatch(/a855f7|22c55e|3b82f6/i);
    expect(s.color).toBe(BRAND_COLORS.dataAccent);
  });
});
