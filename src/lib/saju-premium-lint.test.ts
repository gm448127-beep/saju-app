import { describe, expect, it } from "vitest";
import { SAJU_PREMIUM_DEV_SAMPLE_REPORT } from "./saju-premium-dev-sample";
import {
  assertPremiumReportLint,
  lintPremiumReportOutput,
} from "./saju-premium-lint";
import { lintUnmyeongOutput } from "./unmyeong-output-lint";

describe("saju-premium-lint", () => {
  it("금지어 샘플은 위반", () => {
    expect(lintPremiumReportOutput("당신은 리더십이 강한 사람입니다.").lintOk).toBe(
      false,
    );
    expect(lintPremiumReportOutput("올해 재물운이 상승합니다.").lintOk).toBe(
      false,
    );
  });

  it("v3 장면 문장은 통과", () => {
    const ok =
      "관계에서는 답장을 보내고도 다시 읽는 장면이 나타날 수 있습니다.";
    expect(lintPremiumReportOutput(ok).lintOk).toBe(true);
    expect(() => assertPremiumReportLint(ok)).not.toThrow();
  });

  it("dev sample 리포트는 린트 통과", () => {
    expect(() => assertPremiumReportLint(SAJU_PREMIUM_DEV_SAMPLE_REPORT)).not.toThrow();
  });

  it("lintUnmyeongOutput과 동일 규칙 (위반 감지)", () => {
    const text = "조심하세요.";
    expect(lintPremiumReportOutput(text).lintOk).toBe(false);
    expect(lintUnmyeongOutput(text).ok).toBe(false);
  });
});
