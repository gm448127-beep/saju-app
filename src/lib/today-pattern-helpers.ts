import {
  HISTORY_PAGE_EMPTY_COPY,
  HOME_WEEKLY_COPY,
  WEEK_INSIGHT_COPY,
  type HistoryFilter,
} from "@/lib/history-copy";
import type { ToneKey } from "@/lib/today-tone-types";
import { buildToneTransitionComment } from "@/lib/today-tone-engine";
import {
  formatHistoryDate,
  getTodayStatus,
  type SavedTodayRecord,
} from "@/lib/today-report-helpers";

export type { HistoryFilter } from "@/lib/history-copy";

export type ToneCluster = {
  label: string;
  toneKey?: ToneKey;
  count: number;
};

export type DayFlowItem = {
  dateKey: string;
  shortDate: string;
  weekday: string;
  toneLabel: string;
  toneKey?: ToneKey;
  overall: number;
  dotsFilled: number;
  hasRecord: boolean;
};

export type SavedSentenceItem = {
  text: string;
  dateKey: string;
  shortDate: string;
  toneLabel: string;
  toneKey?: ToneKey;
};

/** 오늘 날짜 키 (YYYYMMDD) */
export function getTodayDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** URL용 날짜 (YYYY-MM-DD) ↔ 저장 키 (YYYYMMDD) */
export function dateKeyToSlug(dateKey: string) {
  if (dateKey.length !== 8) return dateKey;
  return `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`;
}

export function slugToDateKey(slug: string) {
  return slug.replace(/-/g, "");
}

export function formatShortDate(dateKey: string) {
  if (dateKey.length !== 8) return dateKey;
  return `${dateKey.slice(4, 6)}.${dateKey.slice(6, 8)}`;
}

export function getWeekdayShort(dateKey: string) {
  if (dateKey.length !== 8) return "";
  const y = Number(dateKey.slice(0, 4));
  const m = Number(dateKey.slice(4, 6)) - 1;
  const d = Number(dateKey.slice(6, 8));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return weekdays[new Date(y, m, d).getDay()];
}

/** 날짜별 최신 기록만 유지 */
export function dedupeRecordsByDate(records: SavedTodayRecord[]) {
  const map = new Map<string, SavedTodayRecord>();
  const sorted = [...records].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  for (const record of sorted) {
    if (!map.has(record.dateKey)) {
      map.set(record.dateKey, record);
    }
  }
  return [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function filterRecordsInDays(records: SavedTodayRecord[], days: number) {
  const deduped = dedupeRecordsByDate(records);
  if (days <= 0) return deduped;
  const today = getTodayDateKey();
  const todayDate = parseDateKey(today);
  const cutoff = new Date(todayDate);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffKey = formatDateKey(cutoff);
  return deduped.filter((r) => r.dateKey >= cutoffKey);
}

function parseDateKey(dateKey: string) {
  const y = Number(dateKey.slice(0, 4));
  const m = Number(dateKey.slice(4, 6)) - 1;
  const d = Number(dateKey.slice(6, 8));
  return new Date(y, m, d);
}

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 종합 점수 → 5단계 도트 (1~5) */
export function scoreToDotsFilled(score: number) {
  return Math.max(1, Math.min(5, Math.ceil(score / 20)));
}

export function buildToneClusters(records: SavedTodayRecord[], days = 30): ToneCluster[] {
  const scoped = filterRecordsInDays(records, days);
  const counts = new Map<string, ToneCluster>();

  for (const record of scoped) {
    const label = record.toneLabel || record.status || "흐름";
    const key = record.toneKey ?? label;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label, toneKey: record.toneKey, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export function buildTopToneLabels(records: SavedTodayRecord[], limit = 3, days = 7) {
  return buildToneClusters(records, days)
    .slice(0, limit)
    .map((c) => c.label);
}

const BALANCE_TONES: ToneKey[] = ["ORGANIZE", "TUNE"];
const MOVE_TONES: ToneKey[] = ["RISE", "DECIDE"];
const REST_TONES: ToneKey[] = ["RECOVER", "DISTANCE"];

/** 최근 7일 결 분포 기반 보조 한 줄 */
export function buildWeekInsight(records: SavedTodayRecord[]) {
  const scoped = filterRecordsInDays(records, 7);
  if (scoped.length === 0) {
    return WEEK_INSIGHT_COPY.warmup;
  }
  if (scoped.length === 1) {
    return WEEK_INSIGHT_COPY.oneDay;
  }

  const toneKeys = scoped.map((r) => r.toneKey).filter(Boolean) as ToneKey[];
  const unique = new Set(toneKeys);

  const balanceCount = toneKeys.filter((k) => BALANCE_TONES.includes(k)).length;
  const moveCount = toneKeys.filter((k) => MOVE_TONES.includes(k)).length;
  const restCount = toneKeys.filter((k) => REST_TONES.includes(k)).length;

  if (unique.size >= 4) {
    return WEEK_INSIGHT_COPY.volatile;
  }
  if (balanceCount >= Math.ceil(scoped.length * 0.5)) {
    return WEEK_INSIGHT_COPY.balance;
  }
  if (moveCount >= Math.ceil(scoped.length * 0.5)) {
    return WEEK_INSIGHT_COPY.move;
  }
  if (restCount >= Math.ceil(scoped.length * 0.5)) {
    return WEEK_INSIGHT_COPY.rest;
  }
  if (unique.size <= 2) {
    return WEEK_INSIGHT_COPY.calm;
  }
  return WEEK_INSIGHT_COPY.mixed;
}

/** 최근 7일(캘린더) 흐름 행 */
export function buildLast7DaysFlow(records: SavedTodayRecord[]): DayFlowItem[] {
  const dedupedMap = new Map(dedupeRecordsByDate(records).map((r) => [r.dateKey, r]));
  const today = parseDateKey(getTodayDateKey());
  const items: DayFlowItem[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d);
    const record = dedupedMap.get(dateKey);
    const overall = record?.overall ?? 0;
    items.push({
      dateKey,
      shortDate: formatShortDate(dateKey),
      weekday: getWeekdayShort(dateKey),
      toneLabel: record?.toneLabel || (record ? getTodayStatus(record.overall) : "—"),
      toneKey: record?.toneKey,
      overall,
      dotsFilled: record ? scoreToDotsFilled(overall) : 0,
      hasRecord: Boolean(record),
    });
  }

  return items;
}

export function buildSavedSentencesArchive(records: SavedTodayRecord[]): SavedSentenceItem[] {
  return dedupeRecordsByDate(records)
    .filter((r) => r.saveSentence?.trim())
    .map((r) => ({
      text: r.saveSentence!.trim(),
      dateKey: r.dateKey,
      shortDate: formatShortDate(r.dateKey),
      toneLabel: r.toneLabel || getTodayStatus(r.overall),
      toneKey: r.toneKey,
    }));
}

/** 어제 → 오늘 결 비교 한 줄 */
export function buildTodayTransitionLine(records: SavedTodayRecord[]) {
  const deduped = dedupeRecordsByDate(records);
  if (deduped.length < 2) return null;

  const todayKey = getTodayDateKey();
  const today = deduped.find((r) => r.dateKey === todayKey) ?? deduped[0];
  const yesterday = deduped.find((r) => r.dateKey < today.dateKey);

  if (!yesterday) return null;
  if (today.toneKey && yesterday.toneKey) {
    return buildToneTransitionComment(yesterday.toneKey, today.toneKey);
  }
  return `어제(${formatHistoryDate(yesterday.dateKey)})의 흐름에서 오늘의 결이 이어집니다.`;
}

export function filterTodayRecords(
  records: SavedTodayRecord[],
  filter: HistoryFilter,
  toneFilter: string | null,
) {
  let list = dedupeRecordsByDate(records);

  if (filter === "today") {
    const todayKey = getTodayDateKey();
    list = list.filter((r) => r.dateKey === todayKey);
  } else if (filter === "saju") {
    list = list.filter((r) => Boolean(r.birthKey));
  } else if (filter === "saved") {
    list = list.filter((r) => r.saveSentence?.trim());
  } else if (filter === "rising") {
    list = list.filter((r) => (r.status || getTodayStatus(r.overall)) === "상승" || r.overall >= 85);
  }

  if (toneFilter) {
    list = list.filter((r) => r.toneLabel === toneFilter || r.toneKey === toneFilter);
  }

  return list;
}

const WEEKDAY_FULL = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"] as const;

/** 월요일=0 기준 오늘 요일 인덱스 */
export function getMondayBasedDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

export type HomeWeeklyCard = {
  trend: number[];
  highlightIndex: number;
  text: string;
  href: string;
};

/** 홈 WEEKLY 카드 — 기록 우선, 없으면 오늘 요일·결 */
export function buildHomeWeeklyCard(
  records: SavedTodayRecord[],
  today: { toneLabel: string; overall: number },
  date = new Date(),
): HomeWeeklyCard {
  const todayIndex = getMondayBasedDayIndex(date);
  const todayDay = WEEKDAY_FULL[todayIndex];
  const last7 = buildLast7DaysFlow(records);
  const recordCount = dedupeRecordsByDate(records).length;

  const softTrend = last7.map((day, index) => {
    if (day.hasRecord) return day.overall;
    const soft = 38 + (index % 4) * 4;
    return index === todayIndex ? Math.max(soft, today.overall) : soft;
  });

  if (recordCount === 0) {
    const trend = softTrend.map((value, index) =>
      index === todayIndex ? Math.max(value, today.overall, 70) : value,
    );
    return {
      trend,
      highlightIndex: todayIndex,
      text: HOME_WEEKLY_COPY.todayFocus(todayDay, today.toneLabel),
      href: "/today",
    };
  }

  if (recordCount < 3) {
    return {
      trend: softTrend,
      highlightIndex: todayIndex,
      text: HOME_WEEKLY_COPY.warmup(todayDay, today.toneLabel, 3 - recordCount),
      href: "/today",
    };
  }

  let keyIndex = todayIndex;
  let bestScore = -1;
  let bestDateKey = "";
  last7.forEach((day, index) => {
    if (!day.hasRecord) return;
    if (day.overall > bestScore || (day.overall === bestScore && day.dateKey > bestDateKey)) {
      bestScore = day.overall;
      bestDateKey = day.dateKey;
      keyIndex = index;
    }
  });

  const trend = last7.map((day) => (day.hasRecord ? day.overall : 34));

  let text = buildWeekInsight(records);
  if (keyIndex === todayIndex) {
    const toneLabel = last7[todayIndex]?.hasRecord ? last7[todayIndex].toneLabel : today.toneLabel;
    text = HOME_WEEKLY_COPY.todayIsCenter(todayDay, toneLabel);
  } else if (text === WEEK_INSIGHT_COPY.warmup || text === WEEK_INSIGHT_COPY.oneDay) {
    text = HOME_WEEKLY_COPY.keyDayCenter(WEEKDAY_FULL[keyIndex]);
  }

  return {
    trend,
    highlightIndex: keyIndex,
    text,
    href: "/history",
  };
}

export function getPatternEmptyState(records: SavedTodayRecord[]) {
  const dayCount = dedupeRecordsByDate(records).length;
  if (dayCount === 0) {
    return {
      headline: HISTORY_PAGE_EMPTY_COPY.headline,
      body: HISTORY_PAGE_EMPTY_COPY.body,
      showCta: true,
    };
  }
  if (dayCount < 3) {
    return {
      headline: HISTORY_PAGE_EMPTY_COPY.partialHeadline,
      body: HISTORY_PAGE_EMPTY_COPY.partialBody(3 - dayCount),
      showCta: false,
    };
  }
  return null;
}
