/** 오늘 운세 점수 표시 — API(명리) 단일 출처 */

import type { AxisScoreArea } from "@/components/AxisScorePanel";

export type TodayApiScores = {
  overall: number;
  wealth?: number;
  love?: number;
  career?: number;
  health?: number;
  luck?: number;
};

export function clampFortuneScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

/** API 5축 → 화면 4축(관계·결정·감정·균형) */
export function apiScoresToAxisAreas(scores: TodayApiScores): AxisScoreArea[] {
  const overall = clampFortuneScore(scores.overall);
  const love = clampFortuneScore(scores.love ?? overall);
  const career = clampFortuneScore(scores.career ?? overall);
  const health = clampFortuneScore(scores.health ?? overall);
  const wealth = clampFortuneScore(scores.wealth ?? overall);
  const luck = clampFortuneScore(scores.luck ?? overall);

  return [
    { key: "relation", label: "관계", score: love },
    { key: "decision", label: "결정", score: career },
    { key: "emotion", label: "감정", score: health },
    { key: "balance", label: "균형", score: clampFortuneScore(Math.round((wealth + luck) / 2)) },
  ];
}

export type TodayFetchPayload = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  gender: string;
  isLunar?: boolean;
};

export function serializeTodayPayload(payload: TodayFetchPayload): string {
  const h = payload.hour ?? "";
  const m = payload.minute ?? "";
  return [
    payload.year,
    payload.month,
    payload.day,
    payload.gender,
    payload.isLunar ? "lunar" : "solar",
    h,
    m,
  ].join("-");
}

export function formatPayloadSummary(payload: TodayFetchPayload): string {
  const date = `${payload.year}.${payload.month}.${payload.day}`;
  const cal = payload.isLunar ? "음력" : "양력";
  const time =
    payload.hour === undefined
      ? "출생시간 없음"
      : `출생 ${payload.hour}시${payload.minute ? ` ${payload.minute}분` : ""}`;
  return `${date} · ${payload.gender} · ${cal} · ${time}`;
}

/** 오늘 기록·히스토리 매칭용 birthKey */
export function birthKeyFromTodayPayload(payload: TodayFetchPayload): string {
  const timePart =
    payload.hour !== undefined ? `-h${payload.hour}m${payload.minute ?? 0}` : "-noHour";
  return `${payload.year}-${payload.month}-${payload.day}-${payload.gender}${timePart}`;
}
