/** 랜딩 전용 경로 — 글로벌 온보딩·헤더 없음 */
const LANDING_PREFIXES = ["/landing-", "/lp/"] as const;

export function isLandingPath(pathname: string | null): boolean {
  if (!pathname) return true;
  return LANDING_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
