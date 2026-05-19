import type { ToneKey } from "@/lib/today-tone-types";
import { buildToneTransitionComment } from "@/lib/today-tone-engine";

export function clampScore(value: number) {
  return Math.max(20, Math.min(99, Math.round(value)));
}

export function getTodayStatus(score: number) {
  if (score >= 85) return "상승";
  if (score >= 70) return "안정";
  if (score >= 55) return "보통";
  return "주의";
}

export function hashText(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

export function getScoreInterpretation(overall: number, status: string) {
  if (status === "상승") return "흐름은 좋지만, 말의 방향이 중요합니다.";
  if (status === "안정") return "무리하지 않으면 오늘의 결을 지키기 쉽습니다.";
  if (status === "보통") return "속도보다 순서를 맞추는 편이 유리합니다.";
  return "오늘은 판단보다 조율이 먼저입니다.";
}

export function buildAreaScores(scores: Record<string, number | undefined>, overall: number) {
  return [
    { key: "relation", label: "관계", score: clampScore(scores.love ?? overall) },
    { key: "decision", label: "결정", score: clampScore(scores.career ?? overall + 2) },
    { key: "emotion", label: "감정 안정", score: clampScore(scores.health ?? overall - 6) },
  ];
}

export function buildYesterdayComparisons(seedKey: string, areas: { key: string; label: string; score: number }[]) {
  const seed = hashText(seedKey);
  return areas.map((area, index) => {
    const raw = ((seed >> (index * 4)) % 25) - 10;
    const delta = raw === 0 ? (index % 2 === 0 ? 5 : -4) : raw;
    return { ...area, delta, previousScore: clampScore(area.score - delta), isReal: false };
  });
}

export function buildYesterdayComparisonsFromRecords(
  areas: { key: string; label: string; score: number }[],
  previousRecord: SavedTodayRecord | undefined,
  seedKey: string,
): YesterdayComparison[] {
  if (!previousRecord) {
    return buildYesterdayComparisons(seedKey, areas);
  }

  return areas.map((area) => {
    const previousScore = clampScore(previousRecord.areas?.[area.key as keyof NonNullable<SavedTodayRecord["areas"]>] ?? previousRecord.overall);
    const delta = area.score - previousScore;
    return {
      ...area,
      delta,
      previousScore,
      isReal: Boolean(previousRecord.areas),
    };
  });
}

export function buildOverallComparison(
  previousRecord: SavedTodayRecord | undefined,
  currentOverall: number,
) {
  if (!previousRecord) return null;
  const delta = currentOverall - previousRecord.overall;
  return {
    previousOverall: previousRecord.overall,
    previousStatus: previousRecord.status || getTodayStatus(previousRecord.overall),
    previousDateKey: previousRecord.dateKey,
    delta,
    isReal: true,
  };
}

export function buildComparisonInsight(
  overallComparison: ReturnType<typeof buildOverallComparison>,
  comparisons: YesterdayComparison[],
  currentStatus: string,
  options?: { previousToneKey?: ToneKey; currentToneKey?: ToneKey },
) {
  if (options?.previousToneKey && options?.currentToneKey) {
    return buildToneTransitionComment(options.previousToneKey, options.currentToneKey);
  }

  if (!overallComparison) {
    const best = [...comparisons].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
    const msg = YESTERDAY_MESSAGES[best?.key ?? ""];
    if (!best || !msg) return "오늘은 어제와 다른 리듬으로 읽힙니다.";
    return best.delta >= 0 ? msg.up : msg.down;
  }

  const { delta, previousDateKey } = overallComparison;
  const dateLabel = formatHistoryDate(previousDateKey);
  const strongest = [...comparisons].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const areaHint = strongest && Math.abs(strongest.delta) >= 3
    ? ` 특히 ${strongest.label} 흐름이 ${strongest.delta >= 0 ? "올라갔습니다" : "조율이 필요합니다"}.`
    : "";

  if (delta >= 8) return `어제(${dateLabel})보다 전반 흐름이 눈에 띄게 좋아졌습니다.${areaHint}`;
  if (delta >= 3) return `어제(${dateLabel})보다 조금 더 여유 있는 날입니다.${areaHint}`;
  if (delta <= -8) return `어제(${dateLabel})보다 속도를 늦추고 조율하는 편이 좋습니다.${areaHint}`;
  if (delta <= -3) return `어제(${dateLabel})보다 판단보다 순서가 중요합니다.${areaHint}`;
  if (currentStatus === "주의") return `어제(${dateLabel})와 비슷하지만, 오늘은 조율이 먼저입니다.${areaHint}`;
  return `어제(${dateLabel})와 비슷한 리듬이 이어집니다.${areaHint}`;
}

export function buildThreeDayTrendFromHistory(
  records: SavedTodayRecord[],
  currentDateKey: string,
  birthKey: string,
  currentOverall: number,
  currentStatus: string,
  seedKey: string,
): ThreeDayTrendItem[] {
  const userRecords = records
    .filter((item) => item.birthKey === birthKey && item.dateKey <= currentDateKey)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const fallback = buildThreeDayTrend(seedKey).map((item) => ({ ...item, isReal: false }));
  const yesterdayRecord = userRecords.find((item) => item.dateKey < currentDateKey);
  const dayBeforeRecord = userRecords.find((item) => item.dateKey < (yesterdayRecord?.dateKey ?? currentDateKey));

  return [
    dayBeforeRecord
      ? {
          label: "그제",
          status: dayBeforeRecord.status || getTodayStatus(dayBeforeRecord.overall),
          score: dayBeforeRecord.overall,
          isReal: true,
          dateKey: dayBeforeRecord.dateKey,
        }
      : fallback[0],
    yesterdayRecord
      ? {
          label: "어제",
          status: yesterdayRecord.status || getTodayStatus(yesterdayRecord.overall),
          score: yesterdayRecord.overall,
          isReal: true,
          dateKey: yesterdayRecord.dateKey,
        }
      : fallback[1],
    {
      label: "오늘",
      status: currentStatus,
      score: currentOverall,
      isReal: true,
      dateKey: currentDateKey,
    },
  ];
}

const YESTERDAY_MESSAGES: Record<string, { up: string; down: string }> = {
  relation: {
    up: "어제보다 관계의 온도가 부드러워졌습니다.",
    down: "어제보다 관계에서 말의 결을 더 세워야 합니다.",
  },
  decision: {
    up: "어제보다 결정의 선명도가 올라갔습니다.",
    down: "어제보다 결정을 한 박자 늦추는 편이 좋습니다.",
  },
  emotion: {
    up: "어제보다 감정의 중심이 더 안정적입니다.",
    down: "어제보다 감정의 흔들림에 주의가 필요합니다.",
  },
};

export function buildYesterdayHeadline(comparisons: ReturnType<typeof buildYesterdayComparisons>) {
  const best = [...comparisons].sort((a, b) => b.delta - a.delta)[0];
  const msg = YESTERDAY_MESSAGES[best.key];
  if (!msg) return "오늘은 어제와 다른 리듬으로 읽힙니다.";
  return best.delta >= 0 ? msg.up : msg.down;
}

export function buildThreeDayTrend(seedKey: string) {
  const seed = hashText(seedKey);
  const labels = ["그제", "어제", "오늘"];
  const statuses = ["보통", "안정", "상승", "주의"] as const;
  return labels.map((label, index) => ({
    label,
    status: statuses[(seed + index * 3) % statuses.length],
    score: clampScore(58 + ((seed >> (index * 2)) % 28)),
    isReal: false,
  }));
}

export function splitGuideLines(text: string, max = 2) {
  const parts = text
    .split(/[,·]|(?:\s+(?=그리고|또|대신|하지만))/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return [text];
  return parts.slice(0, max);
}

const TODAY_HISTORY_KEY = "unmyeong-today-history";

export type SavedTodayRecord = {
  savedAt: string;
  dateKey: string;
  overall: number;
  sentence: string;
  birthKey: string;
  status?: string;
  flow?: string;
  toneKey?: import("@/lib/today-tone-types").ToneKey;
  toneLabel?: string;
  saveSentence?: string;
  areas?: {
    relation: number;
    decision: number;
    emotion: number;
    balance?: number;
  };
};

export type YesterdayComparison = {
  key: string;
  label: string;
  score: number;
  delta: number;
  previousScore: number;
  isReal: boolean;
};

export type ThreeDayTrendItem = {
  label: string;
  status: string;
  score: number;
  isReal: boolean;
  dateKey?: string;
};

function parseHistory(raw: string | null): SavedTodayRecord[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as SavedTodayRecord[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getTodayHistory(): SavedTodayRecord[] {
  if (typeof window === "undefined") return [];
  return parseHistory(window.localStorage.getItem(TODAY_HISTORY_KEY));
}

export function saveTodayRecord(record: SavedTodayRecord) {
  if (typeof window === "undefined") return false;
  try {
    const list = getTodayHistory();
    const next = [
      { ...record, savedAt: record.savedAt || new Date().toISOString() },
      ...list.filter((item) => item.dateKey !== record.dateKey || item.birthKey !== record.birthKey),
    ].slice(0, 30);
    window.localStorage.setItem(TODAY_HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function deleteTodayRecord(dateKey: string, birthKey: string) {
  if (typeof window === "undefined") return false;
  try {
    const next = getTodayHistory().filter((item) => item.dateKey !== dateKey || item.birthKey !== birthKey);
    window.localStorage.setItem(TODAY_HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function hasSavedToday(dateKey: string, birthKey: string) {
  return getTodayHistory().some((item) => item.dateKey === dateKey && item.birthKey === birthKey);
}

export function formatHistoryDate(dateKey: string) {
  if (dateKey.length !== 8) return dateKey;
  const year = dateKey.slice(0, 4);
  const month = dateKey.slice(4, 6);
  const day = dateKey.slice(6, 8);
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${year}.${month}.${day} (${weekdays[date.getDay()]})`;
}

export function getRecentTrend(records: SavedTodayRecord[], days = 7) {
  const sorted = [...records].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const uniqueByDate = sorted.filter(
    (item, index, arr) => arr.findIndex((entry) => entry.dateKey === item.dateKey) === index,
  );
  return uniqueByDate.slice(0, days).reverse();
}

export function getHistoryStats(records: SavedTodayRecord[]) {
  const uniqueDates = new Set(records.map((item) => item.dateKey));
  return {
    todayCount: records.length,
    dayCount: uniqueDates.size,
    sajuCount: 0,
  };
}

export function getUnifiedArchiveStats(todayRecords: SavedTodayRecord[], sajuCount: number, tarotCount: number) {
  const base = getHistoryStats(todayRecords);
  return {
    ...base,
    sajuCount,
    tarotCount,
    totalCount: base.todayCount + sajuCount + tarotCount,
  };
}

export function getPreviousDayRecord(records: SavedTodayRecord[], currentDateKey: string, birthKey: string) {
  return records
    .filter((item) => item.birthKey === birthKey && item.dateKey < currentDateKey)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))[0];
}

export function buildRealYesterdayHeadline(
  previous: SavedTodayRecord | undefined,
  currentOverall: number,
  currentStatus: string,
) {
  if (!previous) return null;
  const delta = currentOverall - previous.overall;
  if (delta >= 5) return `어제(${formatHistoryDate(previous.dateKey)})보다 흐름이 더 부드러워졌습니다.`;
  if (delta <= -5) return `어제(${formatHistoryDate(previous.dateKey)})보다 조율이 더 필요한 날입니다.`;
  if (currentStatus === "주의") return "어제보다 판단보다 조율이 중요합니다.";
  return `어제(${formatHistoryDate(previous.dateKey)})와 비슷한 리듬이 이어집니다.`;
}
