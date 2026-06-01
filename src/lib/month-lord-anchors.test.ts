import { describe, expect, it } from "vitest";
import {
  MONTH_LORD_ANCHORS,
  MONTH_LORD_BRANCHES,
  MONTH_LORD_FORBIDDEN,
  assertMonthLordCompleteness,
  assertMonthLordForbiddenClean,
  buildEnvironmentFromMonthLord,
  buildScenesFromMonthAndSipsin,
  getMonthLordAnchor,
} from "./month-lord-anchors";

const REQUIRED_FIELDS = [
  "environment",
  "relationship",
  "work",
  "money",
  "choice",
  "emotion",
  "stressScene",
  "secretaryLine",
] as const;

describe("month-lord-anchors", () => {
  it("12월령 모두 존재", () => {
    expect(MONTH_LORD_BRANCHES).toHaveLength(12);
    expect(assertMonthLordCompleteness()).toEqual([]);
  });

  it("각 월령 필수 필드가 비어 있지 않다", () => {
    for (const branch of MONTH_LORD_BRANCHES) {
      const anchor = MONTH_LORD_ANCHORS[branch];
      expect(anchor.label.length).toBeGreaterThan(2);
      for (const field of REQUIRED_FIELDS) {
        expect(anchor[field].trim().length, `${branch}.${field}`).toBeGreaterThan(
          8,
        );
      }
    }
  });

  it("금지어가 사전에 없다", () => {
    expect(assertMonthLordForbiddenClean()).toEqual([]);
    for (const word of MONTH_LORD_FORBIDDEN) {
      expect(JSON.stringify(MONTH_LORD_ANCHORS)).not.toContain(word);
    }
  });

  it("인월 environment — 시작·움직임·문을 여는 의미", () => {
    const env = getMonthLordAnchor("인").environment;
    expect(env).toMatch(/시작|움직임|문을 여/);
  });

  it("유월 또는 신월 — 기준·검증·정리 의미", () => {
    const yu = getMonthLordAnchor("유").environment;
    const sin = getMonthLordAnchor("신").environment;
    expect(`${yu} ${sin}`).toMatch(/기준|검증|정리/);
  });

  it("축월 — 누적·버팀·낮은 리스크 의미", () => {
    const env = getMonthLordAnchor("축").environment;
    expect(env).toMatch(/쌓|버티|누적|낮은 리스크/);
  });

  it("buildEnvironmentFromMonthLord는 environment 문장을 반환", () => {
    const { label, text } = buildEnvironmentFromMonthLord("인");
    expect(label).toMatch(/인월/);
    expect(text).toBe(getMonthLordAnchor("인").environment);
  });

  it("buildScenesFromMonthAndSipsin — 월령 바탕 + 십성 보정", () => {
    const scenes = buildScenesFromMonthAndSipsin("인", ["식신", "정관"]);
    expect(scenes.work).toMatch(/일에서는/);
    expect(scenes.work).toMatch(/굴러가게|손으로|식신|미뤄/);
    expect(scenes.relationship.length).toBeGreaterThan(
      getMonthLordAnchor("인").relationship.length,
    );
  });
});
