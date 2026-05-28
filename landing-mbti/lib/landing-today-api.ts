/** 랜딩 미리보기 — 오늘의 한 줄 API */

export type TodayOneLiner = {
  sentence: string;
  toneLabel: string;
};

const CURRENT_YEAR = new Date().getFullYear();

export function isValidLandingBirthDate(year: string, month: string, day: string) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (!year || !month || !day) return false;
  if (y < 1900 || y > CURRENT_YEAR) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function getLandingApiOrigin() {
  const configured = process.env.NEXT_PUBLIC_UNMYEONG_API_ORIGIN?.replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return window.location.origin;
    }
    if (!hostname.includes("unmyeongbiseo")) {
      return "https://www.unmyeongbiseo.kr";
    }
    return window.location.origin;
  }

  return "";
}

export async function fetchTodayOneLiner(payload: {
  year: number;
  month: number;
  day: number;
  gender: "남" | "여";
}): Promise<TodayOneLiner> {
  const origin = getLandingApiOrigin();
  const res = await fetch(`${origin}/api/landing-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      year: payload.year,
      month: payload.month,
      day: payload.day,
      isLunar: false,
      gender: payload.gender,
    }),
  });

  const json = (await res.json()) as {
    error?: string;
    sentence?: string;
    toneLabel?: string;
  };

  if (!res.ok) {
    throw new Error(json.error || "오늘의 흐름을 불러오지 못했어요.");
  }

  const sentence = json.sentence?.trim();
  if (!sentence) {
    throw new Error("결과를 만들지 못했어요.");
  }

  return {
    sentence,
    toneLabel: json.toneLabel?.trim() || "오늘의 결",
  };
}
