import { buildDailyFortuneContent } from "@/lib/today-content-engine";
import type { ToneKey, UserSajuProfile } from "@/lib/today-tone-types";
import {
  getKstWeekdayShort,
  getTodayDateKeyKst,
  kstDateAnchor,
  shiftKstDateKey,
} from "@/lib/kst-date";

export type TomorrowPreviewData = {
  dateKey: string;
  dateLabel: string;
  toneLabel: string;
  keywords: string[];
};

/** 내일 운세 미리보기 — 명리 계산 안내 */
export const TOMORROW_PREVIEW_BASIS_NOTE =
  "내일운세는 생년월일·태어난 시(時)까지 반영한 명리 계산 기반입니다";

function formatKstDateLabelFromKey(dateKey: string) {
  const y = Number(dateKey.slice(0, 4));
  const m = Number(dateKey.slice(4, 6));
  const d = Number(dateKey.slice(6, 8));
  if (!y || !m || !d) return "내일";
  const weekday = getKstWeekdayShort(dateKey);
  return `${y}년 ${m}월 ${d}일 (${weekday}요일)`;
}

function tomorrowKstAnchor(fromInstant = new Date()) {
  const tomorrowKey = shiftKstDateKey(getTodayDateKeyKst(fromInstant), 1);
  const y = Number(tomorrowKey.slice(0, 4));
  const m = Number(tomorrowKey.slice(4, 6));
  const d = Number(tomorrowKey.slice(6, 8));
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0)).getUTCDay();
  return {
    dateKey: tomorrowKey,
    date: kstDateAnchor({ year: y, month: m, day: d, dayOfWeek }),
  };
}

function pickKeywords(
  timeSlots: { keyword: string }[],
  toneLabel: string,
  seedKey: string,
): string[] {
  const fromSlots = timeSlots
    .map((slot) => slot.keyword?.trim())
    .filter((keyword): keyword is string => Boolean(keyword));

  const unique = [...new Set(fromSlots)];
  if (unique.length >= 2) {
    return [unique[0], unique[unique.length > 2 ? 2 : 1]];
  }
  if (unique.length === 1) {
    return [unique[0], toneLabel];
  }
  return [toneLabel];
}

/** 내일 운세 미리보기 — 날짜·결·키워드 1~2개만 */
export function buildTomorrowPreview(
  profile: UserSajuProfile = {},
  fromInstant = new Date(),
  todayToneKey?: ToneKey,
): TomorrowPreviewData {
  const { dateKey, date } = tomorrowKstAnchor(fromInstant);
  const tomorrowReport = buildDailyFortuneContent(date, profile, {
    yesterdayTone: todayToneKey,
  });

  return {
    dateKey,
    dateLabel: formatKstDateLabelFromKey(dateKey),
    toneLabel: tomorrowReport.toneLabel,
    keywords: pickKeywords(tomorrowReport.timeSlots, tomorrowReport.toneLabel, tomorrowReport.seedKey),
  };
}

/** API 응답 필드에서 사주 프로필 추출 */
export function profileFromTodayApiResult(result: {
  todaySipsin?: string;
  myElement?: string;
} | null | undefined): UserSajuProfile {
  if (!result?.todaySipsin && !result?.myElement) return {};
  return {
    sipsin: result.todaySipsin,
    dayElement: result.myElement,
  };
}

/** KST 기준 내일 날짜 라벨 (표시용) */
export function getTomorrowDateLabel(fromInstant = new Date()) {
  const { dateKey } = tomorrowKstAnchor(fromInstant);
  return formatKstDateLabelFromKey(dateKey);
}
