const STORAGE_PREFIX = "todayPremiumUnlock:";

export function todayPremiumUnlockKey(dateKey: string, birthKey: string) {
  return `${STORAGE_PREFIX}${dateKey}:${birthKey}`;
}

export function readTodayPremiumUnlocked(dateKey: string, birthKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(todayPremiumUnlockKey(dateKey, birthKey)) === "1";
  } catch {
    return false;
  }
}

export function writeTodayPremiumUnlocked(dateKey: string, birthKey: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(todayPremiumUnlockKey(dateKey, birthKey), "1");
  } catch {
    /* 저장 실패 무시 */
  }
}
