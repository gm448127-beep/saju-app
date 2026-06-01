import { describe, expect, it } from "vitest";
import { lintUnmyeongOutputFields } from "@/lib/unmyeong-output-lint";
import {
  HEXAGRAMS_V3,
  collectAllTojeongDisplayFields,
} from "@/lib/tojeong-content-v3";

describe("tojeong-content-v3", () => {
  it("30괘 전부 존재", () => {
    for (let i = 1; i <= 30; i++) {
      expect(HEXAGRAMS_V3[i]?.name).toBeTruthy();
    }
  });

  it("전체 노출 필드 lintOk", () => {
    const fields = collectAllTojeongDisplayFields();
    const { ok, violations } = lintUnmyeongOutputFields(fields);
    expect(ok, JSON.stringify(violations, null, 2)).toBe(true);
  });
});
