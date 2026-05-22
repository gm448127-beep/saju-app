/** 첫 방문 인트로 슬라이드 완료 여부 (localStorage) */
export const ONBOARDED_STORAGE_KEY = "onboarded";

export function isIntroOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ONBOARDED_STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

export function setIntroOnboarded(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDED_STORAGE_KEY, "true");
  } catch {
    /* storage unavailable */
  }
}
