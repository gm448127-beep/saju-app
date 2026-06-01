import { describe, expect, it } from "vitest";
import { assertUnmyeongOutput } from "./unmyeong-output-lint";
import {
  classifyFiveAxis,
  getChatFallbackV3Response,
} from "./chat-fallback-v3";

describe("getChatFallbackV3Response", () => {
  const saju목 = "일간: 갑목 (목, 양)\n띠: 용띠";

  it("재물 질문 — 예언·행운색·조심 없음", () => {
    const reply = getChatFallbackV3Response("내 재물운 어때?", saju목);
    expect(reply).toMatch(/돈/);
    expect(reply).toMatch(/반복될 수 있는 장면/);
    expect(reply).not.toMatch(/여름|겨울|행운의 색|조심하세요|타입/);
    expect(reply).not.toMatch(/리더십|표현력/);
  });

  it("연애 질문 — 관계 축", () => {
    const reply = getChatFallbackV3Response("연애 고민이 있어", saju목);
    expect(classifyFiveAxis("연애 고민")).toBe("relationship");
    expect(reply).toMatch(/관계/);
    expect(reply).not.toMatch(/겨울에|좋은 만남/);
  });

  it("사주 미입력 + 운세 — 생년월일 안내", () => {
    const reply = getChatFallbackV3Response("오늘 운세 알려줘", "");
    expect(reply).toMatch(/생년월일/);
  });

  it("v3 output lint — 대표 fallback 응답", () => {
    const saju목 = "일간: 갑목 (목, 양)\n띠: 용띠";
    const samples: [string, string][] = [
      ["내 재물운 어때?", saju목],
      ["연애 고민이 있어", saju목],
      ["오늘 운세 알려줘", ""],
      ["일이 너무 많아", saju목],
      ["뭘 선택해야 할지 모르겠어", saju목],
    ];
    for (const [message, ctx] of samples) {
      assertUnmyeongOutput(getChatFallbackV3Response(message, ctx));
    }
  });
});
