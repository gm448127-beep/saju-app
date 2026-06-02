export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

type FbqArgs = [command: string, ...rest: unknown[]];

function getFbq() {
  if (typeof window === "undefined") return null;
  const maybeWindow = window as Window & { fbq?: (...args: FbqArgs) => void };
  return typeof maybeWindow.fbq === "function" ? maybeWindow.fbq : null;
}

export function trackMetaEvent(eventName: "PageView" | "Lead", params?: Record<string, string | number>) {
  const fbq = getFbq();
  if (!fbq) return;
  if (params) {
    fbq("track", eventName, params);
    return;
  }
  fbq("track", eventName);
}
