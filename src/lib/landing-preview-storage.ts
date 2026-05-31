import type { BirthTimeMode, CalendarType } from "@/lib/user-profile-storage";

/** 랜딩 생년월일·태어난 시간 — 세션 저장 */
export type StoredLandingBirth = {
  year: string;
  month: string;
  day: string;
  gender: "남" | "여";
  calendarType?: CalendarType;
  timeMode?: BirthTimeMode;
  slotHour?: number;
  exactHour?: number;
  exactMinute?: number;
  sentence?: string;
  toneLabel?: string;
};

const DEFAULT_TIME_MODE: BirthTimeMode = "slot";
const DEFAULT_SLOT_HOUR = 9;
const DEFAULT_CALENDAR: CalendarType = "solar";

function normalizeCalendarType(value: unknown): CalendarType {
  if (value === "lunar" || value === "lunarLeap") return value;
  return DEFAULT_CALENDAR;
}

export function normalizeStoredLandingBirth(data: StoredLandingBirth): StoredLandingBirth {
  return {
    ...data,
    calendarType: normalizeCalendarType(data.calendarType),
    timeMode: data.timeMode ?? DEFAULT_TIME_MODE,
    slotHour: data.slotHour ?? DEFAULT_SLOT_HOUR,
    exactHour: data.exactHour ?? 9,
    exactMinute: data.exactMinute ?? 0,
  };
}

export type StoredLandingPreview = StoredLandingBirth & {
  sentence: string;
  toneLabel: string;
};

const STORAGE_KEY = "unmyeong-landing-preview-v1";

export function getStoredLandingBirth(): StoredLandingBirth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = normalizeStoredLandingBirth(JSON.parse(raw) as StoredLandingBirth);
    if (!data?.year || !data?.month || !data?.day || !data?.gender) return null;
    return data;
  } catch {
    return null;
  }
}

export function getStoredLandingPreview(): StoredLandingPreview | null {
  const birth = getStoredLandingBirth();
  const sentence = birth?.sentence?.trim();
  if (!birth || !sentence) return null;
  return {
    year: birth.year,
    month: birth.month,
    day: birth.day,
    gender: birth.gender,
    sentence,
    toneLabel: birth.toneLabel?.trim() || "오늘의 결",
  };
}

export function saveStoredLandingBirth(data: StoredLandingBirth) {
  if (typeof window === "undefined") return;
  const existing = getStoredLandingBirth();
  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalizeStoredLandingBirth({
      ...existing,
      ...data,
    })),
  );
}

export function saveStoredLandingPreview(data: StoredLandingPreview) {
  saveStoredLandingBirth(data);
}

/** 한 줄 미리보기 API를 이미 성공했는지 */
export function hasUsedLandingPreview() {
  return getStoredLandingPreview() !== null;
}
