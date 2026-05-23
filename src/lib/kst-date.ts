/** 한국 표준시(KST, UTC+9) 기준 날짜 — 운세 「오늘」 계산용 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export type KstDateParts = {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
};

/** instant 기준 KST 달력 날짜 */
export function getKstDateParts(instant = new Date()): KstDateParts {
  const kst = new Date(instant.getTime() + KST_OFFSET_MS);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    dayOfWeek: kst.getUTCDay(),
  };
}

/** YYYYMMDD (KST) */
export function getTodayDateKeyKst(instant = new Date()): string {
  const { year, month, day } = getKstDateParts(instant);
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

/** 톤·콘텐츠 엔진용 Date 앵커 (해당 KST 날 정오 근처) */
export function kstDateAnchor(parts: KstDateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 3, 0, 0, 0));
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatKstDateLabel(instant = new Date()): string {
  const { year, month, day, dayOfWeek } = getKstDateParts(instant);
  return `${year}년 ${month}월 ${day}일 (${WEEKDAY_KO[dayOfWeek]}요일)`;
}
