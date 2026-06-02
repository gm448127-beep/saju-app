import { describe, expect, it } from "vitest";
import {
  getBirthHourError,
  getBirthMinuteError,
  isValidBirthTimeExact,
  parseBirthTimeExact,
} from "@/components/BirthTimeExactInputs";

describe("BirthTimeExactInputs validation", () => {
  it("allows 0~23 hours and 0~59 minutes", () => {
    expect(getBirthHourError("9")).toBeNull();
    expect(getBirthHourError("23")).toBeNull();
    expect(getBirthMinuteError("59")).toBeNull();
    expect(isValidBirthTimeExact("14", "30")).toBe(true);
    expect(parseBirthTimeExact("14", "30")).toEqual({ hour: 14, minute: 30 });
  });

  it("rejects out-of-range values", () => {
    expect(getBirthHourError("24")).toMatch(/0~23/);
    expect(getBirthMinuteError("60")).toMatch(/0~59/);
    expect(isValidBirthTimeExact("24", "0")).toBe(false);
  });
});
