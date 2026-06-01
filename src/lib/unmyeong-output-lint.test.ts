import { describe, expect, it } from "vitest";
import {
  assertUnmyeongOutput,
  lintUnmyeongOutput,
  sanitizeForDisplay,
} from "./unmyeong-output-lint";

describe("lintUnmyeongOutput — 위반", () => {
  it("성격 진단형", () => {
    const r = lintUnmyeongOutput("당신은 리더십이 강한 사람입니다.");
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.type === "personality_label")).toBe(true);
    expect(r.violations.some((v) => v.word.includes("리더십"))).toBe(true);
  });

  it("미래 예언형", () => {
    const r = lintUnmyeongOutput("올해 재물운이 상승합니다.");
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.type === "prediction")).toBe(true);
  });

  it("교훈형", () => {
    const r = lintUnmyeongOutput("조심하세요.");
    expect(r.ok).toBe(false);
    expect(r.violations[0]?.type).toBe("lesson");
  });

  it("낙인형", () => {
    const r = lintUnmyeongOutput("당신은 원래 완벽주의 성향이 있습니다.");
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.type === "fatalism")).toBe(true);
    expect(r.violations.some((v) => v.type === "personality_label")).toBe(true);
  });
});

describe("lintUnmyeongOutput — 통과", () => {
  it("관계 장면 문장", () => {
    const text =
      "관계에서는 답장을 보내고도 다시 읽는 장면이 나타날 수 있습니다.";
    expect(lintUnmyeongOutput(text).ok).toBe(true);
  });

  it("환경·흐름 문장", () => {
    const text =
      "이 시기에는 결정 직전 한 번 더 확인하려는 흐름이 반복되기 쉽습니다.";
    expect(lintUnmyeongOutput(text).ok).toBe(true);
  });

  it("명리 팩트 라벨 (신강/신약)", () => {
    const text = "근거: 신강/신약은 계산 팩트로만 표시합니다.";
    expect(lintUnmyeongOutput(text).ok).toBe(true);
  });
});

describe("assertUnmyeongOutput", () => {
  it("통과 시 throw 하지 않음", () => {
    expect(() =>
      assertUnmyeongOutput("이 시기에는 맞춤이 먼저일 때가 많아요."),
    ).not.toThrow();
  });

  it("위반 시 throw", () => {
    expect(() => assertUnmyeongOutput("조심하세요.")).toThrow(
      /unmyeong v3 output lint failed/,
    );
  });
});

describe("sanitizeForDisplay", () => {
  it("위반 구간만 … 로 치환", () => {
    const out = sanitizeForDisplay("조심하세요.");
    expect(out).toBe("….");
    expect(lintUnmyeongOutput(out).ok).toBe(true);
  });
});
