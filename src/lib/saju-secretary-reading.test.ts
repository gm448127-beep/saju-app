import { describe, expect, it } from "vitest";
import { MONTH_LORD_BRANCHES } from "./month-lord-anchors";
import {
  assertSecretaryReadingLint,
  assertUnmyeongOutput,
} from "./unmyeong-output-lint";
import {
  buildSecretaryReading,
  buildV3SummaryText,
  buildSipsinSceneLine,
} from "./saju-secretary-reading";

describe("buildSecretaryReading", () => {
  it("월령→일간→십성 순서로 secretaryReading을 생성한다", () => {
    const reading = buildSecretaryReading({
      dayGanKo: "갑",
      monthBranchKo: "인",
      sipsinCount: { 식신: 2, 정관: 1, "(일간)": 1 },
      gyeok: "건록격",
      yongshin: "수",
    });

    expect(reading.facts.dayMaster).toBe("갑");
    expect(reading.facts.monthBranch).toBe("인");
    expect(reading.facts.mainSipsin).toEqual(["식신", "정관"]);
    expect(reading.environment.text).toMatch(/인월|문을 여/);
    expect(reading.responsePattern.text).toMatch(/편이에요/);
    expect(reading.scenes.work).toBeTruthy();
    expect(reading.secretarySuggestions.length).toBeGreaterThan(0);
    expect(reading.evidence[0].role).toBe("month");
  });

  it("v3 output lint — 12월령 secretaryReading 본문", () => {
    for (const monthBranchKo of MONTH_LORD_BRANCHES) {
      const reading = buildSecretaryReading({
        dayGanKo: "기",
        monthBranchKo,
        sipsinCount: { 식신: 2, 정관: 1 },
      });
      assertSecretaryReadingLint(reading);
    }
  });
});

describe("buildSecretaryReading + unmyeong-output-lint", () => {
  it("v3SummaryText도 린트 통과", () => {
    const reading = buildSecretaryReading({
      dayGanKo: "병",
      monthBranchKo: "오",
      sipsinCount: { 상관: 3 },
    });
    assertUnmyeongOutput(buildV3SummaryText(reading));
  });
});

describe("buildSipsinSceneLine", () => {
  it("식신은 장면 한 줄을 반환한다", () => {
    expect(buildSipsinSceneLine("식신")).toMatch(/굴러가게|손으로/);
  });
});

describe("buildV3SummaryText", () => {
  it("환경·반응·클로징을 이어 붙인다", () => {
    const reading = buildSecretaryReading({
      dayGanKo: "을",
      monthBranchKo: "묘",
      sipsinCount: { 비견: 1 },
    });
    const summary = buildV3SummaryText(reading);
    expect(summary).toContain(reading.environment.text);
    expect(summary).toContain(reading.closingLine);
  });
});
