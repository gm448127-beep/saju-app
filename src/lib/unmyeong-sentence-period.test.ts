import { describe, expect, it, vi } from "vitest";
import {
  appendUnmyeongPromptSentencePeriodRule,
  endsWithSentencePeriod,
  findSentencesWithoutPeriod,
  lintSentencesWithoutPeriod,
  warnSentencesWithoutPeriod,
} from "@/lib/unmyeong-sentence-period";
import { buildChatGenerationSystemPrompt } from "@/lib/chat-generation-prompts";

describe("unmyeong-sentence-period", () => {
  it("마침표 종결 문장은 통과한다", () => {
    expect(endsWithSentencePeriod("오늘은 정리가 먼저인 날이에요.")).toBe(true);
    expect(lintSentencesWithoutPeriod("첫 줄이에요.\n둘째 줄이에요.").ok).toBe(true);
  });

  it("마침표 없는 문장을 찾는다", () => {
    const missing = findSentencesWithoutPeriod("맞는 말이에요\n이건 마침표가 없음");
    expect(missing.length).toBeGreaterThanOrEqual(1);
    expect(missing.some((m) => m.text.includes("마침표가 없음"))).toBe(true);
  });

  it("헤더·라벨 줄은 검사에서 제외한다", () => {
    expect(lintSentencesWithoutPeriod("## 오늘의 흐름").ok).toBe(true);
    expect(lintSentencesWithoutPeriod("TODAY:").ok).toBe(true);
  });

  it("경고 로그를 남긴다", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnSentencesWithoutPeriod("마침표 없는 문장", { source: "test" });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("프롬프트 끝에 마침표 규칙을 붙인다", () => {
    const prompt = buildChatGenerationSystemPrompt("테스트");
    expect(prompt).toContain("모든 문장은 반드시 마침표");
    expect(appendUnmyeongPromptSentencePeriodRule("base")).toMatch(/base[\s\S]+마침표/);
  });
});
