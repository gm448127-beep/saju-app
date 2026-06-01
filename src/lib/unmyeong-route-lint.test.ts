import { describe, expect, it } from "vitest";
import {
  assertRouteDisplayLint,
  attachRouteLintMeta,
  collectCompatibilityDisplayFields,
  collectDreamDisplayFields,
  collectTarotDisplayFields,
  collectTodayDisplayFields,
  collectTojeongDisplayFields,
  runRouteOutputLint,
} from "./unmyeong-route-lint";

describe("unmyeong-route-lint", () => {
  it("attachRouteLintMeta — meta.lintViolations 반환", () => {
    const body = attachRouteLintMeta(
      { ok: true },
      "test",
      { sample: "조심하세요." },
    );
    expect(body.meta.lintOk).toBe(false);
    expect(body.meta.lintViolations.length).toBeGreaterThan(0);
    expect(body.ok).toBe(true);
  });

  it("금지 문체 샘플은 위반", () => {
    const lint = runRouteOutputLint(
      { text: "당신은 리더십이 강한 사람입니다." },
      "test",
    );
    expect(lint.lintOk).toBe(false);
  });

  it("v3 장면 문장은 통과", () => {
    const lint = runRouteOutputLint(
      {
        text: "관계에서는 답장을 보내고도 다시 읽는 장면이 나타날 수 있습니다.",
      },
      "test",
    );
    expect(lint.lintOk).toBe(true);
    expect(() =>
      assertRouteDisplayLint({
        text: "이 시기에는 결정 직전 한 번 더 확인하려는 흐름이 반복되기 쉽습니다.",
      }),
    ).not.toThrow();
  });

  it("today — gearAnalysis·십성 라벨은 수집 제외", () => {
    const fields = collectTodayDisplayFields({
      summary: "오늘은 차분히 정리하며 성과를 쌓기 좋은 날입니다.",
      todaySipsin: "식신",
      relation: "표현·풍요의 기운",
      gearAnalysis: ["⚙️ 리더십이 강합니다"],
      sajuTriggers: [{ label: "천간합" }],
    });
    expect(fields.summary).toBeTruthy();
    expect(fields.todaySipsin).toBeUndefined();
    expect(fields.relation).toBeUndefined();
    expect(Object.keys(fields).some((k) => k.includes("gearAnalysis"))).toBe(
      false,
    );
    expect(runRouteOutputLint(fields, "today").lintOk).toBe(true);
  });

  it("tarot·dream fallback 본문 린트", () => {
    const tarot = collectTarotDisplayFields({
      reading: "카드가 말하는 핵심은 무리하게 결과를 끌어내기보다 정리하라는 것입니다.",
    });
    expect(runRouteOutputLint(tarot, "tarot").lintOk).toBe(true);

    const dream = collectDreamDisplayFields({
      interpretation:
        "이 꿈은 지금 마음속에서 정리하고 싶은 일이 반영된 꿈으로 보입니다.",
    });
    expect(runRouteOutputLint(dream, "dream").lintOk).toBe(true);
  });

  it("tojeong — v3 7괘(사) 샘플 본문 통과", () => {
    const fields = collectTojeongDisplayFields({
      summary:
        "사람들이 결정을 기다릴 때, 기준을 먼저 정리하는 역할이 생길 수 있어요.",
      advice: "맡을 일·맡기지 않을 일을 문장으로 적어 공유해 보세요.",
      caution: "권위만 앞세우면 반발이 커질 수 있어요.",
    });
    expect(runRouteOutputLint(fields, "tojeong").lintOk).toBe(true);
  });

  it("compatibility — mainAdvice·tips만 수집", () => {
    const fields = collectCompatibilityDisplayFields({
      mainAdvice: "서로의 장점을 살리기 좋은 궁합입니다.",
      person1: {
        dayStem: "갑",
        personality: { title: "성장", traits: "새 방향을 여는 성향" },
      },
      tips: ["역할을 나누세요."],
    });
    expect(fields["person1.dayStem"]).toBeUndefined();
    expect(fields["mainAdvice"]).toBeTruthy();
    expect(runRouteOutputLint(fields, "compatibility").lintOk).toBe(true);
  });
});
