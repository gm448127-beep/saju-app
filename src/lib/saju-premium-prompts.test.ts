import { describe, expect, it } from "vitest";
import {
  buildSajuPremiumChartFacts,
  buildSajuPremiumFullContext,
  buildSajuPremiumV3Reference,
  resolveSecretaryReadingForPremium,
} from "@/lib/saju-premium-context";
import { sanitizePremiumChartInput } from "@/lib/saju-premium-sanitize";
import { assertSecretaryReadingLint } from "@/lib/unmyeong-output-lint";
import {
  buildSajuPremiumFullPrompt,
  buildSajuPremiumPromptBundle,
  buildSajuPremiumSystemPrompt,
  SAJU_PRODUCT_TIERS,
} from "@/lib/saju-premium-prompts";
import { lintUnmyeongOutput } from "@/lib/unmyeong-output-lint";

describe("saju-premium-prompts", () => {
  it("system prompt includes new voice examples and sections", () => {
    const system = buildSajuPremiumSystemPrompt();
    expect(system).toContain("이거 내 이야기인데");
    expect(system).toContain("왜 이렇게 읽었는지");
    expect(system).toContain("운명비서는 사주를 설명하지 않는다");
    expect(system).toContain("legacy personality / summary");
    expect(system).toContain("체감과 장면");
    expect(system).toContain("[프리미엄 추가 금지]");
    expect(system).toContain("월령 → 일간 → 십성");
    expect(system).not.toContain("전문가가 본 원국");
    expect(system).not.toContain("buildUnmyeongGenerationVoiceBlock");
  });

  it("chart facts include pillars only — no legacy narrative", () => {
    const facts = buildSajuPremiumChartFacts({
      birthDate: "1990년 5월 15일",
      dayGan: "갑(甲)",
      gyeok: "식상격",
      yongshin: "수",
      personality: "큰 나무처럼 곧고 정직하며",
      summary: "일간 갑목은 리더십이 강합니다",
      compactText: "레거시 compact",
      markdownText: "레거시 markdown",
      pillars: {
        month: {
          label: "월주",
          skyKo: "병",
          earthKo: "오",
          tenGodSky: "식신",
          tenGodEarth: "상관",
        },
        day: {
          label: "일주",
          skyKo: "갑",
          earthKo: "자",
          tenGodSky: "비견",
          tenGodEarth: "정인",
        },
      },
      sipsinCount: { 식신: 3, 비견: 2 },
      ohaengAnalysis: [{ name: "목(木)", count: 2, desc: "성장·발전을 상징합니다" }],
      sipsinAnalysis: [{ name: "식신", count: 3, desc: "표현력이 뛰어납니다" }],
    });
    expect(facts).toContain("일주");
    expect(facts).toContain("식상격");
    expect(facts).toContain("월령");
    expect(facts).toContain("십신 위치");
    expect(facts).not.toContain("레거시");
    expect(facts).not.toContain("리더십");
    expect(facts).not.toContain("표현력이 뛰어납니다");
    expect(facts).not.toContain("성장·발전");
    expect(facts).not.toContain("복사 금지");
  });

  it("full context includes v3 reference without legacy narrative", () => {
    const chart = sanitizePremiumChartInput({
      birthDate: "1990년 5월 15일",
      dayGan: "갑",
      gyeok: "식상격",
      yongshin: "수",
      personality: "큰 나무",
      summary: "리더십이 강합니다",
      pillars: {
        month: { skyKo: "병", earthKo: "오", tenGodSky: "식신", tenGodEarth: "상관" },
        day: { skyKo: "갑", earthKo: "자", tenGodSky: "비견", tenGodEarth: "정인" },
      },
      sipsinCount: { 식신: 3, 정관: 2 },
    });
    const v3 = buildSajuPremiumV3Reference(chart);
    expect(v3).toContain("secretaryReading");
    expect(v3).toContain("월령 anchor");
    expect(v3).toContain("십성 scene pack");
    expect(v3).not.toContain("리더십");
    expect(v3).not.toContain("큰 나무");

    const full = buildSajuPremiumFullContext(chart);
    expect(full).not.toContain("personalityMap");
    expect(full).not.toMatch(/legacy personality/i);
    expect(lintUnmyeongOutput(v3).ok).toBe(true);
  });

  it("sanitize removes legacy before prompt build", () => {
    const bundle = buildSajuPremiumPromptBundle(
      sanitizePremiumChartInput({
        personality: "레거시",
        summary: "리더십",
        gyeok: "식상격",
        pillars: { month: { earthKo: "인" }, day: { skyKo: "갑" } },
        sipsinCount: { 식신: 1 },
      }),
      "테스트",
    );
    expect(bundle.facts).not.toContain("레거시");
    expect(bundle.userPrompt).not.toContain("리더십");
    expect(bundle.userPrompt).toContain("secretaryReading");
  });

  it("embedded secretaryReading passes output lint", () => {
    const chart = sanitizePremiumChartInput({
      gyeok: "식상격",
      pillars: { month: { earthKo: "인" }, day: { skyKo: "갑" } },
      sipsinCount: { 식신: 2, 정관: 1 },
    });
    assertSecretaryReadingLint(resolveSecretaryReadingForPremium(chart));
  });

  it("prompt bundle separates system and user", () => {
    const chart = { birthDate: "1990", gyeok: "식상격" };
    const bundle = buildSajuPremiumPromptBundle(chart, "테스트");
    expect(bundle.systemPrompt.length).toBeGreaterThan(500);
    expect(bundle.userPrompt).toContain("테스트");
    expect(bundle.userPrompt).toContain(SAJU_PRODUCT_TIERS.premium.name);
    expect(bundle.facts).toContain("격국");
    expect(bundle.fullPrompt).toContain(bundle.systemPrompt);
    expect(bundle.fullPrompt).toContain(bundle.userPrompt);
    expect(buildSajuPremiumFullPrompt(chart, "테스트")).toBe(bundle.fullPrompt);
  });
});
