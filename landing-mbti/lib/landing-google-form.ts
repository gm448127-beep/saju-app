/** 운명비서 출시 알림 Google Form — 기본값은 공개 viewform 기준 */
export const LANDING_GOOGLE_FORM_ACTION_URL =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_ACTION_URL ??
  "https://docs.google.com/forms/d/e/1FAIpQLSe2VHIdcdbMEDecuqRFFAOleJv622GsVM6c9dlLzpjKElwPTw/formResponse";

export const LANDING_GOOGLE_FORM_EMAIL_ENTRY =
  process.env.NEXT_PUBLIC_GOOGLE_FORM_EMAIL_ENTRY ?? "entry.589063772";

export async function submitLandingEmail(email: string): Promise<void> {
  const payload = new URLSearchParams();
  payload.set(LANDING_GOOGLE_FORM_EMAIL_ENTRY, email);
  payload.set("fvv", "1");
  payload.set("pageHistory", "0");

  await fetch(LANDING_GOOGLE_FORM_ACTION_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: payload.toString(),
  });
}
