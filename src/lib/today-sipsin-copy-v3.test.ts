import { describe, expect, it } from "vitest";
import { lintUnmyeongOutputFields } from "@/lib/unmyeong-output-lint";
import { collectAllTodaySipsinCopyFields } from "@/lib/today-sipsin-copy-v3";

describe("today-sipsin-copy-v3", () => {
  it("전체 카피 필드 lintOk", () => {
    const fields = collectAllTodaySipsinCopyFields();
    const { ok, violations } = lintUnmyeongOutputFields(fields);
    expect(ok, JSON.stringify(violations, null, 2)).toBe(true);
  });
});
