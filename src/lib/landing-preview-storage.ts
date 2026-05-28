/** 랜딩 생년월일 미리보기 — 브라우저 세션당 1회 */

export type StoredLandingPreview = {
  year: string;
  month: string;
  day: string;
  gender: "남" | "여";
  sentence: string;
  toneLabel: string;
};

const STORAGE_KEY = "unmyeong-landing-preview-v1";

export function getStoredLandingPreview(): StoredLandingPreview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredLandingPreview;
    if (!data?.year || !data?.sentence) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveStoredLandingPreview(data: StoredLandingPreview) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function hasUsedLandingPreview() {
  return getStoredLandingPreview() !== null;
}
