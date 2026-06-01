import { describe, expect, it } from "vitest";
import {
  buildUnmyeongConstitutionV3Block,
  CONSTITUTION_TOP_SENTENCE,
  CONSTITUTION_VERSION,
  V3_INTERPRETATION_PIPELINE,
} from "./unmyeong-constitution-v3";
import { buildUnmyeongGenerationVoiceBlock } from "./unmyeong-generation-voice";
import { buildChatGenerationSystemPrompt } from "./chat-generation-prompts";

describe("unmyeong-constitution-v3", () => {
  it("필수 헌법 요소를 포함한다", () => {
    const block = buildUnmyeongConstitutionV3Block();
    expect(block).toContain(CONSTITUTION_TOP_SENTENCE);
    expect(block).toContain("8단 해석 순서");
    expect(block).toContain("월령");
    expect(block).toContain("금지 문체");
    expect(block).toContain("허용 문체");
    expect(block).toContain("관계 · 일 · 돈 · 선택 · 감정");
    expect(block).toContain("부탁을 거절하고도");
    expect(block).toContain(CONSTITUTION_VERSION);
    expect(V3_INTERPRETATION_PIPELINE.length).toBe(8);
  });

  it("월령 우선·페르소나 모듈 옵션", () => {
    const premium = buildUnmyeongConstitutionV3Block({
      product: "premium",
      includeMonthLord: true,
    });
    expect(premium).toContain("월령 → 일간 → 십성");
    expect(premium).toContain("[제품: premium]");

    const persona = buildUnmyeongConstitutionV3Block({
      includePersonaModule: "female_founder",
    });
    expect(persona).toContain("여성 사업가");
    expect(persona).toContain("역할·구조 데이터");
  });

  it("voice 블록은 헌법과 말투를 분리해 이어 붙인다", () => {
    const full = buildUnmyeongGenerationVoiceBlock({ product: "chat" });
    expect(full).toContain("[운명비서 헌법 v3.0]");
    expect(full).toContain("[운명비서 — 말투·감성]");
    expect(full).not.toContain("[절대 금지]"); // v3는 [금지 문체]
  });
});

describe("chat-generation-prompts + constitution", () => {
  it("중복 v3 금지 목록 없이 헌법 블록을 사용한다", () => {
    const prompt = buildChatGenerationSystemPrompt("일간: 갑목 (목)");
    expect(prompt).toContain(CONSTITUTION_TOP_SENTENCE);
    expect(prompt).toContain("지금 질문의 핵심");
    expect(prompt).not.toContain("[채팅 추가 금지 — v3]");
  });
});
