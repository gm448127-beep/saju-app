import { describe, expect, it } from "vitest";
import {
  buildUnmyeongGenerationVoiceBlock,
  UNMYEONG_GENERATION_FORBIDDEN,
} from "@/lib/unmyeong-generation-voice";
import { buildChatGenerationSystemPrompt } from "@/lib/chat-generation-prompts";
import { buildTarotGenerationSystemPrompt } from "@/lib/tarot-generation-prompts";
import { buildDreamGenerationSystemPrompt } from "@/lib/dream-generation-prompts";

describe("unmyeong-generation-voice", () => {
  it("공통 문체 블록에 금지 규칙과 파이프라인이 포함된다", () => {
    const block = buildUnmyeongGenerationVoiceBlock();
    expect(block).toContain("운명비서 헌법 v3.0");
    expect(block).toContain("운명비서 — 말투·감성");
    expect(block).toContain("사주를 설명하지 않는다");
    expect(UNMYEONG_GENERATION_FORBIDDEN.some((f) => block.includes(f.slice(0, 8)))).toBe(
      true,
    );
  });

  it("경로별 프롬프트가 공통 문체를 포함한다", () => {
    expect(buildChatGenerationSystemPrompt("테스트 원국")).toContain("운명비서 헌법 v3.0");
    expect(buildTarotGenerationSystemPrompt({ isFutureHorizon: false, horizonLabel: "지금" })).toContain(
      "오늘 비서의 제안",
    );
    expect(buildDreamGenerationSystemPrompt("물=감정")).toContain("실수하기 쉬운 순간");
  });
});
