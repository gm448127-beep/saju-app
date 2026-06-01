import { describe, expect, it } from "vitest";
import {
  SIPSIN_NAMES,
  assertDictionaryCompleteness,
  assertDictionaryForbiddenClean,
  buildScenesFromMainSipsin,
  buildSipsinSceneLine,
  getSipsinScenePack,
} from "./sipsin-scene-dictionary";
import { buildSecretaryReading } from "./saju-secretary-reading";

describe("sipsin-scene-dictionary", () => {
  it("10십성 × 5축 + stress + suggestion 완전성", () => {
    expect(assertDictionaryCompleteness()).toEqual([]);
    expect(SIPSIN_NAMES).toHaveLength(10);
  });

  it("금지 문체가 사전에 없다", () => {
    expect(assertDictionaryForbiddenClean()).toEqual([]);
  });

  it("각 십성 pack에 5축 장면이 있다", () => {
    for (const name of SIPSIN_NAMES) {
      const pack = getSipsinScenePack(name)!;
      expect(pack.scenes.relationship.length).toBeGreaterThan(10);
      expect(pack.scenes.work).toMatch(/./);
      expect(pack.scenes.money).toMatch(/./);
      expect(pack.scenes.choice).toMatch(/./);
      expect(pack.scenes.emotion).toMatch(/./);
      expect(pack.stressPattern.scene.length).toBeGreaterThan(5);
      expect(pack.suggestion.action).toMatch(/./);
    }
  });

  it("상관 — 답장 다시 읽기 장면 (관계 축)", () => {
    expect(getSipsinScenePack("상관")!.scenes.relationship).toMatch(/답장/);
  });

  it("mainSipsin 2개 — 관계·선택은 2번째, 일·돈·감정은 1번째 보정", () => {
    const scenes = buildScenesFromMainSipsin(["식신", "정관"]);
    const 식신 = getSipsinScenePack("식신")!;
    const 정관 = getSipsinScenePack("정관")!;
    expect(scenes.relationship).toBe(정관.scenes.relationship);
    expect(scenes.work).toBe(식신.scenes.work);
    expect(scenes.choice).toBe(정관.scenes.choice);
  });
});

describe("saju-secretary-reading + dictionary", () => {
  it("월령·일간은 유지하고 scenes는 사전에서 온다", () => {
    const reading = buildSecretaryReading({
      dayGanKo: "갑",
      monthBranchKo: "인",
      sipsinCount: { 식신: 3, 정관: 2 },
      gyeok: "식상격",
    });
    expect(reading.environment.text).toMatch(/인월|시작|움직임/);
    expect(reading.responsePattern.text).toMatch(/편이에요/);
    expect(reading.scenes.work).toMatch(/일에서는/);
    expect(reading.scenes.work).toMatch(/굴러가게|손으로|미뤄/);
    expect(reading.stressPattern.scene.length).toBeGreaterThan(5);
    expect(reading.secretarySuggestions.length).toBeGreaterThan(0);
    const blob = JSON.stringify(reading);
    for (const word of ["리더십", "표현력", "조심하세요"]) {
      expect(blob).not.toContain(word);
    }
  });
});
