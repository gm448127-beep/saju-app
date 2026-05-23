/** 앱 전역 생년월일 프로필 (localStorage) */

export type BirthTimeMode = "none" | "slot" | "exact";
export type CalendarType = "solar" | "lunar" | "lunarLeap";

export type UserBirthProfile = {
  name?: string;
  year: string;
  month: string;
  day: string;
  gender: "남" | "여";
  calendarType: CalendarType;
  timeMode: BirthTimeMode;
  slotHour: number;
  exactHour: number;
  exactMinute: number;
  savedAt: string;
};

const PROFILE_KEY = "unmyeong-user-profile";
const LEGACY_NAME_KEY = "sajuUserName";

export const PROFILE_UPDATED_EVENT = "unmyeong-profile-updated";

function parseProfile(raw: string | null): UserBirthProfile | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as UserBirthProfile;
    if (!data?.year || !data?.month || !data?.day || !data.gender) return null;
    return {
      ...data,
      calendarType: data.calendarType || "solar",
      timeMode: data.timeMode || "none",
      slotHour: typeof data.slotHour === "number" ? data.slotHour : 9,
      exactHour: typeof data.exactHour === "number" ? data.exactHour : 9,
      exactMinute: typeof data.exactMinute === "number" ? data.exactMinute : 0,
    };
  } catch {
    return null;
  }
}

export function getUserProfile(): UserBirthProfile | null {
  if (typeof window === "undefined") return null;
  const stored = parseProfile(window.localStorage.getItem(PROFILE_KEY));
  if (stored) return stored;

  const legacyName = window.localStorage.getItem(LEGACY_NAME_KEY);
  if (legacyName) {
    return null;
  }
  return null;
}

export function hasUserProfile(): boolean {
  return getUserProfile() !== null;
}

export function saveUserProfile(profile: Omit<UserBirthProfile, "savedAt"> & { savedAt?: string }) {
  if (typeof window === "undefined") return false;
  try {
    const next: UserBirthProfile = {
      ...profile,
      savedAt: profile.savedAt || new Date().toISOString(),
    };
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    if (next.name?.trim()) {
      window.localStorage.setItem(LEGACY_NAME_KEY, next.name.trim());
    }
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function clearUserProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

export function getProfileDisplayName(profile: UserBirthProfile | null): string {
  const name = profile?.name?.trim();
  if (name) return name.endsWith("님") ? name : `${name}님`;
  return "나";
}

export function profileBirthSummary(profile: UserBirthProfile): string {
  const cal =
    profile.calendarType === "lunar"
      ? "음력"
      : profile.calendarType === "lunarLeap"
        ? "윤달"
        : "양력";
  return `${profile.year}.${profile.month}.${profile.day} · ${profile.gender} · ${cal} · ${profileBirthTimeSummary(profile)}`;
}

export function profileToBirthHour(profile: UserBirthProfile): {
  hour?: number;
  minute?: number;
} {
  if (profile.timeMode === "exact") {
    return { hour: profile.exactHour, minute: profile.exactMinute };
  }
  if (profile.timeMode === "slot") {
    return { hour: profile.slotHour, minute: 0 };
  }
  return {};
}

/** 오늘 기록·히스토리 매칭용 birthKey (출생시간 포함 시 구분) */
export function profileToBirthKey(profile: UserBirthProfile) {
  const { hour, minute } = profileToBirthHour(profile);
  const timePart =
    hour !== undefined ? `-h${hour}m${minute ?? 0}` : "-noHour";
  return `${profile.year}-${profile.month}-${profile.day}-${profile.gender}${timePart}`;
}

/** 프로필 출생시간 요약 (기기 간 점수 차이 확인용) */
export function profileBirthTimeSummary(profile: UserBirthProfile): string {
  if (profile.timeMode === "none") return "출생시간 미입력";
  if (profile.timeMode === "exact") {
    return `출생시간 ${String(profile.exactHour).padStart(2, "0")}:${String(profile.exactMinute).padStart(2, "0")}`;
  }
  const labels: Record<number, string> = {
    23: "자시",
    1: "축시",
    3: "인시",
    5: "묘시",
    7: "진시",
    9: "사시",
    11: "오시",
    13: "미시",
    15: "신시",
    17: "유시",
    19: "술시",
    21: "해시",
  };
  return `출생시간 ${labels[profile.slotHour] ?? `${profile.slotHour}시`}`;
}

export function profileToTodayPayload(profile: UserBirthProfile) {
  const { hour, minute } = profileToBirthHour(profile);
  return {
    year: Number(profile.year),
    month: Number(profile.month),
    day: Number(profile.day),
    hour,
    minute,
    isLunar: profile.calendarType !== "solar",
    gender: profile.gender,
  };
}

export function profileToSajuPayload(profile: UserBirthProfile) {
  const { hour, minute } = profileToBirthHour(profile);
  return {
    name: profile.name?.trim() || "",
    year: Number(profile.year),
    month: Number(profile.month),
    day: Number(profile.day),
    hour,
    minute,
    gender: profile.gender,
    isLunar: profile.calendarType !== "solar",
  };
}

export function profileToChatBirthData(profile: UserBirthProfile) {
  return {
    year: profile.year,
    month: profile.month,
    day: profile.day,
    gender: profile.gender,
    calendarType: profile.calendarType,
    isLunar: profile.calendarType !== "solar",
    timeMode: profile.timeMode,
    slotHour: String(profile.slotHour),
    exactHour: String(profile.exactHour),
    exactMinute: String(profile.exactMinute),
  };
}
