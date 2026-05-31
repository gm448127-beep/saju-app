import type { BirthTimeMode, CalendarType } from "@/lib/user-profile-storage";
import { birthKeyFromTodayPayload } from "@/lib/today-score-display";
import type { StoredLandingBirth } from "@/lib/landing-preview-storage";

export type LandingBirthApiPayload = {
  year: number;
  month: number;
  day: number;
  gender: "남" | "여";
  hour?: number;
  minute?: number;
  isLunar: boolean;
  leap?: boolean;
};

function calendarFromStored(birth: StoredLandingBirth): CalendarType {
  return birth.calendarType ?? "solar";
}

function resolveBirthTime(birth: StoredLandingBirth) {
  const timeMode: BirthTimeMode = birth.timeMode ?? "slot";

  if (timeMode === "exact") {
    return { hour: birth.exactHour ?? 9, minute: birth.exactMinute ?? 0 };
  }
  if (timeMode === "slot") {
    return { hour: birth.slotHour ?? 9, minute: 0 };
  }
  return {};
}

/** 세션 저장값 → /api/today·landing-preview 요청 본문 */
export function storedBirthToApiPayload(birth: StoredLandingBirth): LandingBirthApiPayload {
  const { hour, minute } = resolveBirthTime(birth);
  const calendarType = calendarFromStored(birth);

  return {
    year: Number(birth.year),
    month: Number(birth.month),
    day: Number(birth.day),
    gender: birth.gender,
    isLunar: calendarType !== "solar",
    ...(calendarType === "lunarLeap" ? { leap: true } : {}),
    ...(hour !== undefined ? { hour, minute: minute ?? 0 } : {}),
  };
}

export function landingBirthKeyFromStored(birth: StoredLandingBirth) {
  const payload = storedBirthToApiPayload(birth);
  const base = birthKeyFromTodayPayload(payload);
  const calendarType = calendarFromStored(birth);
  if (calendarType === "solar") return base;
  return `${base}-${calendarType}`;
}
