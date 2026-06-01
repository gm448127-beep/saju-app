import { describe, expect, it } from "vitest";
import { applySajuPremiumReportVoice } from "@/lib/saju-premium-voice";
import { sanitizePremiumChartInput } from "@/lib/saju-premium-sanitize";

describe("saju-premium-voice", () => {
  it("보고서체를 해요체로 바꾼다", () => {
    const out = applySajuPremiumReportVoice("오늘은 신중한 접근이 필요합니다.");
    expect(out).not.toContain("필요합니다");
    expect(out).toContain("있어요");
  });

  it("마크다운 헤더는 유지한다", () => {
    const out = applySajuPremiumReportVoice("## 한눈에 보는 나\n표현력이 뛰어납니다.");
    expect(out).toContain("## 한눈에 보는 나");
  });
});

describe("saju-premium-sanitize", () => {
  it("레거시 필드를 제거한다", () => {
    const clean = sanitizePremiumChartInput({
      gyeok: "식상격",
      personality: "큰 나무처럼",
      summary: "리더십",
      personalityMap: { 갑: "리더" },
      LEGACY_sipsinDesc: { 식신: "표현력" },
      ohaengAnalysis: [{ name: "목", count: 2, desc: "성장" }],
    });
    expect(clean.personality).toBeUndefined();
    expect(clean.summary).toBeUndefined();
    expect(clean.personalityMap).toBeUndefined();
    expect(clean.LEGACY_sipsinDesc).toBeUndefined();
    expect(clean.ohaengAnalysis?.[0]?.desc).toBeUndefined();
  });
});
