/** 랜딩 미리보기 — 오늘의 한 줄 API */

import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { storedBirthToApiPayload } from "@/lib/landing-birth-payload";
import type { StoredLandingBirth } from "@/lib/landing-preview-storage";
import {
  buildSheetFromApi,
  landingBirthKeyFromStored,
  type LandingTodaySheetData,
} from "@/lib/landing-today-sheet";

export type TodayOneLiner = {
  sentence: string;
  toneLabel: string;
};

export type { LandingTodaySheetData };

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

export async function fetchTodayOneLiner(birth: StoredLandingBirth): Promise<TodayOneLiner> {
  const payload = storedBirthToApiPayload(birth);
  const origin = getLandingApiOrigin();
  const res = await fetch(`${origin}/api/landing-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

/** 이메일 등록 후 — 오늘의 운세 한 장 리포트 */
export async function fetchTodayReport(birth: StoredLandingBirth): Promise<LandingTodaySheetData> {
  const payload = storedBirthToApiPayload(birth);
  const origin = getLandingApiOrigin();
  const res = await fetch(`${origin}/api/today`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as {
    error?: string;
    date?: string;
    scores?: { overall?: number };
    dailyReport?: DailyFortuneContent;
  } & Record<string, unknown>;

  if (!res.ok) {
    throw new Error(json.error || "오늘의 리포트를 불러오지 못했어요.");
  }

  return buildSheetFromApi(json, landingBirthKeyFromStored(birth));
}
