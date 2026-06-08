export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

type GtagArgs = [command: string, ...rest: unknown[]];

function getGtag() {
  if (typeof window === "undefined") return null;
  const maybeWindow = window as Window & { gtag?: (...args: GtagArgs) => void };
  return typeof maybeWindow.gtag === "function" ? maybeWindow.gtag : null;
}

/** GA4 커스텀 이벤트 */
export function trackGa4Event(eventName: string, params?: Record<string, string | number>) {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("event", eventName, params ?? {});
}
