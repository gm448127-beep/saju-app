import { describe, expect, it } from "vitest";
import { applySecretaryVoice } from "@/lib/today-secretary-voice";

describe("today-secretary-voice", () => {
  it("딱딱한 보고서 어미를 완화한다", () => {
    expect(applySecretaryVoice("오늘은 계약에 신중한 접근이 필요합니다.")).not.toContain(
      "필요합니다",
    );
    expect(applySecretaryVoice("새로운 시도보다 정리가 유리합니다.")).not.toContain("유리합니다");
  });
});
