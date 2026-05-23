/** 첫 방문 인트로 슬라이드 완료 여부 (localStorage) */
export const ONBOARDED_STORAGE_KEY = "onboarded";

/** 인트로 CTA 이후 생년 입력 화면 (/today#personalize) */
export const ONBOARDING_INPUT_TARGET_KEY = "onboarding_input_target";
export const ONBOARDING_INPUT_TARGET_TODAY = "today-personalize" as const;

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

export function setOnboardingInputTarget(
  target: typeof ONBOARDING_INPUT_TARGET_TODAY,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ONBOARDING_INPUT_TARGET_KEY, target);
  } catch {
    /* storage unavailable */
  }
}

export function hasOnboardingInputTarget(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(ONBOARDING_INPUT_TARGET_KEY) ===
      ONBOARDING_INPUT_TARGET_TODAY
    );
  } catch {
    return false;
  }
}

export function consumeOnboardingInputTarget(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(ONBOARDING_INPUT_TARGET_KEY);
    if (value) sessionStorage.removeItem(ONBOARDING_INPUT_TARGET_KEY);
    return value;
  } catch {
    return null;
  }
}
