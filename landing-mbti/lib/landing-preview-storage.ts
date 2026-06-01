/** 랜딩 생년월일 — 세션 저장 (미리보기 한 줄은 API 성공 시에만 잠금) */

export type StoredLandingBirth = {
  year: string;
  month: string;
  day: string;
  gender: "남" | "여";
  sentence?: string;
  toneLabel?: string;
};

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
    const data = JSON.parse(raw) as StoredLandingBirth;
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
    JSON.stringify({
      ...existing,
      ...data,
    }),
  );
}

export function saveStoredLandingPreview(data: StoredLandingPreview) {
  saveStoredLandingBirth(data);
}

export function hasUsedLandingPreview() {
  return getStoredLandingPreview() !== null;
}
